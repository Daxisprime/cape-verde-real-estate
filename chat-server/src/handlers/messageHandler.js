const {
  Message,
  Conversation,
  ConversationParticipant,
  User,
  MessageRead
} = require('../models');
const logger = require('../utils/logger');

class MessageHandler {
  async handleSendMessage(socket, io, data, redisClient) {
    try {
      const { userId, userName } = socket;
      const {
        conversationId,
        content,
        type = 'text',
        replyToId,
        clientMessageId,
        metadata = {}
      } = data;

      // Validate input
      if (!conversationId || !content) {
        socket.emit('error', { message: 'Missing required fields' });
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
        socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
        return;
      }

      // Create message
      const message = await Message.create({
        conversationId,
        senderId: userId,
        content: content.trim(),
        type,
        replyToId,
        clientMessageId,
        metadata,
        status: 'sent'
      });

      // Load message with sender info
      const messageWithSender = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'Sender',
            attributes: ['id', 'name', 'avatar', 'role']
          },
          {
            model: Message,
            as: 'ReplyTo',
            attributes: ['id', 'content', 'type', 'senderId'],
            include: [
              {
                model: User,
                as: 'Sender',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      // Update conversation activity
      await Conversation.findByPk(conversationId).then(conv => {
        if (conv) conv.updateActivity();
      });

      // Get conversation participants
      const participants = await ConversationParticipant.findByConversation(conversationId);

      // Update unread counts for other participants
      await ConversationParticipant.updateUnreadCounts(conversationId, userId);

      // Emit to conversation room
      io.to(`conversation:${conversationId}`).emit('new_message', {
        ...messageWithSender.toJSON(),
        senderName: userName
      });

      // Send individual notifications to offline participants
      for (const participant of participants) {
        if (participant.userId !== userId) {
          io.to(`user:${participant.userId}`).emit('new_message_notification', {
            messageId: message.id,
            conversationId,
            senderName: userName,
            content: this.getMessagePreview(message),
            timestamp: message.createdAt
          });
        }
      }

      // Confirm to sender
      socket.emit('message_sent', {
        messageId: message.id,
        clientMessageId,
        timestamp: message.createdAt
      });

      // Cache in Redis for real-time features
      await this.cacheMessage(redisClient, message, messageWithSender);

      logger.info(`Message sent: ${message.id} in conversation ${conversationId} by user ${userId}`);

    } catch (error) {
      logger.error('Error handling send message:', error);
      socket.emit('error', {
        message: 'Failed to send message',
        clientMessageId: data.clientMessageId
      });
    }
  }

  async handleMarkRead(socket, io, data, redisClient) {
    try {
      const { userId } = socket;
      const { conversationId, messageId } = data;

      if (!conversationId || !messageId) {
        socket.emit('error', { message: 'Missing required fields' });
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
        socket.emit('error', { message: 'Not authorized to mark messages as read' });
        return;
      }

      // Mark message as read
      await MessageRead.findOrCreate({
        where: { messageId, userId },
        defaults: { readAt: new Date() }
      });

      // Update participant's read status
      await participant.markAsRead(messageId);

      // Notify message sender about read receipt
      const message = await Message.findByPk(messageId);
      if (message && message.senderId !== userId) {
        io.to(`user:${message.senderId}`).emit('message_read', {
          messageId,
          conversationId,
          readBy: userId,
          readAt: new Date()
        });
      }

      // Confirm to user
      socket.emit('message_marked_read', {
        messageId,
        conversationId
      });

    } catch (error) {
      logger.error('Error handling mark read:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  handleTypingStart(socket, data) {
    try {
      const { userId, userName } = socket;
      const { conversationId } = data;

      if (!conversationId) {
        socket.emit('error', { message: 'Missing conversation ID' });
        return;
      }

      // Emit typing indicator to conversation room (excluding sender)
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        userName,
        isTyping: true,
        timestamp: new Date().toISOString()
      });

      // Update participant typing status
      ConversationParticipant.findOne({
        where: { conversationId, userId, isActive: true }
      }).then(participant => {
        if (participant) {
          participant.updateTypingStatus(true);
        }
      });

    } catch (error) {
      logger.error('Error handling typing start:', error);
    }
  }

  handleTypingStop(socket, data) {
    try {
      const { userId, userName } = socket;
      const { conversationId } = data;

      if (!conversationId) {
        return;
      }

      // Emit stop typing to conversation room
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        userName,
        isTyping: false,
        timestamp: new Date().toISOString()
      });

      // Update participant typing status
      ConversationParticipant.findOne({
        where: { conversationId, userId, isActive: true }
      }).then(participant => {
        if (participant) {
          participant.updateTypingStatus(false);
        }
      });

    } catch (error) {
      logger.error('Error handling typing stop:', error);
    }
  }

