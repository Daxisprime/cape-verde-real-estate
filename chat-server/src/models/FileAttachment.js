module.exports = (sequelize, DataTypes) => {
  const FileAttachment = sequelize.define('FileAttachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // File information
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileExtension: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    // File classification
    fileType: {
      type: DataTypes.ENUM('image', 'document', 'video', 'audio', 'archive', 'other'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('property_document', 'contract', 'photo', 'floor_plan', 'general'),
      allowNull: true
    },
    // Storage information
    storageProvider: {
      type: DataTypes.ENUM('local', 'aws_s3', 'cloudinary', 'google_cloud'),
      allowNull: false,
      defaultValue: 'local'
    },
    storagePath: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Path or key in the storage system'
    },
    storageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Public URL to access the file'
    },
    // Preview and thumbnails
    thumbnailUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previewUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Image/Video metadata
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Width and height for images/videos'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in seconds for audio/video files'
    },
    // Security and access
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    accessLevel: {
      type: DataTypes.ENUM('public', 'conversation', 'private'),
      defaultValue: 'conversation'
    },
    encryptionKey: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Encryption key for sensitive files'
    },
    // Processing status
    processingStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    processingError: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Download tracking
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastDownloadAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Virus scanning
    scanStatus: {
      type: DataTypes.ENUM('pending', 'clean', 'infected', 'error'),
      defaultValue: 'pending'
    },
    scanDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Expiration and cleanup
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional file metadata (EXIF, etc.)'
    }
  }, {
    tableName: 'file_attachments',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['messageId']
      },
      {
        fields: ['uploadedBy']
      },
      {
        fields: ['fileType']
      },
      {
        fields: ['category']
      },
      {
        fields: ['processingStatus']
      },
      {
        fields: ['scanStatus']
      },
      {
        fields: ['isDeleted']
      },
      {
        fields: ['expiresAt']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      beforeCreate: (attachment, options) => {
        // Set file type based on MIME type
        if (!attachment.fileType) {
          attachment.fileType = FileAttachment.detectFileType(attachment.mimeType);
        }
      }
    }
  });

  // Instance methods
  FileAttachment.prototype.generateUrls = function(baseUrl) {
    const urls = {
      download: `${baseUrl}/api/files/${this.id}/download`,
      view: `${baseUrl}/api/files/${this.id}/view`
    };

    if (this.thumbnailUrl) {
      urls.thumbnail = this.thumbnailUrl;
    }

    if (this.previewUrl) {
      urls.preview = this.previewUrl;
    }

    return urls;
  };

  FileAttachment.prototype.incrementDownloadCount = function() {
    return this.update({
      downloadCount: this.downloadCount + 1,
      lastDownloadAt: new Date()
    });
  };

  FileAttachment.prototype.markAsProcessed = function(thumbnailUrl = null, previewUrl = null) {
    return this.update({
      processingStatus: 'completed',
      thumbnailUrl,
      previewUrl
    });
  };

  FileAttachment.prototype.markProcessingFailed = function(error) {
    return this.update({
      processingStatus: 'failed',
      processingError: error
    });
  };

  FileAttachment.prototype.updateScanResult = function(status, scanDate = new Date()) {
    return this.update({
      scanStatus: status,
      scanDate
    });
  };

  FileAttachment.prototype.softDelete = function() {
    return this.update({
      isDeleted: true,
      deletedAt: new Date()
    });
  };

  FileAttachment.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      fileName: this.originalName,
      fileSize: this.fileSize,
      fileType: this.fileType,
      mimeType: this.mimeType,
      dimensions: this.dimensions,
      duration: this.duration,
      createdAt: this.createdAt
    };
  };

  // Class methods
  FileAttachment.detectFileType = function(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';

    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];

    if (documentTypes.includes(mimeType)) return 'document';

    const archiveTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip'
    ];

    if (archiveTypes.includes(mimeType)) return 'archive';

    return 'other';
  };

  FileAttachment.findByMessage = function(messageId) {
    return this.findAll({
      where: {
        messageId,
        isDeleted: false
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'Uploader',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  };

  FileAttachment.findByConversation = function(conversationId, options = {}) {
    const where = {
      isDeleted: false
    };

    if (options.fileType) {
      where.fileType = options.fileType;
    }

    if (options.category) {
      where.category = options.category;
    }

    return this.findAll({
      where,
      include: [
        {
          model: sequelize.models.Message,
          as: 'Message',
          where: { conversationId },
          attributes: ['id', 'createdAt']
        },
        {
          model: sequelize.models.User,
          as: 'Uploader',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: options.limit || 50
    });
  };

  FileAttachment.findByUser = function(userId, options = {}) {
    const where = {
      uploadedBy: userId,
      isDeleted: false
    };

    if (options.fileType) {
      where.fileType = options.fileType;
    }

    return this.findAll({
      where,
      include: [
        {
          model: sequelize.models.Message,
          as: 'Message',
          attributes: ['id', 'conversationId', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: options.limit || 100
    });
  };

  FileAttachment.getStorageStats = function() {
    return this.findAll({
      attributes: [
        'fileType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('fileSize')), 'totalSize']
      ],
      where: {
        isDeleted: false
      },
      group: ['fileType'],
      raw: true
    });
  };

  FileAttachment.findExpiredFiles = function() {
    return this.findAll({
      where: {
        expiresAt: {
          [sequelize.Op.lt]: new Date()
        },
        isDeleted: false
      }
    });
  };

  FileAttachment.findPendingProcessing = function() {
    return this.findAll({
      where: {
        processingStatus: 'pending',
        isDeleted: false
      },
      order: [['createdAt', 'ASC']],
      limit: 10
    });
  };

  return FileAttachment;
};
