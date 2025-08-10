const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// JWT Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. Invalid token format.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user in database
    const user = await User.findByPk(decoded.id || decoded.userId, {
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'isVerified']
    });

    if (!user) {
      return res.status(401).json({
        error: 'Access denied. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access denied. Account is inactive.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    logger.logAPI(
      req.method,
      req.originalUrl,
      200,
      0,
      user.id
    );

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.logSecurity('Invalid JWT token', null, req.ip, {
        error: error.message,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({
        error: 'Access denied. Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      logger.logSecurity('Expired JWT token', null, req.ip, {
        error: error.message
      });
      return res.status(401).json({
        error: 'Access denied. Token expired.'
      });
    }

    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error.'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.userId = null;
      req.userRole = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.user = null;
      req.userId = null;
      req.userRole = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id || decoded.userId, {
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'isVerified']
    });

    if (user && user.isActive) {
      req.user = user;
      req.userId = user.id;
      req.userRole = user.role;
    } else {
      req.user = null;
      req.userId = null;
      req.userRole = null;
    }

    next();

  } catch (error) {
    // For optional auth, continue even if token is invalid
    req.user = null;
    req.userId = null;
    req.userRole = null;
    next();
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied. Authentication required.'
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];

    if (!userRoles.includes(req.userRole)) {
      logger.logSecurity('Unauthorized role access', req.userId, req.ip, {
        requiredRoles: userRoles,
        userRole: req.userRole,
        endpoint: req.originalUrl
      });

      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = requireRole('admin');

// Agent or admin middleware
const requireAgentOrAdmin = requireRole(['agent', 'admin']);

// Conversation participant authorization
const requireConversationParticipant = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    const conversationId = req.params.conversationId || req.body.conversationId;

    if (!conversationId) {
      return res.status(400).json({
        error: 'Conversation ID required.'
      });
    }

    const { ConversationParticipant } = require('../models');

    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId: req.userId,
        isActive: true
      }
    });

    if (!participant) {
      logger.logSecurity('Unauthorized conversation access', req.userId, req.ip, {
        conversationId,
        endpoint: req.originalUrl
      });

      return res.status(403).json({
        error: 'Access denied. Not a participant in this conversation.'
      });
    }

    req.conversationParticipant = participant;
    next();

  } catch (error) {
    logger.error('Conversation authorization error:', error);
    return res.status(500).json({
      error: 'Authorization error.'
    });
  }
};

// Rate limiting helpers
const createRateLimitKey = (req, identifier = 'ip') => {
  switch (identifier) {
    case 'user':
      return `rate_limit:user:${req.userId}`;
    case 'ip':
      return `rate_limit:ip:${req.ip}`;
    case 'endpoint':
      return `rate_limit:endpoint:${req.originalUrl}:${req.userId || req.ip}`;
    default:
      return `rate_limit:${identifier}:${req.userId || req.ip}`;
  }
};

// Custom rate limiting middleware
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each identifier to 100 requests per windowMs
    identifier = 'ip',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return async (req, res, next) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    try {
      const Redis = require('redis');
      const redisClient = req.app.locals.redisClient || Redis.createClient();

      const key = createRateLimitKey(req, identifier);
      const now = Date.now();
      const window = Math.floor(now / windowMs);
      const windowKey = `${key}:${window}`;

      const current = await redisClient.incr(windowKey);

      if (current === 1) {
        await redisClient.expire(windowKey, Math.ceil(windowMs / 1000));
      }

      const remaining = Math.max(0, max - current);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': new Date(now + windowMs)
      });

      if (current > max) {
        logger.logSecurity('Rate limit exceeded', req.userId, req.ip, {
          endpoint: req.originalUrl,
          limit: max,
          current,
          windowMs
        });

        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      next();

    } catch (error) {
      logger.error('Rate limiting error:', error);
      // Continue without rate limiting if Redis fails
      next();
    }
  };
};

// Validation middleware
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logAPI(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      req.userId
    );
  });

  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireAdmin,
  requireAgentOrAdmin,
  requireConversationParticipant,
  rateLimit,
  validateBody,
  requestLogger
};
