const express = require('express');
const { Op } = require('sequelize');
const {
  Conversation,
  ConversationParticipant,
  Message,
  User
} = require('../models');
const {
  authMiddleware,
  requireConversationParticipant,
  rateLimit
} = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// GET /api/conversations - Get user's conversations
router.get('/', rateLimit({ max: 50 }), async (req, res) => {
  try {
    const { userId } = req;
    const {
      type,
      includeArchived = false,
      limit = 20,
      offset = 0,
      search
    } = req.query;

    let whereClause = { isActive: true };

    if (type) {
      whereClause.type = type;
    }

    if (!includeArchived) {
      whereClause.isArchived = false;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const conversations = await Conversation.findAll({
      where: whereClause,
      include: [
        {
          model: ConversationParticipant,
          as: 'Participants',
          where: { userId, isActive: true },
          required: true,
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'name', 'avatar', 'role', 'isOnline', 'status']
            }
          ]
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'name', 'role']
        }
      ],
      order: [['lastActivity', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get unread counts
    const conversationIds = conversations.map(conv => conv.id);
    const unreadCounts = await ConversationParticipant.findAll({
      where: {
        conversationId: { [Op.in]: conversationIds },
        userId,
        isActive: true
      },
      attributes: ['conversationId', 'unreadCount']
    });

    const unreadMap = unreadCounts.reduce((acc, item) => {
      acc[item.conversationId] = item.unreadCount;
      return acc;
    }, {});

    // Add unread counts to conversations
    const conversationsWithUnread = conversations.map(conv => {
      const convData = conv.toJSON();
      convData.unreadCount = unreadMap[conv.id] || 0;
      return convData;
    });

    res.json({
      conversations: conversationsWithUnread,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: conversations.length
      }
    });

  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/conversations/:id - Get specific conversation
router.get('/:id', requireConversationParticipant, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findByPk(id, {
      include: [
        {
          model: ConversationParticipant,
          as: 'Participants',
          where: { isActive: true },
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'name', 'avatar', 'role', 'isOnline', 'status', 'lastSeen']
            }
          ]
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });

  } catch (error) {
    logger.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// POST /api/conversations - Create new conversation
router.post('/', rateLimit({ max: 10 }), async (req, res) => {
  try {
    const { userId } = req;
    const {
      participantIds = [],
      type = 'direct',
      title,
      description,
      metadata = {}
    } = req.body;

    // Validate participants
    if (!participantIds.length) {
      return res.status(400).json({ error: 'At least one participant is required' });
    }

    // Add creator to participants if not included
    const allParticipantIds = participantIds.includes(userId) ?
      participantIds : [userId, ...participantIds];

    // For direct conversations, ensure only 2 participants
    if (type === 'direct' && allParticipantIds.length !== 2) {
      return res.status(400).json({
        error: 'Direct conversations must have exactly 2 participants'
      });
    }

    // Verify all participants exist
    const users = await User.findAll({
      where: {
        id: { [Op.in]: allParticipantIds },
        isActive: true
      }
    });

    if (users.length !== allParticipantIds.length) {
      return res.status(400).json({ error: 'One or more participants not found' });
    }

    // Check if direct conversation already exists
    if (type === 'direct') {
      const existingConversations = await Conversation.findAll({
        where: { type: 'direct', isActive: true },
        include: [
          {
            model: ConversationParticipant,
            as: 'Participants',
            where: { isActive: true },
            required: true
          }
        ]
      });

      // Find existing conversation with same participants
      const existingConv = existingConversations.find(conv => {
        const convParticipantIds = conv.Participants.map(p => p.userId).sort();
        const sortedIds = allParticipantIds.sort();
        return convParticipantIds.length === sortedIds.length &&
               convParticipantIds.every((id, index) => id === sortedIds[index]);
      });

      if (existingConv) {
        return res.status(200).json({
          conversation: existingConv,
          existing: true
        });
      }
    }

    // Create conversation
    const conversation = await Conversation.create({
      type,
      title: title || `Chat with ${users.filter(u => u.id !== userId).map(u => u.name).join(', ')}`,
      description,
      createdBy: userId,
      metadata,
      participantCount: allParticipantIds.length
    });

    // Add participants
    const participantPromises = allParticipantIds.map(participantId =>
      ConversationParticipant.create({
        conversationId: conversation.id,
        userId: participantId,
        role: participantId === userId ? 'admin' : 'participant'
      })
    );

    await Promise.all(participantPromises);

    // Load conversation with participants
    const conversationWithData = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: ConversationParticipant,
          as: 'Participants',
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'name', 'avatar', 'role', 'isOnline', 'status']
            }
          ]
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    // Create system message
    await Message.createSystemMessage(
      conversation.id,
      `Conversation created`,
      { createdBy: userId }
    );

    res.status(201).json({
      conversation: conversationWithData,
      existing: false
    });

  } catch (error) {
    logger.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// PUT /api/conversations/:id - Update conversation
router.put('/:id', requireConversationParticipant, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, settings } = req.body;

    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (settings) updates.settings = { ...conversation.settings, ...settings };

    await conversation.update(updates);

    res.json({ conversation });

  } catch (error) {
    logger.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// POST /api/conversations/:id/archive - Archive conversation
router.post('/:id/archive', requireConversationParticipant, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await conversation.archive(userId);

    res.json({ message: 'Conversation archived successfully' });

  } catch (error) {
    logger.error('Error archiving conversation:', error);
    res.status(500).json({ error: 'Failed to archive conversation' });
  }
});

// POST /api/conversations/:id/unarchive - Unarchive conversation
router.post('/:id/unarchive', requireConversationParticipant, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await conversation.unarchive();

    res.json({ message: 'Conversation unarchived successfully' });

  } catch (error) {
    logger.error('Error unarchiving conversation:', error);
    res.status(500).json({ error: 'Failed to unarchive conversation' });
  }
});

