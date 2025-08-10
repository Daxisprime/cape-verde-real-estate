const express = require('express');
const { FileAttachment } = require('../models');
const { authMiddleware, rateLimit } = require('../middleware/auth');
const fileHandler = require('../handlers/fileHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// GET /api/files/:id - Get file info
router.get('/:id', rateLimit({ max: 100 }), async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileAttachment.findByPk(id, {
      include: [
        {
          model: require('../models').User,
          as: 'Uploader',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.isDeleted) {
      return res.status(410).json({ error: 'File has been deleted' });
    }

    res.json({ file: file.getPublicInfo() });

  } catch (error) {
    logger.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// GET /api/files/:id/download - Download file
router.get('/:id/download', rateLimit({ max: 50 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const file = await FileAttachment.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.isDeleted) {
      return res.status(410).json({ error: 'File has been deleted' });
    }

    // Verify user has access to this file (via conversation participation)
    const { ConversationParticipant, Message } = require('../models');
    const message = await Message.findByPk(file.messageId);

    if (message) {
      const participant = await ConversationParticipant.findOne({
        where: {
          conversationId: message.conversationId,
          userId,
          isActive: true
        }
      });

      if (!participant) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Increment download count
    await file.incrementDownloadCount();

    // In production, this would redirect to the actual file URL or stream the file
    res.redirect(file.storageUrl);

  } catch (error) {
    logger.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// GET /api/files/:id/view - View file (for previews)
router.get('/:id/view', rateLimit({ max: 100 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const file = await FileAttachment.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.isDeleted) {
      return res.status(410).json({ error: 'File has been deleted' });
    }

    // Verify access
    const { ConversationParticipant, Message } = require('../models');
    const message = await Message.findByPk(file.messageId);

    if (message) {
      const participant = await ConversationParticipant.findOne({
        where: {
          conversationId: message.conversationId,
          userId,
          isActive: true
        }
      });

      if (!participant) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // For images, return thumbnail if available
    const viewUrl = file.thumbnailUrl || file.storageUrl;
    res.redirect(viewUrl);

  } catch (error) {
    logger.error('Error viewing file:', error);
    res.status(500).json({ error: 'Failed to view file' });
  }
});

// DELETE /api/files/:id - Delete file
router.delete('/:id', rateLimit({ max: 20 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    await fileHandler.deleteFile(id, userId);

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    if (error.message === 'File not found') {
      return res.status(404).json({ error: 'File not found' });
    }
    if (error.message === 'Not authorized to delete this file') {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    logger.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// GET /api/files/user/my-files - Get user's uploaded files
router.get('/user/my-files', rateLimit({ max: 30 }), async (req, res) => {
  try {
    const { userId } = req;
    const { type, limit = 50, offset = 0 } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (type) {
      options.fileType = type;
    }

    const files = await fileHandler.getUserFiles(userId, options);

    res.json({
      files: files.map(file => file.getPublicInfo()),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: files.length
      }
    });

  } catch (error) {
    logger.error('Error fetching user files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// GET /api/files/stats - Get file statistics (admin only)
router.get('/stats', rateLimit({ max: 10 }), async (req, res) => {
  try {
    const { userRole } = req;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await fileHandler.getFileStats();

    res.json({ stats });

  } catch (error) {
    logger.error('Error fetching file stats:', error);
    res.status(500).json({ error: 'Failed to fetch file statistics' });
  }
});

module.exports = router;
