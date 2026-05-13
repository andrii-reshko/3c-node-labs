import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';

const schema = {
  type: 'object',
  required: [
    'PORT',
    'HOSTNAME',
    'NODE_ENV',
    'ADMIN_API_KEY',
    'GITHUB_TOKEN',
    'MONGO_HOST',
    'MONGO_PORT',
    'MONGO_DB',
    'MONGO_USER',
    'MONGO_PASSWORD',
  ],
  properties: {
    PORT: {
      type: 'integer',
      minimum: 1,
      maximum: 65535,
    },
    HOSTNAME: {
      type: 'string',
      minLength: 1,
    },
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'production'],
    },
    ADMIN_API_KEY: {
      type: 'string',
      minLength: 1,
    },
    CORS_ORIGIN: {
      type: 'string',
      default: '*',
    },
    GITHUB_TOKEN: {
      type: 'string',
      default: '',
    },
    MONGO_HOST: {
      type: 'string',
      minLength: 1,
    },
    MONGO_PORT: {
      type: 'integer',
      minimum: 1,
      maximum: 65535,
    },
    MONGO_DB: {
      type: 'string',
      minLength: 1,
    },
    MONGO_USER: {
      type: 'string',
      minLength: 1,
    },
    MONGO_PASSWORD: {
      type: 'string',
      minLength: 1,
    },
  },
};

const options = {
  confKey: 'config',
  schema: schema,
  dotenv: false,
};

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, options);
});
