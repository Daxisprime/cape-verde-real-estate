const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authMiddleware, rateLimit } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/auth/validate-token - Validate JWT token
router.post('/validate-token', rateLimit({ max: 100 }), async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user in database
    const user = await User.findByPk(decoded.id || decoded.userId, {
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'isVerified', 'avatar']
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    res.json({
      valid: true,
      user: user.toSafeJSON(),
      expiresAt: new Date(decoded.exp * 1000)
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        valid: false,
        error: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        valid: false,
        error: 'Token expired'
      });
    }

    logger.error('Token validation error:', error);
    res.status(500).json({ error: 'Token validation failed' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { user } = req;

    // Get user with presence info
    const { UserPresence } = require('../models');
    const presence = await UserPresence.findOne({ where: { userId: user.id } });

    const userWithPresence = {
      ...user.toSafeJSON(),
      presence: presence ? presence.getPublicPresence() : null
    };

    res.json({ user: userWithPresence });

  } catch (error) {
    logger.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// PUT /api/auth/me - Update current user info
router.put('/me', authMiddleware, rateLimit({ max: 20 }), async (req, res) => {
  try {
    const { user } = req;
    const { name, avatar, preferences } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (avatar) updates.avatar = avatar;
    if (preferences) updates.preferences = { ...user.preferences, ...preferences };

    await user.update(updates);

    res.json({
      user: user.toSafeJSON(),
      message: 'Profile updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user info:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/auth/status - Update user status
router.put('/status', authMiddleware, rateLimit({ max: 50 }), async (req, res) => {
  try {
    const { user } = req;
    const { status, statusMessage } = req.body;

    if (!['online', 'away', 'busy', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update user status
    await user.updatePresence(status);

    // Update presence record
    const { UserPresence } = require('../models');
    const [presence] = await UserPresence.findOrCreateForUser(user.id);
    await presence.setStatus(status, statusMessage);

    res.json({
      status,
      statusMessage,
      message: 'Status updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/auth/users/online - Get online users
router.get('/users/online', authMiddleware, rateLimit({ max: 30 }), async (req, res) => {
  try {
    const onlineUsers = await User.findOnlineUsers();

    res.json({
      users: onlineUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        statusMessage: user.statusMessage
      }))
    });

  } catch (error) {
    logger.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

// GET /api/auth/users/agents - Get available agents
router.get('/users/agents', authMiddleware, rateLimit({ max: 30 }), async (req, res) => {
  try {
    const { island, online } = req.query;

    const options = {};
    if (island) options.island = island;
    if (online === 'true') options.online = true;

    const agents = await User.findAgents(options);

    res.json({ agents });

  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// POST /api/auth/demo-login - Demo login for development
router.post('/demo-login', rateLimit({ max: 10 }), async (req, res) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const { role = 'buyer', name = 'Demo User' } = req.body;

    // Create or find demo user
    const [demoUser] = await User.findOrCreate({
      where: { email: `demo-${role}@procv.cv` },
      defaults: {
        name: `${name} (${role})`,
        email: `demo-${role}@procv.cv`,
        role,
        isActive: true,
        isVerified: true
      }
    });

    // Generate token
    const token = jwt.sign(
      {
        id: demoUser.id,
        email: demoUser.email,
        role: demoUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: demoUser.toSafeJSON(),
      message: 'Demo login successful'
    });

  } catch (error) {
    logger.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed' });
  }
});

module.exports = router;
