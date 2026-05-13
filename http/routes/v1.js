import * as deviceController from '../controllers/device.controller.js';
import * as healthController from '../controllers/health.controller.js';
import * as githubController from '../controllers/github.controller.js';
import {
  healthDetailsSchema,
  healthSchema,
} from '../../schemas/health.schema.js';
import {
  createDeviceSchema,
  listDeviceSchemaV1,
  removeDeviceSchema,
  updateDeviceSchema,
} from '../../schemas/device.schema.js';
import { requiresApiKey } from '../hooks/api-key.js';
import { tagsGh, tagsV1 } from '../../plugins/apidocs.js';
import { githubRequestSchema } from '../../schemas/github.schema.js';

async function routes(fastify) {
  fastify.register(
    async (route) => {
      route.get(
        '/',
        { schema: { ...healthSchema, tags: ['Health'] } },
        healthController.check,
      );
      route.get(
        '/details',
        {
          schema: {
            ...healthDetailsSchema,
            tags: ['Health'],
            security: [{ apiKey: [] }],
          },
          onRequest: requiresApiKey,
        },
        healthController.details,
      );
    },
    { prefix: '/health' },
  );

  fastify.register(
    async (route) => {
      route.get(
        '/',
        { schema: { ...listDeviceSchemaV1, ...tagsV1 } },
        deviceController.list,
      );
      route.get(
        '/export',
        { schema: { ...tagsV1 } },
        deviceController.exportItems,
      );
      route.post(
        '/import',
        { schema: { ...tagsV1 } },
        deviceController.importItems,
      );
      route.post(
        '/',
        { schema: { ...createDeviceSchema, ...tagsV1 } },
        deviceController.create,
      );
      route.patch(
        '/:id',
        { schema: { ...updateDeviceSchema, ...tagsV1 } },
        deviceController.update,
      );
      route.delete(
        '/:id',
        { schema: { ...removeDeviceSchema, ...tagsV1 } },
        deviceController.remove,
      );
      route.post(
        '/:id/image',
        { config: { validate: false }, schema: { ...tagsV1 } },
        deviceController.uploadImage,
      );
      route.get(
        '/:id/details',
        { schema: { ...tagsV1 } },
        deviceController.getDeviceDetails,
      );
    },
    { prefix: '/device' },
  );

  fastify.register(
    async (route) => {
      route.get(
        '/shared-repos',
        { schema: { ...githubRequestSchema, ...tagsGh } },
        githubController.sharedReposV1,
      );
    },
    { prefix: '/github' },
  );
}

export default routes;
