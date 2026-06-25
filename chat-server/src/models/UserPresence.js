module.exports = (sequelize, DataTypes) => {
  const UserPresence = sequelize.define('UserPresence', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Online status
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('online', 'away', 'busy', 'offline'),
      defaultValue: 'offline'
    },
    statusMessage: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    // Timestamps
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastActivity: {
      type: DataTypes.DATE,
      allowNull: true
    },
    onlineSince: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Connection information
    activeConnections: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of active socket connections'
    },
    connections: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of connection details'
    },
    // Device and location info
    lastDevice: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Last device information'
    },
    lastLocation: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Last known location (country, city)'
    },
    lastIpAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastUserAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Typing status
    isTyping: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    typingInConversation: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'conversations',
        key: 'id'
      }
    },
    lastTypingAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Privacy settings
    showOnlineStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    showLastSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    showTypingIndicator: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Analytics
    totalOnlineTime: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: 'Total online time in milliseconds'
    },
    sessionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastSessionDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Last session duration in milliseconds'
    },
    // Auto-away settings
    autoAwayMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
      comment: 'Minutes of inactivity before auto-away'
    },
    autoOfflineMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      comment: 'Minutes of inactivity before auto-offline'
    }
  }, {
    tableName: 'user_presence',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['userId']
      },
      {
        fields: ['isOnline']
      },
      {
        fields: ['status']
      },
      {
        fields: ['lastActivity']
      },
      {
        fields: ['lastSeen']
      },
      {
        fields: ['typingInConversation']
      }
    ]
  });

  // Instance methods
  UserPresence.prototype.setOnline = function(connectionInfo = {}) {
    const now = new Date();
    const wasOffline = !this.isOnline;

    const connections = this.connections || [];
    connections.push({
      id: connectionInfo.socketId,
      connectedAt: now,
      device: connectionInfo.device,
      ipAddress: connectionInfo.ipAddress,
      userAgent: connectionInfo.userAgent
    });

    return this.update({
      isOnline: true,
      status: 'online',
      lastActivity: now,
      lastSeen: now,
      onlineSince: wasOffline ? now : this.onlineSince,
      activeConnections: this.activeConnections + 1,
      connections,
      lastDevice: connectionInfo.device,
      lastIpAddress: connectionInfo.ipAddress,
      lastUserAgent: connectionInfo.userAgent,
      sessionCount: wasOffline ? this.sessionCount + 1 : this.sessionCount
    });
  };

  UserPresence.prototype.setOffline = function(connectionId = null) {
    const now = new Date();
    let connections = this.connections || [];

    if (connectionId) {
      connections = connections.filter(conn => conn.id !== connectionId);
    } else {
      connections = [];
    }

    const sessionDuration = this.onlineSince ?
      now.getTime() - new Date(this.onlineSince).getTime() : 0;

    const updates = {
      lastActivity: now,
      lastSeen: now,
      activeConnections: connections.length,
      connections,
      isTyping: false,
      typingInConversation: null
    };

    // Only go offline if no active connections
    if (connections.length === 0) {
      updates.isOnline = false;
      updates.status = 'offline';
      updates.onlineSince = null;
      updates.lastSessionDuration = sessionDuration;
      updates.totalOnlineTime = this.totalOnlineTime + sessionDuration;
    }

    return this.update(updates);
  };

  UserPresence.prototype.updateActivity = function() {
    return this.update({
      lastActivity: new Date()
    });
  };

  UserPresence.prototype.setStatus = function(status, statusMessage = null) {
    return this.update({
      status,
      statusMessage,
      lastActivity: new Date()
    });
  };

  UserPresence.prototype.setTyping = function(conversationId, isTyping = true) {
    if (!this.showTypingIndicator) {
      return Promise.resolve(this);
    }

    return this.update({
      isTyping,
      typingInConversation: isTyping ? conversationId : null,
      lastTypingAt: isTyping ? new Date() : this.lastTypingAt,
      lastActivity: new Date()
    });
  };

  UserPresence.prototype.updatePrivacySettings = function(settings) {
    return this.update({
      showOnlineStatus: settings.showOnlineStatus !== undefined ?
        settings.showOnlineStatus : this.showOnlineStatus,
      showLastSeen: settings.showLastSeen !== undefined ?
        settings.showLastSeen : this.showLastSeen,
      showTypingIndicator: settings.showTypingIndicator !== undefined ?
        settings.showTypingIndicator : this.showTypingIndicator
    });
  };

  UserPresence.prototype.getPublicPresence = function() {
    return {
      userId: this.userId,
      isOnline: this.showOnlineStatus ? this.isOnline : false,
      status: this.showOnlineStatus ? this.status : 'offline',
      statusMessage: this.showOnlineStatus ? this.statusMessage : null,
      lastSeen: this.showLastSeen && !this.isOnline ? this.lastSeen : null,
      isTyping: this.showTypingIndicator ? this.isTyping : false,
      typingInConversation: this.showTypingIndicator ? this.typingInConversation : null
    };
  };

  // Class methods
  UserPresence.findOrCreateForUser = function(userId) {
    return this.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        isOnline: false,
        status: 'offline'
      }
    });
  };

  UserPresence.getOnlineUsers = function(options = {}) {
    const where = {
      isOnline: true
    };

    if (options.showOnlineStatus !== false) {
      where.showOnlineStatus = true;
    }

    return this.findAll({
      where,
      include: [
        {
          model: sequelize.models.User,
          as: 'User',
          attributes: ['id', 'name', 'avatar', 'role']
        }
      ],
      order: [['lastActivity', 'DESC']]
    });
  };

  UserPresence.getTypingUsers = function(conversationId) {
    return this.findAll({
      where: {
        isTyping: true,
        typingInConversation: conversationId,
        showTypingIndicator: true,
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

  UserPresence.updateUserActivity = function(userId) {
    return this.update(
      {
        lastActivity: new Date()
      },
      {
        where: { userId }
      }
    );
  };

  UserPresence.cleanupStaleConnections = async function() {
    const staleThreshold = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago

    const stalePresences = await this.findAll({
      where: {
        isOnline: true,
        lastActivity: {
          [sequelize.Op.lt]: staleThreshold
        }
      }
    });

    const cleanupPromises = stalePresences.map(presence =>
      presence.setOffline()
    );

    return Promise.all(cleanupPromises);
  };

  UserPresence.autoAwayUpdate = async function() {
    const now = new Date();

    // Auto-away: users inactive for their autoAwayMinutes
    await this.update(
      { status: 'away' },
      {
        where: {
          isOnline: true,
          status: 'online',
          lastActivity: {
            [sequelize.Op.lt]: sequelize.literal(`NOW() - INTERVAL autoAwayMinutes MINUTE`)
          }
        }
      }
    );

    // Auto-offline: users inactive for their autoOfflineMinutes
    const autoOfflineUsers = await this.findAll({
      where: {
        isOnline: true,
        lastActivity: {
          [sequelize.Op.lt]: sequelize.literal(`NOW() - INTERVAL autoOfflineMinutes MINUTE`)
        }
      }
    });

    const offlinePromises = autoOfflineUsers.map(presence =>
      presence.setOffline()
    );

    return Promise.all(offlinePromises);
  };

  UserPresence.getUserStats = function(userId) {
    return this.findOne({
      where: { userId },
      attributes: [
        'totalOnlineTime',
        'sessionCount',
        'lastSessionDuration',
        'createdAt',
        'lastSeen'
      ]
    });
  };

  UserPresence.getGlobalStats = function() {
    return this.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalUsers'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN isOnline THEN 1 END')), 'onlineUsers'],
        [sequelize.fn('AVG', sequelize.col('totalOnlineTime')), 'avgOnlineTime'],
        [sequelize.fn('SUM', sequelize.col('sessionCount')), 'totalSessions']
      ],
      raw: true
    });
  };

  return UserPresence;
};
