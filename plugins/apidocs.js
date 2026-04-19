import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export default fp((fastify) => {
  let baseUrl = `http://${fastify.config.HOSTNAME}:${fastify.config.PORT}`;
  fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Device API',
        description: 'API for managing devices',
        version: '1.0.0',
      },
      servers: [
        {
          url: baseUrl,
          description: 'Some server',
        },
      ],
      tags: [{ name: 'Health' }, { name: 'API v1' }, { name: 'API v2' }],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'x-api-key',
            in: 'header',
          },
        },
      },
    },
  });
  fastify.register(swaggerUi, { routePrefix: '/docs' });
});

export const tagsV1 = { tags: ['API v1'] };
export const tagsV2 = { tags: ['API v2'] };
export const tagsGh = { tags: ['Github'] };
