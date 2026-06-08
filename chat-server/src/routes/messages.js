const express = require('express');
const { Op } = require('sequelize');
const {
  Message,
  User,
  FileAttachment,
  MessageRead
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

// GET /api/messages/:conversationId - Get messages for a conversation
router.get('/:conversationId', requireConversationParticipant, rateLimit({ max: 100 }), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const {
      limit = 50,
      offset = 0,
      since,
      before,
      order = 'ASC'
    } = req.query;

    const whereClause = {
      conversationId,
      isDeleted: false
    };

    if (since) {
      whereClause.createdAt = { [Op.gte]: new Date(since) };
    }

    if (before) {
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        [Op.lt]: new Date(before)
      };
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'name', 'avatar', 'role']
        },
        {
          model: Message,
          as: 'ReplyTo',
          attributes: ['id', 'content', 'type', 'senderId'],
          include: [
            {
              model: User,
              as: 'Sender',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: FileAttachment,
          as: 'Attachments',
          where: { isDeleted: false },
          required: false
        },
        {
          model: MessageRead,
          as: 'ReadReceipts',
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'name', 'avatar']
            }
          ]
        }
      ],
      order: [['createdAt', order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Convert to safe JSON (handles deleted messages)
    const safeMessages = messages.map(message => message.toSafeJSON());

    res.json({
      messages: safeMessages,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: messages.length,
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages - Send a new message
router.post('/', rateLimit({ max: 200 }), async (req, res) => {
  try {
    const { userId } = req;
    const {
      conversationId,
      content,
      type = 'text',
      replyToId,
      metadata = {},
      attachments = []
    } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify user is participant (this middleware should be applied to this route too)
    req.params.conversationId = conversationId;
    const { ConversationParticipant } = require('../models');

    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId,
        isActive: true
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to send messages in this conversation' });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId: userId,
      content: content.trim(),
      type,
      replyToId,
      metadata,
      status: 'sent'
    });

    // Handle attachments if provided
    if (attachments.length > 0) {
      const attachmentPromises = attachments.map(attachment =>
        FileAttachment.create({
          ...attachment,
          messageId: message.id,
          uploadedBy: userId
        })
      );
      await Promise.all(attachmentPromises);
    }

    // Load message with related data
    const messageWithData = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'name', 'avatar', 'role']
        },
        {
          model: Message,
          as: 'ReplyTo',
          attributes: ['id', 'content', 'type', 'senderId'],
          include: [
            {
              model: User,
              as: 'Sender',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: FileAttachment,
          as: 'Attachments'
        }
      ]
    });

    res.status(201).json({ message: messageWithData });

  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PUT /api/messages/:id - Edit a message
router.put('/:id', rateLimit({ max: 50 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender can edit message
    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    // Check if message is too old to edit (24 hours)
    const ageInHours = (Date.now() - new Date(message.createdAt).getTime()) / (1000 * 60 * 60);
    if (ageInHours > 24) {
      return res.status(400).json({ error: 'Message is too old to edit' });
    }

    await message.edit(content.trim());

    // Load updated message with data
    const updatedMessage = await Message.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'name', 'avatar', 'role']
        },
        {
          model: FileAttachment,
          as: 'Attachments'
        }
      ]
    });

    res.json({ message: updatedMessage });

  } catch (error) {
    logger.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', rateLimit({ max: 50 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender can delete message
    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await message.softDelete(userId);

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// POST /api/messages/:id/read - Mark message as read
router.post('/:id/read', rateLimit({ max: 300 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verify user is participant in the conversation
    const { ConversationParticipant } = require('../models');
    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId: message.conversationId,
        userId,
        isActive: true
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to mark this message as read' });
    }

    await message.markAsRead(userId);

    res.json({ message: 'Message marked as read' });

  } catch (error) {
    logger.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// POST /api/messages/:id/react - Add reaction to message
router.post('/:id/react', rateLimit({ max: 100 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verify user is participant in the conversation
    const { ConversationParticipant } = require('../models');
    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId: message.conversationId,
        userId,
        isActive: true
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to react to this message' });
    }

    await message.addReaction(userId, emoji);

    res.json({ message: 'Reaction added successfully' });

  } catch (error) {
    logger.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// DELETE /api/messages/:id/react - Remove reaction from message
router.delete('/:id/react', rateLimit({ max: 100 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { emoji } = req.query;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.removeReaction(userId, emoji);

    res.json({ message: 'Reaction removed successfully' });

  } catch (error) {
    logger.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// GET /api/messages/search - Search messages
router.get('/search', rateLimit({ max: 30 }), async (req, res) => {
  try {
    const { userId } = req;
    const { q: query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchResults = await Message.search(query, userId, { limit: parseInt(limit) });

    res.json({
      results: searchResults,
      query,
      total: searchResults.length
    });

  } catch (error) {
    logger.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

// GET /api/messages/:conversationId/files - Get files shared in conversation
router.get('/:conversationId/files', requireConversationParticipant, rateLimit({ max: 50 }), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (type) {
      options.fileType = type;
    }

    const fileHandler = require('../handlers/fileHandler');
    const files = await fileHandler.getConversationFiles(conversationId, options);

    res.json({
      files,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: files.length
      }
    });

  } catch (error) {
    logger.error('Error fetching conversation files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// POST /api/messages/:conversationId/bulk-read - Mark multiple messages as read
router.post('/:conversationId/bulk-read', requireConversationParticipant, rateLimit({ max: 50 }), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req;
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Message IDs array is required' });
    }

    await MessageRead.markMessagesAsRead(messageIds, userId);

    res.json({ message: 'Messages marked as read successfully' });

  } catch (error) {
    logger.error('Error bulk marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
