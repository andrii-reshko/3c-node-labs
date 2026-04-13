import * as deviceController from '../controllers/device.controller.js';
import * as healthController from '../controllers/health.controller.js';
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
import { tagsV1 } from '../../plugins/apidocs.js';

async function routes(fastify) {
  fastify.register(
    async (instance) => {
      instance.get(
        '/',
        { schema: { ...healthSchema, tags: ['Health'] } },
        healthController.check,
      );
      instance.get(
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
    async (instance) => {
      instance.get(
        '/',
        { schema: { ...listDeviceSchemaV1, ...tagsV1 } },
        deviceController.list,
      );
      instance.get(
        '/export',
        { schema: { ...tagsV1 } },
        deviceController.exportItems,
      );
      instance.post(
        '/import',
        { schema: { ...tagsV1 } },
        deviceController.importItems,
      );
      instance.post(
        '/',
        { schema: { ...createDeviceSchema, ...tagsV1 } },
        deviceController.create,
      );
      instance.patch(
        '/:id',
        { schema: { ...updateDeviceSchema, ...tagsV1 } },
        deviceController.update,
      );
      instance.delete(
        '/:id',
        { schema: { ...removeDeviceSchema, ...tagsV1 } },
        deviceController.remove,
      );
      instance.post(
        '/:id/image',
        { config: { validate: false }, schema: { ...tagsV1 } },
        deviceController.uploadImage,
      );
    },
    { prefix: '/device' },
  );
}

export default routes;
