const { FileAttachment, Message, ConversationParticipant } = require('../models');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class FileHandler {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    this.allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  }

  async handleFileUploadRequest(socket, data) {
    try {
      const { userId } = socket;
      const { conversationId, fileName, fileSize, mimeType } = data;

      // Validate input
      if (!conversationId || !fileName || !fileSize || !mimeType) {
        socket.emit('file_upload_error', {
          error: 'Missing required file information'
        });
        return;
      }

      // Check file size
      if (fileSize > this.maxFileSize) {
        socket.emit('file_upload_error', {
          error: `File size exceeds limit of ${this.maxFileSize / (1024 * 1024)}MB`
        });
        return;
      }

      // Check file type
      if (!this.isAllowedFileType(mimeType)) {
        socket.emit('file_upload_error', {
          error: 'File type not allowed'
        });
        return;
      }

      // Verify user is participant in conversation
      const participant = await ConversationParticipant.findOne({
        where: {
          conversationId,
          userId,
          isActive: true
        }
      });

      if (!participant) {
        socket.emit('file_upload_error', {
          error: 'Not authorized to upload files in this conversation'
        });
        return;
      }

      // Generate unique file info
      const fileId = uuidv4();
      const fileExtension = path.extname(fileName).toLowerCase();
      const uniqueFileName = `${fileId}${fileExtension}`;

      // Create upload session
      const uploadSession = {
        fileId,
        conversationId,
        userId,
        fileName,
        originalName: fileName,
        uniqueFileName,
        fileSize,
        mimeType,
        fileExtension,
        fileType: this.getFileType(mimeType),
        uploadStarted: new Date(),
        status: 'pending'
      };

      // In a real implementation, this would generate signed URLs for direct upload to S3/Cloudinary
      // For demo, we'll simulate the upload process
      const uploadUrl = this.generateUploadUrl(uploadSession);

      socket.emit('file_upload_ready', {
        fileId,
        uploadUrl,
        uploadSession
      });

      logger.info(`File upload session created: ${fileId} for user ${userId}`);

    } catch (error) {
      logger.error('Error handling file upload request:', error);
      socket.emit('file_upload_error', {
        error: 'Failed to initiate file upload'
      });
    }
  }

  async handleFileUploadComplete(socket, io, data, redisClient) {
    try {
      const { userId, userName } = socket;
      const {
        fileId,
        conversationId,
        uploadUrl,
        fileSize,
        fileName,
        mimeType,
        dimensions,
        duration
      } = data;

      // Create file attachment record
      const attachment = await FileAttachment.create({
        id: fileId,
        messageId: null, // Will be set when message is created
        uploadedBy: userId,
        fileName: `${fileId}${path.extname(fileName)}`,
        originalName: fileName,
        fileExtension: path.extname(fileName).toLowerCase(),
        mimeType,
        fileSize,
        fileType: this.getFileType(mimeType),
        storageProvider: 'demo', // In production: 'aws_s3', 'cloudinary', etc.
        storagePath: `chat-files/${fileId}`,
        storageUrl: uploadUrl,
        thumbnailUrl: this.generateThumbnailUrl(uploadUrl, mimeType),
        dimensions,
        duration,
        processingStatus: 'completed',
        scanStatus: 'clean' // In production, implement virus scanning
      });

      // Create message with file attachment
      const message = await Message.create({
        conversationId,
        senderId: userId,
        type: this.getFileType(mimeType),
        content: `Shared ${this.getFileType(mimeType)}: ${fileName}`,
        status: 'sent'
      });

      // Update attachment with message ID
      await attachment.update({ messageId: message.id });

      // Load message with attachments and sender info
      const messageWithData = await Message.findByPk(message.id, {
        include: [
          {
            model: require('../models').User,
            as: 'Sender',
            attributes: ['id', 'name', 'avatar', 'role']
          },
          {
            model: FileAttachment,
            as: 'Attachments'
          }
        ]
      });

      // Emit to conversation room
      io.to(`conversation:${conversationId}`).emit('new_message', {
        ...messageWithData.toJSON(),
        senderName: userName
      });

      // Update unread counts
      await ConversationParticipant.updateUnreadCounts(conversationId, userId);

      // Confirm to uploader
      socket.emit('file_uploaded', {
        fileId,
        messageId: message.id,
        attachment: attachment.getPublicInfo(),
        timestamp: message.createdAt
      });

      logger.info(`File uploaded successfully: ${fileId} by user ${userId}`);

    } catch (error) {
      logger.error('Error handling file upload complete:', error);
      socket.emit('file_upload_error', {
        error: 'Failed to complete file upload'
      });
    }
  }

  isAllowedFileType(mimeType) {
    return [
      ...this.allowedImageTypes,
      ...this.allowedDocumentTypes,
      ...this.allowedVideoTypes,
      ...this.allowedAudioTypes
    ].includes(mimeType);
  }

  getFileType(mimeType) {
    if (this.allowedImageTypes.includes(mimeType)) return 'image';
    if (this.allowedVideoTypes.includes(mimeType)) return 'video';
    if (this.allowedAudioTypes.includes(mimeType)) return 'audio';
    if (this.allowedDocumentTypes.includes(mimeType)) return 'document';
    return 'other';
  }

  generateUploadUrl(uploadSession) {
    // In production, this would generate a signed URL for S3/Cloudinary
    // For demo, return a mock URL
    const baseUrl = process.env.STORAGE_BASE_URL || 'https://demo-storage.procv.cv';
    return `${baseUrl}/chat-files/${uploadSession.fileId}${uploadSession.fileExtension}`;
  }

  generateThumbnailUrl(originalUrl, mimeType) {
    if (!this.allowedImageTypes.includes(mimeType)) {
      return null;
    }

    // In production, this would generate thumbnail URLs
    // For demo, return original URL with thumbnail query
    return `${originalUrl}?thumbnail=true`;
  }

  // File management methods
  async getConversationFiles(conversationId, options = {}) {
    try {
      return await FileAttachment.findByConversation(conversationId, options);
    } catch (error) {
      logger.error('Error getting conversation files:', error);
      return [];
    }
  }

  async getUserFiles(userId, options = {}) {
    try {
      return await FileAttachment.findByUser(userId, options);
    } catch (error) {
      logger.error('Error getting user files:', error);
      return [];
    }
  }

  async deleteFile(fileId, userId) {
    try {
      const attachment = await FileAttachment.findByPk(fileId);

      if (!attachment) {
        throw new Error('File not found');
      }

      if (attachment.uploadedBy !== userId) {
        throw new Error('Not authorized to delete this file');
      }

      await attachment.softDelete();

      // In production, also delete from storage provider
      // await this.deleteFromStorage(attachment.storagePath);

      logger.info(`File deleted: ${fileId} by user ${userId}`);
      return true;

    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFileStats() {
    try {
      const stats = await FileAttachment.getStorageStats();
      const totalFiles = stats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
      const totalSize = stats.reduce((sum, stat) => sum + parseInt(stat.totalSize || 0), 0);

      return {
        totalFiles,
        totalSize,
        byType: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting file stats:', error);
      return null;
    }
  }

  // Cleanup methods
  async cleanupExpiredFiles() {
    try {
      const expiredFiles = await FileAttachment.findExpiredFiles();

      for (const file of expiredFiles) {
        await file.softDelete();
        // In production, delete from storage
        // await this.deleteFromStorage(file.storagePath);
      }

      logger.info(`Cleaned up ${expiredFiles.length} expired files`);
      return expiredFiles.length;

    } catch (error) {
      logger.error('Error cleaning up expired files:', error);
      return 0;
    }
  }

  async processUploadQueue() {
    try {
      const pendingFiles = await FileAttachment.findPendingProcessing();

      for (const file of pendingFiles) {
        try {
          // In production, process files (generate thumbnails, scan for viruses, etc.)
          await this.processFile(file);
        } catch (error) {
          await file.markProcessingFailed(error.message);
          logger.error(`File processing failed for ${file.id}:`, error);
        }
      }

      return pendingFiles.length;

    } catch (error) {
      logger.error('Error processing upload queue:', error);
      return 0;
    }
  }

  async processFile(file) {
    // Mock file processing - in production, implement actual processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    let thumbnailUrl = null;
    let previewUrl = null;

    if (file.fileType === 'image') {
      thumbnailUrl = `${file.storageUrl}?thumbnail=true`;
      previewUrl = file.storageUrl;
    }

    await file.markAsProcessed(thumbnailUrl, previewUrl);
    logger.info(`File processed: ${file.id}`);
  }

  // Start background tasks
  startBackgroundTasks(intervalMinutes = 30) {
    setInterval(async () => {
      await this.cleanupExpiredFiles();
      await this.processUploadQueue();
    }, intervalMinutes * 60 * 1000);

    logger.info(`File handler background tasks started (interval: ${intervalMinutes} minutes)`);
  }
}

module.exports = new FileHandler();
