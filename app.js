const { createServer } = require('node:http');
const config = require('./config/env');
const router = require('./http/routes');
const { requestLogger, logger } = require('./utils/logger');

const server = createServer((req, res) => {
  // log each request
  requestLogger(req, res);
  router(req, res);
});

server.listen(config.port, config.host, () => {
  logger.info(`Server running at http://${config.host}:${config.port}/`);
});

// --- Graceful Shutdown Implementation ---
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. shutting down gracefully`);
  server.close((err) => {
    if (err) {
      logger.error(`${err.message}`);
      process.exit(1);
    }
    logger.info('Server closed');
    process.exit(0);
  });

  // force shutdown by timeout
  setTimeout(() => {
    logger.error('Forcefully shutting down');
    process.exit(1);
  }, 5000);
};

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle global uncaught exceptions
process.on('uncaughtException', (err, origin) => {
  logger.error(`Uncaught at ${origin}, error: ${err.stack || err}`);
  gracefulShutdown('uncaughtException');
});

// Handle global unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`rejection at ${promise}, reason: ${reason.stack || reason}`);
  gracefulShutdown('unhandledRejection');
});
