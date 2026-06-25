module.exports = (sequelize, DataTypes) => {
  const ConversationParticipant = sequelize.define('ConversationParticipant', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('participant', 'admin', 'moderator'),
      defaultValue: 'participant'
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    leftAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Read tracking
    lastReadMessageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    lastReadAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    unreadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Notification settings for this conversation
    notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    mentionNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Typing status
    isTyping: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastTypingAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Participant permissions
    canInvite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    canRemove: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    canEdit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Metadata
    invitedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'conversation_participants',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['conversationId', 'userId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['conversationId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['lastReadAt']
      },
      {
        fields: ['unreadCount']
      }
    ],
    hooks: {
      afterCreate: async (participant, options) => {
        // Update conversation participant count
        const conversation = await sequelize.models.Conversation.findByPk(participant.conversationId);
        if (conversation) {
          await conversation.increment('participantCount');
        }
      },
      afterUpdate: async (participant, options) => {
        if (participant.changed('isActive') && !participant.isActive) {
          // Update conversation participant count when user leaves
          const conversation = await sequelize.models.Conversation.findByPk(participant.conversationId);
          if (conversation) {
            await conversation.decrement('participantCount');
          }
        }
      }
    }
  });

  // Instance methods
  ConversationParticipant.prototype.markAsRead = function(messageId) {
    return this.update({
      lastReadMessageId: messageId,
      lastReadAt: new Date(),
      unreadCount: 0
    });
  };

  ConversationParticipant.prototype.incrementUnreadCount = function() {
    return this.increment('unreadCount');
  };

  ConversationParticipant.prototype.resetUnreadCount = function() {
    return this.update({ unreadCount: 0 });
  };

  ConversationParticipant.prototype.updateTypingStatus = function(isTyping) {
    return this.update({
      isTyping,
      lastTypingAt: isTyping ? new Date() : this.lastTypingAt
    });
  };

  ConversationParticipant.prototype.leave = function() {
    return this.update({
      isActive: false,
      leftAt: new Date(),
      isTyping: false
    });
  };

  ConversationParticipant.prototype.rejoin = function() {
    return this.update({
      isActive: true,
      leftAt: null,
      joinedAt: new Date()
    });
  };

  ConversationParticipant.prototype.updateNotificationSettings = function(settings) {
    return this.update({
      notifications: settings.notifications !== undefined ? settings.notifications : this.notifications,
      mentionNotifications: settings.mentionNotifications !== undefined ? settings.mentionNotifications : this.mentionNotifications
    });
  };

  ConversationParticipant.prototype.updatePermissions = function(permissions) {
    return this.update({
      canInvite: permissions.canInvite !== undefined ? permissions.canInvite : this.canInvite,
      canRemove: permissions.canRemove !== undefined ? permissions.canRemove : this.canRemove,
      canEdit: permissions.canEdit !== undefined ? permissions.canEdit : this.canEdit
    });
  };

  // Class methods
  ConversationParticipant.findByConversation = function(conversationId, options = {}) {
    const where = {
      conversationId,
      isActive: true
    };

    return this.findAll({
      where,
      include: [
        {
          model: sequelize.models.User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'avatar', 'role', 'isOnline', 'status', 'lastSeen']
        }
      ],
      order: [['joinedAt', 'ASC']]
    });
  };

  ConversationParticipant.findByUser = function(userId, options = {}) {
    const where = {
      userId,
      isActive: true
    };

    const include = [
      {
        model: sequelize.models.Conversation,
        as: 'Conversation',
        where: { isActive: true },
        include: [
          {
            model: sequelize.models.User,
            as: 'Creator',
            attributes: ['id', 'name', 'role']
          }
        ]
      }
    ];

    if (options.withUnread) {
      where.unreadCount = { [sequelize.Op.gt]: 0 };
    }

    return this.findAll({
      where,
      include,
      order: [[sequelize.models.Conversation, 'lastActivity', 'DESC']]
    });
  };

  ConversationParticipant.addParticipant = function(conversationId, userId, addedBy, role = 'participant') {
    return this.create({
      conversationId,
      userId,
      role,
      invitedBy: addedBy,
      joinedAt: new Date()
    });
  };

  ConversationParticipant.removeParticipant = function(conversationId, userId) {
    return this.update(
      {
        isActive: false,
        leftAt: new Date()
      },
      {
        where: {
          conversationId,
          userId,
          isActive: true
        }
      }
    );
  };

  ConversationParticipant.getUnreadCounts = function(userId) {
    return this.findAll({
      where: {
        userId,
        isActive: true,
        unreadCount: { [sequelize.Op.gt]: 0 }
      },
      attributes: ['conversationId', 'unreadCount'],
      include: [
        {
          model: sequelize.models.Conversation,
          as: 'Conversation',
          attributes: ['id', 'title', 'type']
        }
      ]
    });
  };

  ConversationParticipant.updateUnreadCounts = async function(conversationId, excludeUserId = null) {
    const participants = await this.findAll({
      where: {
        conversationId,
        isActive: true,
        ...(excludeUserId && { userId: { [sequelize.Op.ne]: excludeUserId } })
      }
    });

    const updatePromises = participants.map(participant =>
      participant.incrementUnreadCount()
    );

    return Promise.all(updatePromises);
  };

  ConversationParticipant.getTypingUsers = function(conversationId) {
    return this.findAll({
      where: {
        conversationId,
        isTyping: true,
        isActive: true,
        lastTypingAt: {
          [sequelize.Op.gte]: new Date(Date.now() - 10000) // Within last 10 seconds
        }
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'User',
          attributes: ['id', 'name']
        }
      ]
    });
  };

  return ConversationParticipant;
};
