module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('buyer', 'agent', 'admin'),
      allowNull: false,
      defaultValue: 'buyer'
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true
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
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        notifications: {
          newMessages: true,
          viewingRequests: true,
          offers: true,
          mentions: true,
          sound: true,
          desktop: true
        },
        privacy: {
          showOnlineStatus: true,
          showTypingIndicator: true,
          allowFileSharing: true,
          readReceipts: true
        },
        display: {
          theme: 'light',
          fontSize: 'medium',
          enterToSend: true,
          showTimestamps: true
        }
      }
    },
    // Additional user fields for real estate context
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    island: {
      type: DataTypes.STRING,
      allowNull: true
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
      validate: {
        isIn: [['en', 'pt', 'cv']]
      }
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Atlantic/Cape_Verde'
    },
    // Agent-specific fields
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    agencyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    specializations: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Security and verification
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['isOnline']
      },
      {
        fields: ['status']
      },
      {
        fields: ['island']
      },
      {
        fields: ['isActive']
      }
    ],
    hooks: {
      beforeUpdate: (user, options) => {
        if (user.changed('status') || user.changed('isOnline')) {
          user.lastSeen = new Date();
        }
      }
    }
  });

  // Instance methods
  User.prototype.toSafeJSON = function() {
    const user = this.toJSON();
    delete user.password;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    return user;
  };

  User.prototype.updatePresence = function(status, isOnline = true) {
    return this.update({
      status,
      isOnline,
      lastSeen: new Date()
    });
  };

  User.prototype.updatePreferences = function(newPreferences) {
    const currentPreferences = this.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...newPreferences
    };
    return this.update({ preferences: updatedPreferences });
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({
      where: {
        email: email.toLowerCase(),
        isActive: true
      }
    });
  };

  User.findOnlineUsers = function() {
    return this.findAll({
      where: {
        isOnline: true,
        isActive: true
      },
      attributes: ['id', 'name', 'avatar', 'role', 'status', 'statusMessage']
    });
  };

  User.findAgents = function(options = {}) {
    const where = {
      role: 'agent',
      isActive: true
    };

    if (options.island) {
      where.island = options.island;
    }

    if (options.online) {
      where.isOnline = true;
    }

    return this.findAll({
      where,
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'licenseNumber', 'agencyName', 'specializations', 'island', 'isOnline', 'status'],
      order: [['isOnline', 'DESC'], ['name', 'ASC']]
    });
  };

  return User;
};