  async handleScheduleViewing(socket, io, data, redisClient) {
    try {
      const { userId, userName } = socket;
      const {
        conversationId,
        propertyId,
        requestedDate,
        alternativeDates = [],
        message = ''
      } = data;

      if (!conversationId || !propertyId || !requestedDate) {
        socket.emit('error', { message: 'Missing required fields for viewing request' });
        return;
      }

      // Create viewing request message
      const viewingMessage = await Message.createViewingRequestMessage({
        conversationId,
        senderId: userId,
        propertyId,
        requestedDate,
        alternativeDates,
        message,
        content: `${userName} requested a viewing for ${new Date(requestedDate).toLocaleDateString()}`
      });

      // Load with sender info
      const messageWithSender = await Message.findByPk(viewingMessage.id, {
        include: [
          {
            model: User,
            as: 'Sender',
            attributes: ['id', 'name', 'avatar', 'role']
          }
        ]
      });

      // Emit to conversation
      io.to(`conversation:${conversationId}`).emit('new_message', {
        ...messageWithSender.toJSON(),
        senderName: userName
      });

      // Update unread counts
      await ConversationParticipant.updateUnreadCounts(conversationId, userId);

      socket.emit('viewing_request_sent', {
        messageId: viewingMessage.id,
        timestamp: viewingMessage.createdAt
      });

      logger.info(`Viewing request sent: ${viewingMessage.id} for property ${propertyId}`);

    } catch (error) {
      logger.error('Error handling schedule viewing:', error);
      socket.emit('error', { message: 'Failed to send viewing request' });
    }
  }

  async handleSubmitOffer(socket, io, data, redisClient) {
    try {
      const { userId, userName } = socket;
      const {
        conversationId,
        propertyId,
        amount,
        currency = 'EUR',
        terms = '',
        validUntil
      } = data;

      if (!conversationId || !propertyId || !amount) {
        socket.emit('error', { message: 'Missing required fields for offer submission' });
        return;
      }

      // Create offer message
      const offerMessage = await Message.createOfferMessage({
        conversationId,
        senderId: userId,
        propertyId,
        offerData: {
          amount,
          currency,
          terms,
          validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
        },
        content: `${userName} submitted an offer of ${currency}${amount.toLocaleString()}`
      });

      // Load with sender info
      const messageWithSender = await Message.findByPk(offerMessage.id, {
        include: [
          {
            model: User,
            as: 'Sender',
            attributes: ['id', 'name', 'avatar', 'role']
          }
        ]
      });

      // Emit to conversation
      io.to(`conversation:${conversationId}`).emit('new_message', {
        ...messageWithSender.toJSON(),
        senderName: userName
      });

      // Update unread counts
      await ConversationParticipant.updateUnreadCounts(conversationId, userId);

      socket.emit('offer_submitted', {
        messageId: offerMessage.id,
        timestamp: offerMessage.createdAt
      });

      logger.info(`Offer submitted: ${offerMessage.id} for property ${propertyId} - ${currency}${amount}`);

    } catch (error) {
      logger.error('Error handling submit offer:', error);
      socket.emit('error', { message: 'Failed to submit offer' });
    }
  }

  getMessagePreview(message) {
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
      default:
        preview = message.content || 'Message';
    }

    return preview.length > maxLength ?
      preview.substring(0, maxLength) + '...' :
      preview;
  }

  async cacheMessage(redisClient, message, messageWithSender) {
    try {
      const cacheKey = `message:${message.id}`;
      await redisClient.setex(
        cacheKey,
        3600, // 1 hour TTL
        JSON.stringify(messageWithSender.toJSON())
      );

      // Cache latest messages for conversation
      const conversationKey = `conversation:${message.conversationId}:latest`;
      await redisClient.lpush(conversationKey, message.id);
      await redisClient.ltrim(conversationKey, 0, 50); // Keep latest 50 messages
      await redisClient.expire(conversationKey, 3600);

    } catch (error) {
      logger.error('Error caching message:', error);
    }
  }
}

module.exports = new MessageHandler();
