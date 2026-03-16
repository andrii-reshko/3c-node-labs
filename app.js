import Fastify from 'fastify';
import config from './config/env.js';
import router from './http/routes/index.js';
import { logger } from './utils/logger.js';

const fastify = Fastify({
  logger: true,
});

fastify.register(router);

// Log server closure
fastify.addHook('onClose', (instance, done) => {
  logger.info('Server closed');
  done();
});

fastify.listen({ port: config.port, host: config.host }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  logger.info(`Server running at ${address}`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. shutting down gracefully`);
  fastify
    .close()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      logger.error(`${err.message}`);
      process.exit(1);
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
