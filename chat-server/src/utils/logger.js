const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Create log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...args } = info;
    const additional = Object.keys(args).length ? JSON.stringify(args, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${additional}`;
  })
);

// Create file format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...args } = info;
    const additional = Object.keys(args).length ? JSON.stringify(args, null, 2) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${additional}`;
  })
);

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format
  })
];

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  // Create logs directory if it doesn't exist
  const fs = require('fs');
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // General log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      level: 'info',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );

  // HTTP access log
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

// Add structured logging methods
logger.logWebSocket = (event, data) => {
  logger.info(`WebSocket: ${event}`, data);
};

logger.logChatEvent = (eventType, userId, conversationId, data = {}) => {
  logger.info(`Chat: ${eventType}`, {
    userId,
    conversationId,
    ...data
  });
};

logger.logPresence = (userId, status, details = {}) => {
  logger.info(`Presence: ${status}`, {
    userId,
    ...details
  });
};

logger.logFileUpload = (fileId, userId, fileName, fileSize) => {
  logger.info('File Upload', {
    fileId,
    userId,
    fileName,
    fileSize
  });
};

logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...metadata
  });
};

logger.logSecurity = (event, userId, ipAddress, details = {}) => {
  logger.warn(`Security: ${event}`, {
    userId,
    ipAddress,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logDatabase = (operation, table, duration, recordCount = null) => {
  logger.debug(`Database: ${operation}`, {
    table,
    duration: `${duration}ms`,
    recordCount
  });
};

logger.logAPI = (method, endpoint, statusCode, duration, userId = null) => {
  logger.http(`API: ${method} ${endpoint}`, {
    statusCode,
    duration: `${duration}ms`,
    userId
  });
};

// Error handling for unhandled exceptions
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log')
    })
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log')
    })
  );
}

// Log startup information
logger.info('Logger initialized', {
  level: logger.level,
  environment: process.env.NODE_ENV || 'development',
  transports: transports.map(t => t.constructor.name)
});

module.exports = logger;
