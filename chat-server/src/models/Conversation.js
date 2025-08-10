module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('direct', 'property_inquiry', 'group', 'support'),
      allowNull: false,
      defaultValue: 'direct'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Property-specific metadata
    propertyId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to property in main database'
    },
    propertyTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    propertyImage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    inquiryType: {
      type: DataTypes.ENUM('general', 'viewing', 'information', 'offer', 'financing'),
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    // Conversation settings
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        allowFileSharing: true,
        allowViewingRequests: true,
        allowOffers: true,
        notifications: true,
        autoArchiveAfterDays: null,
        readReceipts: true
      }
    },
    // Status and activity
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    archivedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastMessageId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastMessagePreview: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    messageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Creator and participants info
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    participantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Tags and categories
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Metadata for extensibility
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['propertyId']
      },
      {
        fields: ['createdBy']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['isArchived']
      },
      {
        fields: ['lastActivity']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['inquiryType']
      }
    ],
    hooks: {
      beforeCreate: (conversation, options) => {
        if (conversation.type === 'property_inquiry' && conversation.propertyTitle && !conversation.title) {
          conversation.title = `${conversation.propertyTitle} Inquiry`;
        }
      },
      afterUpdate: (conversation, options) => {
        if (conversation.changed('isArchived') && conversation.isArchived) {
          conversation.archivedAt = new Date();
        }
      }
    }
  });

  // Instance methods
  Conversation.prototype.updateActivity = function() {
    return this.update({
      lastActivity: new Date()
    });
  };

  Conversation.prototype.incrementMessageCount = function() {
    return this.increment('messageCount');
  };

  Conversation.prototype.updateLastMessage = function(message) {
    const preview = this.generateMessagePreview(message);
    return this.update({
      lastMessageId: message.id,
      lastMessageAt: message.createdAt,
      lastMessagePreview: preview,
      lastActivity: new Date()
    });
  };

  Conversation.prototype.generateMessagePreview = function(message) {
    const maxLength = 100;
    let preview = '';

    switch (message.type) {
      case 'text':
        preview = message.content;
        break;
      case 'image':
        preview = '📷 Photo';
        break;
      case 'document':
        preview = '📄 Document';
        break;
      case 'property_link':
        preview = '🏠 Property shared';
        break;
      case 'viewing_request':
        preview = '📅 Viewing request';
        break;
      case 'offer':
        preview = '💰 Property offer';
        break;
      case 'system':
        preview = message.content;
        break;
      default:
        preview = message.content || 'Message';
    }

    return preview.length > maxLength ?
      preview.substring(0, maxLength) + '...' :
      preview;
  };

  Conversation.prototype.archive = function(userId) {
    return this.update({
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: userId
    });
  };

  Conversation.prototype.unarchive = function() {
    return this.update({
      isArchived: false,
      archivedAt: null,
      archivedBy: null
    });
  };

  Conversation.prototype.updateSettings = function(newSettings) {
    const currentSettings = this.settings || {};
    const updatedSettings = {
      ...currentSettings,
      ...newSettings
    };
    return this.update({ settings: updatedSettings });
  };

  // Class methods
  Conversation.findByPropertyId = function(propertyId, userId = null) {
    const where = {
      propertyId,
      isActive: true
    };

    const include = [
      {
        model: sequelize.models.ConversationParticipant,
        as: 'Participants',
        include: [
          {
            model: sequelize.models.User,
            as: 'User',
            attributes: ['id', 'name', 'avatar', 'role', 'isOnline', 'status']
          }
        ]
      }
    ];

    if (userId) {
      include.push({
        model: sequelize.models.ConversationParticipant,
        as: 'UserParticipation',
        where: { userId },
        required: true
      });
    }

    return this.findAll({
      where,
      include,
      order: [['lastActivity', 'DESC']]
    });
  };

  Conversation.findUserConversations = function(userId, options = {}) {
    const where = {
      isActive: true
    };

    if (options.type) {
      where.type = options.type;
    }

    if (!options.includeArchived) {
      where.isArchived = false;
    }

    return this.findAll({
      where,
      include: [
        {
          model: sequelize.models.ConversationParticipant,
          as: 'Participants',
          where: { userId },
          required: true,
          include: [
            {
              model: sequelize.models.User,
              as: 'User',
              attributes: ['id', 'name', 'avatar', 'role', 'isOnline', 'status']
            }
          ]
        },
        {
          model: sequelize.models.User,
          as: 'Creator',
          attributes: ['id', 'name', 'role']
        }
      ],
      order: [['lastActivity', 'DESC']],
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  };

  Conversation.createPropertyInquiry = function(data) {
    return this.create({
      type: 'property_inquiry',
      propertyId: data.propertyId,
      propertyTitle: data.propertyTitle,
      propertyImage: data.propertyImage,
      inquiryType: data.inquiryType || 'general',
      createdBy: data.buyerId,
      settings: {
        allowFileSharing: true,
        allowViewingRequests: true,
        allowOffers: true,
        notifications: true
      }
    });
  };

  return Conversation;
};
