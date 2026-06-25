const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// In-memory storage for development
const inMemoryDB = {
  users: new Map(),
  conversations: new Map(),
  messages: new Map(),
  presence: new Map(),
  messagesByConversation: new Map()
};

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://same-t08mrgjy1io-latest.netlify.app",
      "https://procv.cv"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Express middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://same-t08mrgjy1io-latest.netlify.app",
    "https://procv.cv"
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Store active connections
const activeConnections = new Map();
const userSockets = new Map();

// Initialize demo data
function initializeData() {
  // Demo users
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

  // Demo conversation
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

  // Demo messages
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

  console.log('✅ Demo data initialized');
}

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // For development, create a simple token verification
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    } catch (error) {
      // For demo purposes, create a basic decoded token
      decoded = { id: 'user-1', role: 'buyer', name: 'Demo User' };
    }

    socket.userId = decoded.id || decoded.userId || 'user-1';
    socket.userRole = decoded.role || 'buyer';
    socket.userName = decoded.name || `User ${socket.userId}`;

    console.log(`User ${socket.userId} authenticated for socket ${socket.id}`);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Invalid authentication token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const { userId, userRole, userName } = socket;

  console.log(`🔌 User ${userId} (${userName}) connected with socket ${socket.id}`);

  // Store connection
  activeConnections.set(socket.id, {
    userId,
    userRole,
    userName,
    connectedAt: new Date(),
    lastActivity: new Date()
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

  // Message handling
  socket.on('send_message', (data) => {
    const { conversationId, content, type = 'text' } = data;

    if (!conversationId || !content) {
      socket.emit('error', { message: 'Missing required fields' });
      return;
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      conversationId,
      senderId: userId,
      senderName: userName,
      content,
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

    console.log(`📩 Message sent by ${userName} in conversation ${conversationId}`);
  });

  // Join conversation
  socket.on('join_conversation', (data) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.join(`conversation:${conversationId}`);
      console.log(`👥 User ${userName} joined conversation ${conversationId}`);
    }
  });

  // Leave conversation
  socket.on('leave_conversation', (data) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.leave(`conversation:${conversationId}`);
      console.log(`👋 User ${userName} left conversation ${conversationId}`);
    }
  });

  // Typing indicators
  socket.on('typing_start', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      userId,
      userName,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      userId,
      userName,
      isTyping: false
    });
  });

  // Heartbeat
  socket.on('ping', () => {
    socket.emit('pong');
    if (activeConnections.has(socket.id)) {
      activeConnections.get(socket.id).lastActivity = new Date();
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User ${userId} disconnected: ${reason}`);

    activeConnections.delete(socket.id);

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

// REST API routes
app.get('/api/conversations', (req, res) => {
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
});

app.get('/api/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const messages = inMemoryDB.messagesByConversation.get(conversationId) || [];

  res.json({
    success: true,
    messages: messages.slice(-50), // Last 50 messages
    total: messages.length,
    conversationId
  });
});

app.post('/api/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const { content, type = 'text' } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Message content required' });
  }

  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const message = {
    id: messageId,
    conversationId,
    senderId: 'user-1', // Default for API calls
    senderName: 'Demo User',
    content,
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
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size,
    activeUsers: userSockets.size,
    totalUsers: inMemoryDB.users.size,
    totalConversations: inMemoryDB.conversations.size,
    totalMessages: inMemoryDB.messages.size,
    uptime: process.uptime()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize demo data
initializeData();

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ProCV Chat Server (Dev) running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 WebSocket ready for connections`);
  console.log(`📱 CORS enabled for frontend connections`);
});

module.exports = { app, server, io };
