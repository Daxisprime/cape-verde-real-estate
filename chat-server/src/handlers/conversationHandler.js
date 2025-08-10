const {
  Conversation,
  ConversationParticipant,
  User,
  Message
} = require('../models');
const logger = require('../utils/logger');

class ConversationHandler {
  async handleJoinConversation(socket, data) {
    try {
      const { userId } = socket;
      const { conversationId } = data;

      if (!conversationId) {
        socket.emit('error', { message: 'Missing conversation ID' });
        return;
      }

      // Verify user is participant
      const participant = await ConversationParticipant.findOne({
        where: {
          conversationId,
          userId,
          isActive: true
        }
      });

      if (!participant) {
        socket.emit('error', { message: 'Not authorized to join this conversation' });
        return;
      }

      // Join Socket.IO room
      socket.join(`conversation:${conversationId}`);

      // Update participant activity
      await participant.update({ lastReadAt: new Date() });

      socket.emit('conversation_joined', {
        conversationId,
        timestamp: new Date()
      });

      logger.info(`User ${userId} joined conversation ${conversationId}`);

    } catch (error) {
      logger.error('Error handling join conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  }

  async handleLeaveConversation(socket, data) {
    try {
      const { userId } = socket;
      const { conversationId } = data;

      if (!conversationId) {
        socket.emit('error', { message: 'Missing conversation ID' });
        return;
      }

      // Leave Socket.IO room
      socket.leave(`conversation:${conversationId}`);

      socket.emit('conversation_left', {
        conversationId,
        timestamp: new Date()
      });

      logger.info(`User ${userId} left conversation ${conversationId}`);

    } catch (error) {
      logger.error('Error handling leave conversation:', error);
    }
  }

  async handleCreateConversation(socket, io, data, redisClient) {
    try {
      const { userId, userName } = socket;
      const {
        participantIds = [],
        type = 'direct',
        title,
        metadata = {}
      } = data;

      // Validate participants
      if (participantIds.length === 0) {
        socket.emit('error', { message: 'At least one participant is required' });
        return;
      }

      // Add creator to participants if not included
      const allParticipantIds = participantIds.includes(userId) ?
        participantIds : [userId, ...participantIds];

      // For direct conversations, ensure only 2 participants
      if (type === 'direct' && allParticipantIds.length !== 2) {
        socket.emit('error', { message: 'Direct conversations must have exactly 2 participants' });
        return;
      }

      // Check if direct conversation already exists
      if (type === 'direct') {
        const existingConversation = await this.findExistingDirectConversation(allParticipantIds);
        if (existingConversation) {
          socket.emit('conversation_exists', {
            conversation: existingConversation,
            message: 'Direct conversation already exists'
          });
          return;
        }
      }

      // Verify all participants exist
      const users = await User.findAll({
        where: {
          id: allParticipantIds,
          isActive: true
        },
        attributes: ['id', 'name', 'avatar', 'role']
      });

      if (users.length !== allParticipantIds.length) {
        socket.emit('error', { message: 'One or more participants not found' });
        return;
      }

      // Create conversation
      const conversation = await Conversation.create({
        type,
        title: title || this.generateConversationTitle(type, users, userId),
        createdBy: userId,
        metadata,
        participantCount: allParticipantIds.length
      });

      // Add participants
      const participantPromises = allParticipantIds.map(participantId =>
        ConversationParticipant.create({
          conversationId: conversation.id,
          userId: participantId,
          role: participantId === userId ? 'admin' : 'participant',
          joinedAt: new Date()
        })
      );

      await Promise.all(participantPromises);

      // Load conversation with participants
      const conversationWithData = await Conversation.findByPk(conversation.id, {
        include: [
          {
            model: ConversationParticipant,
            as: 'Participants',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'name', 'avatar', 'role', 'isOnline', 'status']
              }
            ]
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'name', 'role']
          }
        ]
      });

      // Join all participants to the conversation room
      for (const participantId of allParticipantIds) {
        io.to(`user:${participantId}`).emit('conversation_created', {
          conversation: conversationWithData.toJSON()
        });

        // Join them to the conversation room if they're online
        const userSockets = io.sockets.adapter.rooms.get(`user:${participantId}`);
        if (userSockets) {
          for (const socketId of userSockets) {
            io.sockets.sockets.get(socketId)?.join(`conversation:${conversation.id}`);
          }
        }
      }

      // Create system message
      await Message.createSystemMessage(
        conversation.id,
        `${userName} created this conversation`,
        { createdBy: userId }
      );

      socket.emit('conversation_created', {
        conversation: conversationWithData.toJSON()
      });

      logger.info(`Conversation created: ${conversation.id} by user ${userId}`);

    } catch (error) {
      logger.error('Error handling create conversation:', error);
      socket.emit('error', { message: 'Failed to create conversation' });
    }
  }

  async handlePropertyInquiry(socket, io, data, redisClient) {
    try {
      const { userId, userName } = socket;
      const {
        propertyId,
        agentId,
        message,
        propertyTitle,
        propertyImage,
        inquiryType = 'general'
      } = data;

      if (!propertyId || !agentId || !message) {
        socket.emit('error', { message: 'Missing required fields for property inquiry' });
        return;
      }

      // Verify agent exists and is an agent
      const agent = await User.findOne({
        where: {
          id: agentId,
          role: 'agent',
          isActive: true
        }
      });

      if (!agent) {
        socket.emit('error', { message: 'Agent not found or inactive' });
        return;
      }

      // Check if conversation already exists for this property
      const existingConversations = await Conversation.findByPropertyId(propertyId, userId);
      const existingConversation = existingConversations.find(conv =>
        conv.Participants.some(p => p.userId === agentId)
      );

      if (existingConversation) {
        // Send message to existing conversation
        const newMessage = await Message.create({
          conversationId: existingConversation.id,
          senderId: userId,
          content: message,
          type: 'text',
          status: 'sent'
        });

        // Load with sender info
        const messageWithSender = await Message.findByPk(newMessage.id, {
          include: [
            {
              model: User,
              as: 'Sender',
              attributes: ['id', 'name', 'avatar', 'role']
            }
          ]
        });

        // Emit to conversation
        io.to(`conversation:${existingConversation.id}`).emit('new_message', {
          ...messageWithSender.toJSON(),
          senderName: userName
        });

        socket.emit('property_inquiry_sent', {
          conversationId: existingConversation.id,
          messageId: newMessage.id,
          existing: true
        });

        return;
      }

      // Create new property inquiry conversation
      const conversation = await Conversation.createPropertyInquiry({
        propertyId,
        propertyTitle,
        propertyImage,
        inquiryType,
        buyerId: userId
      });

      // Add participants (buyer and agent)
      await Promise.all([
        ConversationParticipant.create({
          conversationId: conversation.id,
          userId: userId,
          role: 'participant'
        }),
        ConversationParticipant.create({
          conversationId: conversation.id,
          userId: agentId,
          role: 'participant'
        })
      ]);

      // Create initial message
      const initialMessage = await Message.create({
        conversationId: conversation.id,
        senderId: userId,
        content: message,
        type: 'text',
        status: 'sent'
      });

      // Load conversation with all data
      const conversationWithData = await Conversation.findByPk(conversation.id, {
        include: [
          {
            model: ConversationParticipant,
            as: 'Participants',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'name', 'avatar', 'role', 'isOnline', 'status']
              }
            ]
          }
        ]
      });

      // Notify both participants
      io.to(`user:${userId}`).emit('conversation_created', {
        conversation: conversationWithData.toJSON()
      });

      io.to(`user:${agentId}`).emit('conversation_created', {
        conversation: conversationWithData.toJSON()
      });

      io.to(`user:${agentId}`).emit('property_inquiry_received', {
        conversationId: conversation.id,
        propertyId,
        buyerName: userName,
        message,
        timestamp: new Date()
      });

      // Join both users to conversation room
      const buyerSockets = io.sockets.adapter.rooms.get(`user:${userId}`);
      const agentSockets = io.sockets.adapter.rooms.get(`user:${agentId}`);

      if (buyerSockets) {
        for (const socketId of buyerSockets) {
          io.sockets.sockets.get(socketId)?.join(`conversation:${conversation.id}`);
        }
      }

      if (agentSockets) {
        for (const socketId of agentSockets) {
          io.sockets.sockets.get(socketId)?.join(`conversation:${conversation.id}`);
        }
      }

      socket.emit('property_inquiry_sent', {
        conversationId: conversation.id,
        messageId: initialMessage.id,
        existing: false
      });

      logger.info(`Property inquiry created: ${conversation.id} for property ${propertyId}`);

    } catch (error) {
      logger.error('Error handling property inquiry:', error);
      socket.emit('error', { message: 'Failed to create property inquiry' });
    }
  }

  async findExistingDirectConversation(participantIds) {
    try {
      const conversations = await Conversation.findAll({
        where: {
          type: 'direct',
          isActive: true
        },
        include: [
          {
            model: ConversationParticipant,
            as: 'Participants',
            where: { isActive: true },
            required: true
          }
        ]
      });

      // Find conversation with exactly these participants
      for (const conv of conversations) {
        const convParticipantIds = conv.Participants.map(p => p.userId).sort();
        const sortedParticipantIds = participantIds.sort();

        if (convParticipantIds.length === sortedParticipantIds.length &&
            convParticipantIds.every((id, index) => id === sortedParticipantIds[index])) {
          return conv;
        }
      }

      return null;

    } catch (error) {
      logger.error('Error finding existing direct conversation:', error);
      return null;
    }
  }

  generateConversationTitle(type, users, creatorId) {
    switch (type) {
      case 'direct':
        const otherUser = users.find(u => u.id !== creatorId);
        return `Chat with ${otherUser?.name || 'User'}`;

      case 'group':
        if (users.length <= 3) {
          return users.map(u => u.name).join(', ');
        }
        return `Group chat (${users.length} members)`;

      case 'property_inquiry':
        return 'Property Inquiry';

      case 'support':
        return 'Support Chat';

      default:
        return 'Conversation';
    }
  }

  // Conversation management methods
  async getConversationParticipants(conversationId) {
    try {
      return await ConversationParticipant.findByConversation(conversationId);
    } catch (error) {
      logger.error('Error getting conversation participants:', error);
      return [];
    }
  }

  async addParticipantToConversation(conversationId, userId, addedBy) {
    try {
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const participant = await ConversationParticipant.addParticipant(
        conversationId,
        userId,
        addedBy
      );

      await conversation.increment('participantCount');

      // Create system message
      const user = await User.findByPk(userId, { attributes: ['name'] });
      const adder = await User.findByPk(addedBy, { attributes: ['name'] });

      await Message.createSystemMessage(
        conversationId,
        `${adder?.name} added ${user?.name} to the conversation`,
        { addedBy, addedUser: userId }
      );

      return participant;

    } catch (error) {
      logger.error('Error adding participant:', error);
      throw error;
    }
  }

  async removeParticipantFromConversation(conversationId, userId, removedBy) {
    try {
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await ConversationParticipant.removeParticipant(conversationId, userId);
      await conversation.decrement('participantCount');

      // Create system message
      const user = await User.findByPk(userId, { attributes: ['name'] });
      const remover = await User.findByPk(removedBy, { attributes: ['name'] });

      await Message.createSystemMessage(
        conversationId,
        `${remover?.name} removed ${user?.name} from the conversation`,
        { removedBy, removedUser: userId }
      );

      return true;

    } catch (error) {
      logger.error('Error removing participant:', error);
      throw error;
    }
  }

  async archiveConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await conversation.archive(userId);
      return true;

    } catch (error) {
      logger.error('Error archiving conversation:', error);
      throw error;
    }
  }
}

module.exports = new ConversationHandler();
