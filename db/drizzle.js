import fp from 'fastify-plugin';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema.js';

async function drizzlePlugin(fastify) {
  const db = drizzle(fastify.mysql, { schema, mode: 'default' });

  fastify.decorate('drizzle', db);

  fastify.log.info('Drizzle ORM initialized');
}

export default fp(drizzlePlugin, {
  name: 'drizzle',
  dependencies: ['mysql'],
});
