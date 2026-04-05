import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import env from './plugins/env.js';
import router from './http/routes/index.js';
import { errorHandler } from './utils/errorHandler.js';
import { createBackup } from './utils/backup.js';
import { getModelHash } from './migrations/migrate.js';
import { readJsonFile } from './utils/filesystem.js';
import path from 'path';

// eslint-disable-next-line no-process-env
const isDev = process.env.NODE_ENV === 'development';

const fastify = Fastify({
  logger: isDev
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
        },
      }
    : {
        level: 'error',
      },
});

await fastify.register(env);
fastify.register(sensible);
fastify.register(helmet, { global: true });

// To test CORS in production, set NODE_ENV=production and CORS_ORIGIN=http://example.com in .env
// Then run: curl -v -H "Origin: http://example.com" -X OPTIONS http://localhost:3001/health
fastify.register(cors, {
  origin: isDev ? '*' : fastify.config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  strictPreflight: false,
});

fastify.setErrorHandler(errorHandler);
fastify.register(router);

const backup = await createBackup();
if (backup) {
  console.log(`Backup created: ${backup.timestamp}`);
}

const currentHash = getModelHash();
const versionFile = path.join(process.cwd(), 'data', 'version.json');
try {
  const { hash } = await readJsonFile(versionFile);
  if (hash !== currentHash) {
    fastify.log.warn('Schema changed. Run "npm run migrate" to update.');
  }
} catch (err) {
  if (err.code !== 'ENOENT') {
    fastify.log.warn('Could not read version file');
  }
}

// Log server closure
fastify.addHook('onClose', (instance, done) => {
  instance.log.info('Server closed');
  done();
});

fastify.listen(
  {
    port: fastify.config.PORT,
    host: fastify.config.HOSTNAME,
  },
  (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  },
);

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  fastify.log.info(`${signal} received. shutting down gracefully`);
  fastify
    .close()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      fastify.log.error(`${err.message}`);
      process.exit(1);
    });

  // force shutdown by timeout
  setTimeout(() => {
    fastify.log.error('Forcefully shutting down');
    process.exit(1);
  }, 5000);
};

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle global uncaught exceptions
process.on('uncaughtException', (err, origin) => {
  fastify.log.error(`Uncaught at ${origin}, error: ${err.stack || err}`);
  gracefulShutdown('uncaughtException');
});

// Handle global unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error(
    `rejection at ${promise}, reason: ${reason.stack || reason}`,
  );
  gracefulShutdown('unhandledRejection');
});
