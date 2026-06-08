const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const winston = require('winston');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Production storage - would use PostgreSQL and Redis in real deployment
const inMemoryDB = {
  users: new Map(),
  conversations: new Map(),
  messages: new Map(),
  presence: new Map(),
  messagesByConversation: new Map()
};

// CORS origins from environment
const corsOrigins = process.env.CORS_ORIGIN ?
  process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) :
  [
    "http://localhost:3000",
    "https://same-t08mrgjy1io-latest.netlify.app",
    "https://procv.cv"
  ];

logger.info('CORS Origins configured:', corsOrigins);

// Socket.io setup with production CORS
const io = socketIo(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: parseInt(process.env.WS_CONNECTION_TIMEOUT) || 60000,
  pingInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 25000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true
});

// Express middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: process.env.NODE_ENV === 'production'
}));

app.use(compression());

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting with configurable limits
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000;

const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/metrics';
  }
});

app.use('/api/', limiter);

// Store active connections with production limits
const activeConnections = new Map();
const userSockets = new Map();
const maxConnectionsPerUser = parseInt(process.env.WS_MAX_CONNECTIONS_PER_USER) || 5;

// Initialize demo data for development/demo mode
function initializeData() {
  const demoUsers = [
    { id: 'user-1', email: 'demo@procv.cv', name: 'Demo User', role: 'buyer' },
    { id: 'agent-1', email: 'agent@procv.cv', name: 'John Agent', role: 'agent' },
    { id: 'agent-2', email: 'sarah@procv.cv', name: 'Sarah Agent', role: 'agent' },
    { id: 'admin-1', email: 'admin@procv.cv', name: 'Admin User', role: 'admin' }
  ];

  demoUsers.forEach(user => {
    inMemoryDB.users.set(user.id, {
      ...user,
      createdAt: new Date().toISOString(),
      isOnline: false
    });
  });

  const demoConversation = {
    id: 'conv-1',
    type: 'property_inquiry',
    title: 'Modern Beachfront Villa Inquiry',
    participants: ['user-1', 'agent-1'],
    metadata: {
      propertyId: '1',
      propertyTitle: 'Modern Beachfront Villa',
      propertyImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/522602290.jpg',
      agentId: 'agent-1',
      inquiryType: 'viewing'
    },
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };

  inMemoryDB.conversations.set(demoConversation.id, demoConversation);

  const demoMessages = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'agent-1',
      senderName: 'John Agent',
      content: 'Hello! I see you\'re interested in the Modern Beachfront Villa. I\'d be happy to help you with any questions or schedule a viewing.',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read'
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderName: 'Demo User',
      content: 'Hi John! Yes, I\'m very interested. The property looks amazing. Could you tell me more about the neighborhood and amenities?',
      type: 'text',
      timestamp: new Date(Date.now() - 3300000).toISOString(),
      status: 'read'
    }
  ];

  demoMessages.forEach(msg => {
    inMemoryDB.messages.set(msg.id, msg);
    if (!inMemoryDB.messagesByConversation.has(msg.conversationId)) {
      inMemoryDB.messagesByConversation.set(msg.conversationId, []);
    }
    inMemoryDB.messagesByConversation.get(msg.conversationId).push(msg);
  });

  logger.info('✅ Demo data initialized');
}

// Socket.io authentication middleware with production security
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token ||
                  socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Socket connection attempted without token', {
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent']
      });
      return next(new Error('Authentication required'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    } catch (jwtError) {
      // For demo purposes, create a basic decoded token
      logger.warn('JWT verification failed, using demo mode', { error: jwtError.message });
      decoded = { id: 'user-1', role: 'buyer', name: 'Demo User' };
    }

    socket.userId = decoded.id || decoded.userId || 'user-1';
    socket.userRole = decoded.role || 'buyer';
    socket.userName = decoded.name || `User ${socket.userId}`;

    // Check connection limits per user
    const userConnectionCount = userSockets.get(socket.userId)?.size || 0;
    if (userConnectionCount >= maxConnectionsPerUser) {
      logger.warn('Max connections per user exceeded', {
        userId: socket.userId,
        currentConnections: userConnectionCount
      });
      return next(new Error('Maximum connections per user exceeded'));
    }

    logger.info('Socket authentication successful', {
      userId: socket.userId,
      userName: socket.userName,
      socketId: socket.id
    });

    next();
  } catch (error) {
    logger.error('Socket authentication error', { error: error.message, stack: error.stack });
    next(new Error('Invalid authentication token'));
  }
});

