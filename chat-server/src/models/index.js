const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DATABASE_URL || config.database,
  process.env.DATABASE_USERNAME || config.username,
  process.env.DATABASE_PASSWORD || config.password,
  {
    host: process.env.DATABASE_HOST || config.host,
    port: process.env.DATABASE_PORT || config.port,
    dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Conversation = require('./Conversation')(sequelize, Sequelize.DataTypes);
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const ConversationParticipant = require('./ConversationParticipant')(sequelize, Sequelize.DataTypes);
const MessageRead = require('./MessageRead')(sequelize, Sequelize.DataTypes);
const FileAttachment = require('./FileAttachment')(sequelize, Sequelize.DataTypes);
const UserPresence = require('./UserPresence')(sequelize, Sequelize.DataTypes);

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Conversation, {
    foreignKey: 'createdBy',
    as: 'CreatedConversations'
  });
  User.hasMany(Message, {
    foreignKey: 'senderId',
    as: 'SentMessages'
  });
  User.hasMany(ConversationParticipant, {
    foreignKey: 'userId',
    as: 'Participations'
  });
  User.hasMany(MessageRead, {
    foreignKey: 'userId',
    as: 'ReadMessages'
  });
  User.hasOne(UserPresence, {
    foreignKey: 'userId',
    as: 'Presence'
  });

  // Conversation associations
  Conversation.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'Creator'
  });
  Conversation.hasMany(Message, {
    foreignKey: 'conversationId',
    as: 'Messages'
  });
  Conversation.hasMany(ConversationParticipant, {
    foreignKey: 'conversationId',
    as: 'Participants'
  });
  Conversation.belongsToMany(User, {
    through: ConversationParticipant,
    foreignKey: 'conversationId',
    otherKey: 'userId',
    as: 'Users'
  });

  // Message associations
  Message.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'Sender'
  });
  Message.belongsTo(Conversation, {
    foreignKey: 'conversationId',
    as: 'Conversation'
  });
  Message.belongsTo(Message, {
    foreignKey: 'replyToId',
    as: 'ReplyTo'
  });
  Message.hasMany(Message, {
    foreignKey: 'replyToId',
    as: 'Replies'
  });
  Message.hasMany(MessageRead, {
    foreignKey: 'messageId',
    as: 'ReadReceipts'
  });
  Message.hasMany(FileAttachment, {
    foreignKey: 'messageId',
    as: 'Attachments'
  });

  // ConversationParticipant associations
  ConversationParticipant.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
  });
  ConversationParticipant.belongsTo(Conversation, {
    foreignKey: 'conversationId',
    as: 'Conversation'
  });

  // MessageRead associations
  MessageRead.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
  });
  MessageRead.belongsTo(Message, {
    foreignKey: 'messageId',
    as: 'Message'
  });

  // FileAttachment associations
  FileAttachment.belongsTo(Message, {
    foreignKey: 'messageId',
    as: 'Message'
  });
  FileAttachment.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'Uploader'
  });

  // UserPresence associations
  UserPresence.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
  });
};

// Define associations
defineAssociations();

module.exports = {
  sequelize,
  Sequelize,
  User,
  Conversation,
  Message,
  ConversationParticipant,
  MessageRead,
  FileAttachment,
  UserPresence
};
