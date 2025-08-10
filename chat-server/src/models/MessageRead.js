module.exports = (sequelize, DataTypes) => {
  const MessageRead = sequelize.define('MessageRead', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    readAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    // Read context (where the message was read)
    readFrom: {
      type: DataTypes.ENUM('web', 'mobile', 'desktop', 'notification'),
      allowNull: true
    },
    // IP and device info for analytics
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    device: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Device information for analytics'
    }
  }, {
    tableName: 'message_reads',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['messageId', 'userId']
      },
      {
        fields: ['messageId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['readAt']
      }
    ],
    hooks: {
      afterCreate: async (messageRead, options) => {
        // Update message read count
        await sequelize.models.Message.increment('readCount', {
          where: { id: messageRead.messageId }
        });

        // Update participant's read status
        const message = await sequelize.models.Message.findByPk(messageRead.messageId);
        if (message) {
          await sequelize.models.ConversationParticipant.update(
            {
              lastReadMessageId: messageRead.messageId,
              lastReadAt: messageRead.readAt,
              unreadCount: 0
            },
            {
              where: {
                conversationId: message.conversationId,
                userId: messageRead.userId
              }
            }
          );
        }
      }
    }
  });

  // Class methods
  MessageRead.markMessagesAsRead = async function(messageIds, userId, readFrom = 'web') {
    const readRecords = messageIds.map(messageId => ({
      messageId,
      userId,
      readFrom,
      readAt: new Date()
    }));

    return this.bulkCreate(readRecords, {
      ignoreDuplicates: true
    });
  };

  MessageRead.getReadReceipts = function(messageId) {
    return this.findAll({
      where: { messageId },
      include: [
        {
          model: sequelize.models.User,
          as: 'User',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['readAt', 'ASC']]
    });
  };

  MessageRead.getUserReadStatus = function(userId, conversationId) {
    return this.findAll({
      where: { userId },
      include: [
        {
          model: sequelize.models.Message,
          as: 'Message',
          where: { conversationId },
          attributes: ['id', 'createdAt']
        }
      ],
      order: [['readAt', 'DESC']],
      limit: 1
    });
  };

  MessageRead.getConversationReadStats = async function(conversationId) {
    const participants = await sequelize.models.ConversationParticipant.findAll({
      where: {
        conversationId,
        isActive: true
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'User',
          attributes: ['id', 'name']
        }
      ]
    });

    const totalMessages = await sequelize.models.Message.count({
      where: {
        conversationId,
        isDeleted: false
      }
    });

    const readStats = await Promise.all(
      participants.map(async (participant) => {
        const readCount = await this.count({
          include: [
            {
              model: sequelize.models.Message,
              as: 'Message',
              where: { conversationId },
              required: true
            }
          ],
          where: { userId: participant.userId }
        });

        return {
          userId: participant.userId,
          userName: participant.User.name,
          readCount,
          unreadCount: totalMessages - readCount,
          lastReadAt: participant.lastReadAt
        };
      })
    );

    return {
      conversationId,
      totalMessages,
      participants: readStats
    };
  };

  return MessageRead;
};