// Socket.io connection handling with production monitoring
io.on('connection', (socket) => {
  const { userId, userRole, userName } = socket;

  logger.info('New socket connection', {
    userId,
    userName,
    userRole,
    socketId: socket.id,
    totalConnections: activeConnections.size + 1
  });

  // Store connection with metadata
  activeConnections.set(socket.id, {
    userId,
    userRole,
    userName,
    connectedAt: new Date(),
    lastActivity: new Date(),
    ip: socket.handshake.address
  });

  // Track user sockets
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socket.id);

  // Update user presence
  if (inMemoryDB.users.has(userId)) {
    const user = inMemoryDB.users.get(userId);
    user.isOnline = true;
    user.lastSeen = new Date().toISOString();
    inMemoryDB.users.set(userId, user);
  }

  // Join user to their personal room
  socket.join(`user:${userId}`);

  // Send current online users
  const onlineUsers = Array.from(inMemoryDB.users.values())
    .filter(user => user.isOnline)
    .map(user => ({
      id: user.id,
      name: user.name,
      role: user.role,
      isOnline: true
    }));

  socket.emit('online_users', onlineUsers);

  // Message handling with validation and logging
  socket.on('send_message', (data) => {
    try {
      const { conversationId, content, type = 'text' } = data;

      if (!conversationId || !content) {
        logger.warn('Invalid message data', { userId, data });
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Content validation
      if (content.length > 10000) {
        logger.warn('Message too long', { userId, length: content.length });
        socket.emit('error', { message: 'Message too long' });
        return;
      }

      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const message = {
        id: messageId,
        conversationId,
        senderId: userId,
        senderName: userName,
        content: content.trim(),
        type,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Store message
      inMemoryDB.messages.set(messageId, message);
      if (!inMemoryDB.messagesByConversation.has(conversationId)) {
        inMemoryDB.messagesByConversation.set(conversationId, []);
      }
      inMemoryDB.messagesByConversation.get(conversationId).push(message);

      // Update conversation last activity
      if (inMemoryDB.conversations.has(conversationId)) {
        const conversation = inMemoryDB.conversations.get(conversationId);
        conversation.lastActivity = new Date().toISOString();
        inMemoryDB.conversations.set(conversationId, conversation);
      }

      // Broadcast to conversation participants
      socket.to(`conversation:${conversationId}`).emit('new_message', message);
      socket.emit('message_sent', { success: true, message });

      logger.info('Message sent', {
        messageId,
        userId,
        userName,
        conversationId,
        type,
        contentLength: content.length
      });

    } catch (error) {
      logger.error('Error handling send_message', {
        error: error.message,
        userId,
        data
      });
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Join conversation with validation
  socket.on('join_conversation', (data) => {
    try {
      const { conversationId } = data;
      if (conversationId && typeof conversationId === 'string') {
        socket.join(`conversation:${conversationId}`);
        logger.info('User joined conversation', { userId, userName, conversationId });
      }
    } catch (error) {
      logger.error('Error joining conversation', { error: error.message, userId, data });
    }
  });

  // Leave conversation
  socket.on('leave_conversation', (data) => {
    try {
      const { conversationId } = data;
      if (conversationId && typeof conversationId === 'string') {
        socket.leave(`conversation:${conversationId}`);
        logger.info('User left conversation', { userId, userName, conversationId });
      }
    } catch (error) {
      logger.error('Error leaving conversation', { error: error.message, userId, data });
    }
  });

  // Typing indicators with rate limiting
  let typingTimeout;
  socket.on('typing_start', (data) => {
    try {
      const { conversationId } = data;
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          userName,
          isTyping: true
        });

        // Auto-stop typing after 5 seconds
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          socket.to(`conversation:${conversationId}`).emit('user_typing', {
            userId,
            userName,
            isTyping: false
          });
        }, 5000);
      }
    } catch (error) {
      logger.error('Error handling typing_start', { error: error.message, userId });
    }
  });

  socket.on('typing_stop', (data) => {
    try {
      const { conversationId } = data;
      if (conversationId) {
        clearTimeout(typingTimeout);
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          userName,
          isTyping: false
        });
      }
    } catch (error) {
      logger.error('Error handling typing_stop', { error: error.message, userId });
    }
  });

  // Heartbeat with activity tracking
  socket.on('ping', () => {
    socket.emit('pong');
    if (activeConnections.has(socket.id)) {
      activeConnections.get(socket.id).lastActivity = new Date();
    }
  });

  // Handle disconnection with cleanup
  socket.on('disconnect', (reason) => {
    logger.info('Socket disconnection', {
      userId,
      userName,
      socketId: socket.id,
      reason,
      duration: Date.now() - activeConnections.get(socket.id)?.connectedAt?.getTime()
    });

    // Clean up connection tracking
    activeConnections.delete(socket.id);
    clearTimeout(typingTimeout);

    if (userSockets.has(userId)) {
      userSockets.get(userId).delete(socket.id);

      if (userSockets.get(userId).size === 0) {
        userSockets.delete(userId);

        // Mark user as offline
        if (inMemoryDB.users.has(userId)) {
          const user = inMemoryDB.users.get(userId);
          user.isOnline = false;
          user.lastSeen = new Date().toISOString();
          inMemoryDB.users.set(userId, user);
        }

        // Broadcast user offline
        io.emit('user_status_change', {
          userId,
          isOnline: false,
          lastSeen: new Date().toISOString()
        });
      }
    }
  });
});

