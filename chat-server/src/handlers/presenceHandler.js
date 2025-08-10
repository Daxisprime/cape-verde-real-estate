const { User, UserPresence } = require('../models');
const logger = require('../utils/logger');

class PresenceHandler {
  async handleUserOnline(socket, io, redisClient) {
    try {
      const { userId, userName } = socket;

      // Get or create user presence
      const [presence] = await UserPresence.findOrCreateForUser(userId);

      // Set user online
      await presence.setOnline({
        socketId: socket.id,
        device: this.getDeviceInfo(socket),
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent']
      });

      // Update user model
      await User.update(
        {
          isOnline: true,
          status: 'online',
          lastSeen: new Date()
        },
        { where: { id: userId } }
      );

      // Cache online status in Redis
      await this.updateRedisPresence(redisClient, userId, {
        isOnline: true,
        status: 'online',
        lastSeen: new Date().toISOString(),
        userName
      });

      // Broadcast user online status
      socket.broadcast.emit('user_status_updated', {
        userId,
        userName,
        isOnline: true,
        status: 'online',
        lastSeen: new Date()
      });

      // Join user's presence room
      socket.join(`presence:${userId}`);

      logger.info(`User ${userId} (${userName}) is now online`);

    } catch (error) {
      logger.error('Error handling user online:', error);
    }
  }

  async handleUserOffline(userId, io, redisClient, socketId = null) {
    try {
      // Get user presence
      const presence = await UserPresence.findOne({ where: { userId } });
      if (!presence) return;

      // Set user offline
      await presence.setOffline(socketId);

      // If no more active connections, mark as offline
      if (presence.activeConnections === 0) {
        await User.update(
          {
            isOnline: false,
            status: 'offline',
            lastSeen: new Date()
          },
          { where: { id: userId } }
        );

        // Update Redis
        await this.updateRedisPresence(redisClient, userId, {
          isOnline: false,
          status: 'offline',
          lastSeen: new Date().toISOString()
        });

        // Broadcast offline status
        io.emit('user_status_updated', {
          userId,
          isOnline: false,
          status: 'offline',
          lastSeen: new Date()
        });

        logger.info(`User ${userId} is now offline`);
      }

    } catch (error) {
      logger.error('Error handling user offline:', error);
    }
  }

  async handleStatusUpdate(socket, io, data, redisClient) {
    try {
      const { userId, userName } = socket;
      const { status, statusMessage } = data;

      if (!['online', 'away', 'busy'].includes(status)) {
        socket.emit('error', { message: 'Invalid status' });
        return;
      }

      // Update user presence
      const presence = await UserPresence.findOne({ where: { userId } });
      if (presence) {
        await presence.setStatus(status, statusMessage);
      }

      // Update user model
      await User.update(
        { status, statusMessage },
        { where: { id: userId } }
      );

      // Update Redis
      await this.updateRedisPresence(redisClient, userId, {
        status,
        statusMessage
      });

      // Broadcast status update
      io.emit('user_status_updated', {
        userId,
        userName,
        status,
        statusMessage,
        isOnline: presence?.isOnline || false
      });

      socket.emit('status_updated', { status, statusMessage });

      logger.info(`User ${userId} status updated to: ${status}`);

    } catch (error) {
      logger.error('Error handling status update:', error);
      socket.emit('error', { message: 'Failed to update status' });
    }
  }

  async sendOnlineUsers(socket, redisClient) {
    try {
      // Get online users from Redis first (faster)
      const onlineUsers = await this.getOnlineUsersFromRedis(redisClient);

      if (onlineUsers.length > 0) {
        socket.emit('online_users', onlineUsers);
      } else {
        // Fallback to database
        const users = await UserPresence.getOnlineUsers();
        const onlineData = users.map(presence => ({
          userId: presence.userId,
          userName: presence.User.name,
          avatar: presence.User.avatar,
          role: presence.User.role,
          status: presence.status,
          statusMessage: presence.statusMessage,
          isOnline: presence.isOnline
        }));

        socket.emit('online_users', onlineData);
      }

    } catch (error) {
      logger.error('Error sending online users:', error);
    }
  }