// POST /api/conversations/:id/participants - Add participant
router.post('/:id/participants', requireConversationParticipant, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID required' });
    }

    // Verify participant doesn't already exist
    const existingParticipant = await ConversationParticipant.findOne({
      where: {
        conversationId: id,
        userId: participantId,
        isActive: true
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ error: 'User is already a participant' });
    }

    // Add participant
    const conversationHandler = require('../handlers/conversationHandler');
    await conversationHandler.addParticipantToConversation(id, participantId, userId);

    res.json({ message: 'Participant added successfully' });

  } catch (error) {
    logger.error('Error adding participant:', error);
    res.status(500).json({ error: 'Failed to add participant' });
  }
});

// DELETE /api/conversations/:id/participants/:participantId - Remove participant
router.delete('/:id/participants/:participantId', requireConversationParticipant, async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const { userId } = req;

    // Only allow removing self or if user is admin
    if (participantId !== userId && req.conversationParticipant.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to remove this participant' });
    }

    const conversationHandler = require('../handlers/conversationHandler');
    await conversationHandler.removeParticipantFromConversation(id, participantId, userId);

    res.json({ message: 'Participant removed successfully' });

  } catch (error) {
    logger.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

// GET /api/conversations/:id/participants - Get conversation participants
router.get('/:id/participants', requireConversationParticipant, async (req, res) => {
  try {
    const { id } = req.params;

    const participants = await ConversationParticipant.findByConversation(id);

    res.json({ participants });

  } catch (error) {
    logger.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// GET /api/conversations/property/:propertyId - Get conversations for a property
router.get('/property/:propertyId', rateLimit({ max: 30 }), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { userId } = req;

    const conversations = await Conversation.findByPropertyId(propertyId, userId);

    res.json({ conversations });

  } catch (error) {
    logger.error('Error fetching property conversations:', error);
    res.status(500).json({ error: 'Failed to fetch property conversations' });
  }
});

module.exports = router;