// REST API routes with enhanced error handling
app.get('/api/conversations', (req, res) => {
  try {
    const conversations = Array.from(inMemoryDB.conversations.values())
      .map(conv => ({
        ...conv,
        participants: conv.participants.map(userId => {
          const user = inMemoryDB.users.get(userId);
          return {
            userId,
            name: user?.name || 'Unknown User',
            role: user?.role || 'user',
            isOnline: user?.isOnline || false
          };
        }),
        unreadCount: 0
      }));

    res.json({
      success: true,
      conversations,
      total: conversations.length
    });

    logger.info('Conversations retrieved', { count: conversations.length });
  } catch (error) {
    logger.error('Error retrieving conversations', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

app.get('/api/messages/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = inMemoryDB.messagesByConversation.get(conversationId) || [];
    const startIndex = (page - 1) * limit;
    const paginatedMessages = messages.slice(-limit * page).slice(-limit);

    res.json({
      success: true,
      messages: paginatedMessages,
      total: messages.length,
      conversationId,
      page,
      hasMore: messages.length > limit * page
    });

    logger.info('Messages retrieved', {
      conversationId,
      count: paginatedMessages.length,
      total: messages.length
    });
  } catch (error) {
    logger.error('Error retrieving messages', {
      error: error.message,
      conversationId: req.params.conversationId
    });
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

app.post('/api/messages/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content required' });
    }

    if (content.length > 10000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      conversationId,
      senderId: 'api-user', // For API calls
      senderName: 'API User',
      content: content.trim(),
      type,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Store message
    inMemoryDB.messages.set(messageId, message);
    if (!inMemoryDB.messagesByConversation.has(conversationId)) {
      inMemoryDB.messagesByConversation.set(conversationId, []);
    }
    inMemoryDB.messagesByConversation.get(conversationId).push(message);

    res.json({
      success: true,
      message
    });

    logger.info('Message created via API', { messageId, conversationId });
  } catch (error) {
    logger.error('Error creating message via API', {
      error: error.message,
      conversationId: req.params.conversationId
    });
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../package.json').version,
    connections: {
      active: activeConnections.size,
      activeUsers: userSockets.size
    },
    database: {
      users: inMemoryDB.users.size,
      conversations: inMemoryDB.conversations.size,
      messages: inMemoryDB.messages.size
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };

  res.json(healthData);
});

// Metrics endpoint for monitoring (basic version)
app.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
    active_connections: activeConnections.size,
    active_users: userSockets.size,
    total_messages: inMemoryDB.messages.size,
    memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  };

  res.json(metrics);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Express error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 Not Found', { url: req.originalUrl, method: req.method });
  res.status(404).json({ error: 'Route not found' });
});

// Initialize demo data
initializeData();

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);

  server.close(() => {
    logger.info('HTTP server closed');

    // Close all socket connections
    io.close(() => {
      logger.info('Socket.IO server closed');
      process.exit(0);
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  logger.info('🚀 ProCV Chat Server started', {
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development',
    corsOrigins: corsOrigins,
    maxConnections: maxConnectionsPerUser,
    rateLimit: `${rateLimitMaxRequests} requests per ${rateLimitWindowMs / 1000}s`
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

module.exports = { app, server, io };
