import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import fastifyWebSocket from '@fastify/websocket';
import env from './plugins/env.js';
import mongo from './db/mongo.js';
import mysql from './db/mysql.js';
import drizzle from './db/drizzle.js';
import deviceService from './services/device.service.js';
import apiDocs from './plugins/apidocs.js';
import { v1, v2 } from './http/routes/index.js';
import { errorHandler } from './utils/errorHandler.js';
import handleConnection from './http/socket/device.socket.js';
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
await fastify.register(mongo);
await fastify.register(mysql);
await fastify.register(drizzle);
await fastify.register(deviceService);
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  allowList: [],
});
fastify.register(sensible);
fastify.register(helmet, { global: true });
fastify.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 },
});
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/',
});

fastify.register(cors, {
  origin: isDev ? '*' : fastify.config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  strictPreflight: false,
});

fastify.setErrorHandler(errorHandler);
await fastify.register(apiDocs);
await fastify.register(fastifyWebSocket);
await fastify.register(v1, { prefix: '/api/v1' });
await fastify.register(v2, { prefix: '/api/v2' });

fastify.get('/ws', { websocket: true }, handleConnection);

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

  setTimeout(() => {
    fastify.log.error('Forcefully shutting down');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err, origin) => {
  fastify.log.error(`Uncaught at ${origin}, error: ${err.stack || err}`);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error(
    `rejection at ${promise}, reason: ${reason.stack || reason}`,
  );
  gracefulShutdown('unhandledRejection');
});
