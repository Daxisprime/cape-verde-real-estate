const express = require('express');
const { UserPresence, User } = require('../models');
const { authMiddleware, rateLimit } = require('../middleware/auth');
const presenceHandler = require('../handlers/presenceHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// GET /api/presence/online - Get online users
router.get('/online', rateLimit({ max: 50 }), async (req, res) => {
  try {
    const onlineUsers = await UserPresence.getOnlineUsers();

    const users = onlineUsers.map(presence => ({
      userId: presence.userId,
      name: presence.User.name,
      avatar: presence.User.avatar,
      role: presence.User.role,
      status: presence.status,
      statusMessage: presence.statusMessage,
      isOnline: presence.isOnline,
      lastActivity: presence.lastActivity
    }));

    res.json({ users });

  } catch (error) {
    logger.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

// GET /api/presence/:userId - Get user presence
router.get('/:userId', rateLimit({ max: 100 }), async (req, res) => {
  try {
    const { userId } = req.params;

    const presence = await UserPresence.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'avatar', 'role']
        }
      ]
    });

    if (!presence) {
      return res.status(404).json({ error: 'User presence not found' });
    }

    res.json({ presence: presence.getPublicPresence() });

  } catch (error) {
    logger.error('Error fetching user presence:', error);
    res.status(500).json({ error: 'Failed to fetch user presence' });
  }
});

// PUT /api/presence/status - Update user status
router.put('/status', rateLimit({ max: 100 }), async (req, res) => {
  try {
    const { userId } = req;
    const { status, statusMessage } = req.body;

    if (!['online', 'away', 'busy', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [presence] = await UserPresence.findOrCreateForUser(userId);
    await presence.setStatus(status, statusMessage);

    // Update user model as well
    await User.update(
      { status, statusMessage },
      { where: { id: userId } }
    );

    res.json({
      status,
      statusMessage,
      message: 'Status updated successfully'
    });

  } catch (error) {
    logger.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PUT /api/presence/privacy - Update privacy settings
router.put('/privacy', rateLimit({ max: 20 }), async (req, res) => {
  try {
    const { userId } = req;
    const { showOnlineStatus, showLastSeen, showTypingIndicator } = req.body;

    const [presence] = await UserPresence.findOrCreateForUser(userId);

    await presence.updatePrivacySettings({
      showOnlineStatus,
      showLastSeen,
      showTypingIndicator
    });

    res.json({
      privacy: {
        showOnlineStatus: presence.showOnlineStatus,
        showLastSeen: presence.showLastSeen,
        showTypingIndicator: presence.showTypingIndicator
      },
      message: 'Privacy settings updated successfully'
    });

  } catch (error) {
    logger.error('Error updating privacy settings:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// GET /api/presence/conversation/:conversationId/typing - Get typing users in conversation
router.get('/conversation/:conversationId/typing', rateLimit({ max: 200 }), async (req, res) => {
  try {
    const { conversationId } = req.params;

    const typingUsers = await UserPresence.getTypingUsers(conversationId);

    const users = typingUsers.map(presence => ({
      userId: presence.userId,
      userName: presence.User.name,
      lastTypingAt: presence.lastTypingAt
    }));

    res.json({ typingUsers: users });

  } catch (error) {
    logger.error('Error fetching typing users:', error);
    res.status(500).json({ error: 'Failed to fetch typing users' });
  }
});

// GET /api/presence/stats - Get presence statistics (admin only)
router.get('/stats', rateLimit({ max: 10 }), async (req, res) => {
  try {
    const { userRole } = req;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await presenceHandler.getPresenceStats();

    res.json({ stats });

  } catch (error) {
    logger.error('Error fetching presence stats:', error);
    res.status(500).json({ error: 'Failed to fetch presence statistics' });
  }
});

// GET /api/presence/user/:userId/stats - Get user presence statistics
router.get('/user/:userId/stats', rateLimit({ max: 20 }), async (req, res) => {
  try {
    const { userId: requestedUserId } = req.params;
    const { userId: currentUserId, userRole } = req;

    // Users can only view their own stats, unless they're admin
    if (requestedUserId !== currentUserId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await UserPresence.getUserStats(requestedUserId);

    if (!stats) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    res.json({ stats });

  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// POST /api/presence/cleanup - Manual cleanup of stale presence (admin only)
router.post('/cleanup', rateLimit({ max: 5 }), async (req, res) => {
  try {
    const { userRole } = req;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Run cleanup
    await presenceHandler.cleanupStalePresence();
    await presenceHandler.autoAwayUpdate();

    res.json({ message: 'Presence cleanup completed successfully' });

  } catch (error) {
    logger.error('Error running presence cleanup:', error);
    res.status(500).json({ error: 'Failed to run presence cleanup' });
  }
});

module.exports = router;