  async getOnlineUsersFromRedis(redisClient) {
    try {
      const keys = await redisClient.keys('presence:*');
      const presenceData = await redisClient.mget(keys);

      return presenceData
        .filter(data => data)
        .map(data => JSON.parse(data))
        .filter(presence => presence.isOnline);

    } catch (error) {
      logger.error('Error getting online users from Redis:', error);
      return [];
    }
  }

  async updateRedisPresence(redisClient, userId, presenceData) {
    try {
      const key = `presence:${userId}`;
      const existingData = await redisClient.get(key);

      const updatedData = existingData ?
        { ...JSON.parse(existingData), ...presenceData } :
        presenceData;

      await redisClient.setex(key, 300, JSON.stringify(updatedData)); // 5 minutes TTL

    } catch (error) {
      logger.error('Error updating Redis presence:', error);
    }
  }

  getDeviceInfo(socket) {
    const userAgent = socket.handshake.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);

    let deviceType = 'desktop';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';

    // Extract browser info
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'chrome';
    else if (userAgent.includes('Firefox')) browser = 'firefox';
    else if (userAgent.includes('Safari')) browser = 'safari';
    else if (userAgent.includes('Edge')) browser = 'edge';

    // Extract OS info
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'windows';
    else if (userAgent.includes('Mac')) os = 'macos';
    else if (userAgent.includes('Linux')) os = 'linux';
    else if (userAgent.includes('Android')) os = 'android';
    else if (userAgent.includes('iOS')) os = 'ios';

    return {
      type: deviceType,
      browser,
      os,
      userAgent: userAgent.substring(0, 200) // Truncate for storage
    };
  }

  // Cleanup methods for maintenance
  async cleanupStalePresence(redisClient) {
    try {
      // Clean up database
      await UserPresence.cleanupStaleConnections();

      // Clean up Redis
      const keys = await redisClient.keys('presence:*');
      const staleKeys = [];

      for (const key of keys) {
        const data = await redisClient.get(key);
        if (data) {
          const presence = JSON.parse(data);
          const lastActivity = new Date(presence.lastSeen || presence.lastActivity);
          const isStale = Date.now() - lastActivity.getTime() > 5 * 60 * 1000; // 5 minutes

          if (isStale) {
            staleKeys.push(key);
          }
        }
      }

      if (staleKeys.length > 0) {
        await redisClient.del(staleKeys);
        logger.info(`Cleaned up ${staleKeys.length} stale presence records`);
      }

    } catch (error) {
      logger.error('Error cleaning up stale presence:', error);
    }
  }

  async autoAwayUpdate() {
    try {
      await UserPresence.autoAwayUpdate();
      logger.info('Auto-away update completed');
    } catch (error) {
      logger.error('Error in auto-away update:', error);
    }
  }

  // Periodic maintenance (should be called by a cron job)
  startMaintenanceTasks(redisClient, intervalMinutes = 5) {
    setInterval(async () => {
      await this.cleanupStalePresence(redisClient);
      await this.autoAwayUpdate();
    }, intervalMinutes * 60 * 1000);

    logger.info(`Presence maintenance tasks started (interval: ${intervalMinutes} minutes)`);
  }

  // Get presence statistics
  async getPresenceStats() {
    try {
      const [globalStats] = await UserPresence.getGlobalStats();
      const onlineUsers = await UserPresence.getOnlineUsers();

      const statusBreakdown = onlineUsers.reduce((acc, presence) => {
        acc[presence.status] = (acc[presence.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalUsers: globalStats.totalUsers,
        onlineUsers: globalStats.onlineUsers,
        averageOnlineTime: globalStats.avgOnlineTime,
        totalSessions: globalStats.totalSessions,
        statusBreakdown,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting presence stats:', error);
      return null;
    }
  }
}

module.exports = new PresenceHandler();
