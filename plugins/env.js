import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';

const schema = {
  type: 'object',
  required: ['PORT', 'HOSTNAME', 'NODE_ENV'],
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
