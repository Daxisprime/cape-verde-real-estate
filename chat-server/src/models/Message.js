module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id'
      }
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'text',
        'image',
        'document',
        'property_link',
        'viewing_request',
        'offer',
        'system',
        'typing_indicator',
        'audio',
        'video',
        'location'
      ),
      allowNull: false,
      defaultValue: 'text'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // Message formatting and metadata
    formatted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'HTML formatted version of the message'
    },
    mentions: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of user IDs mentioned in the message'
    },
    // Reply and threading
    replyToId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    threadId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the root message in a thread'
    },
    // Message status and delivery
    status: {
      type: DataTypes.ENUM('sending', 'sent', 'delivered', 'read', 'failed'),
      defaultValue: 'sent'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Property-specific message data
    propertyData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Property information for property_link messages'
    },
    viewingData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Viewing request details'
    },
    offerData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Property offer details'
    },
    // Message editing and deletion
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    originalContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Original content before editing'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    // Message priority and importance
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    isImportant: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Reactions and interactions
    reactions: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Message reactions by users'
    },
    // System message specific data
    systemData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional data for system messages'
    },
    // Message metadata
    clientMessageId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Client-side message ID for optimistic updates'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional message metadata'
    },
    // Analytics and tracking
    readCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    deliveredCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['conversationId', 'createdAt']
      },
      {
        fields: ['senderId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['replyToId']
      },
      {
        fields: ['threadId']
      },
      {
        fields: ['clientMessageId']
      },
      {
        fields: ['isDeleted']
      },
      {
        fields: ['isPinned']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      afterCreate: async (message, options) => {
        // Update conversation's last message
        const conversation = await sequelize.models.Conversation.findByPk(message.conversationId);
        if (conversation) {
          await conversation.updateLastMessage(message);
          await conversation.incrementMessageCount();
        }
      },
      beforeUpdate: (message, options) => {
        if (message.changed('content') && !message.isEdited) {
          message.originalContent = message._previousDataValues.content;
          message.isEdited = true;
          message.editedAt = new Date();
        }
      }
    }
  });

  // Instance methods
  Message.prototype.markAsRead = function(userId) {
    return sequelize.models.MessageRead.findOrCreate({
      where: {
        messageId: this.id,
        userId: userId
      },
      defaults: {
        readAt: new Date()
      }
    });
  };

  Message.prototype.addReaction = function(userId, emoji) {
    const reactions = this.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    return this.update({ reactions });
  };

  Message.prototype.removeReaction = function(userId, emoji) {
    const reactions = this.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    return this.update({ reactions });
  };

  Message.prototype.edit = function(newContent) {
    return this.update({
      content: newContent,
      isEdited: true,
      editedAt: new Date()
    });
  };

  Message.prototype.softDelete = function(userId) {
    return this.update({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId
    });
  };

  Message.prototype.pin = function() {
    return this.update({ isPinned: true });
  };

  Message.prototype.unpin = function() {
    return this.update({ isPinned: false });
  };

  Message.prototype.toSafeJSON = function() {
    const message = this.toJSON();

    // Remove sensitive data if message is deleted
    if (message.isDeleted) {
      message.content = 'This message was deleted';
      message.formatted = null;
      message.propertyData = null;
      message.viewingData = null;
      message.offerData = null;
    }

    return message;
  };

  // Class methods
  Message.findConversationMessages = function(conversationId, options = {}) {
    const where = {
      conversationId,
      isDeleted: false
    };

    if (options.since) {
      where.createdAt = {
        [sequelize.Op.gte]: options.since
      };
    }

    if (options.before) {
      where.createdAt = {
        [sequelize.Op.lt]: options.before
      };
    }

    return this.findAll({
      where,
      include: [
        {
          model: sequelize.models.User,
          as: 'Sender',
          attributes: ['id', 'name', 'avatar', 'role']
        },
        {
          model: sequelize.models.Message,
          as: 'ReplyTo',
          attributes: ['id', 'content', 'type', 'senderId'],
          include: [
            {
              model: sequelize.models.User,
              as: 'Sender',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: sequelize.models.FileAttachment,
          as: 'Attachments'
        },
        {
          model: sequelize.models.MessageRead,
          as: 'ReadReceipts',
          include: [
            {
              model: sequelize.models.User,
              as: 'User',
              attributes: ['id', 'name', 'avatar']
            }
          ]
        }
      ],
      order: [['createdAt', options.order || 'ASC']],
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  };

  Message.createSystemMessage = function(conversationId, content, systemData = {}) {
    return this.create({
      conversationId,
      senderId: null, // System messages don't have a sender
      type: 'system',
      content,
      systemData,
      status: 'sent'
    });
  };

  Message.createPropertyLinkMessage = function(data) {
    return this.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      type: 'property_link',
      content: data.content || `Shared property: ${data.propertyData.title}`,
      propertyData: data.propertyData,
      status: 'sent'
    });
  };

  Message.createViewingRequestMessage = function(data) {
    return this.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      type: 'viewing_request',
      content: data.content || 'Viewing request submitted',
      viewingData: {
        propertyId: data.propertyId,
        requestedDate: data.requestedDate,
        alternativeDates: data.alternativeDates || [],
        message: data.message,
        status: 'pending'
      },
      priority: 'high',
      status: 'sent'
    });
  };

  Message.createOfferMessage = function(data) {
    return this.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      type: 'offer',
      content: data.content || `Property offer: €${data.offerData.amount.toLocaleString()}`,
      offerData: {
        propertyId: data.propertyId,
        amount: data.offerData.amount,
        currency: data.offerData.currency || 'EUR',
        terms: data.offerData.terms,
        conditions: data.offerData.conditions || [],
        validUntil: data.offerData.validUntil,
        status: 'pending'
      },
      priority: 'high',
      status: 'sent'
    });
  };

  Message.search = function(query, userId, options = {}) {
    const where = {
      isDeleted: false,
      [sequelize.Op.or]: [
        { content: { [sequelize.Op.iLike]: `%${query}%` } },
        { formatted: { [sequelize.Op.iLike]: `%${query}%` } }
      ]
    };

    // Only search in conversations the user participates in
    return this.findAll({
      where,
      include: [
        {
          model: sequelize.models.Conversation,
          as: 'Conversation',
          include: [
            {
              model: sequelize.models.ConversationParticipant,
              as: 'Participants',
              where: { userId },
              required: true
            }
          ]
        },
        {
          model: sequelize.models.User,
          as: 'Sender',
          attributes: ['id', 'name', 'avatar', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: options.limit || 20
    });
  };

  return Message;
};
