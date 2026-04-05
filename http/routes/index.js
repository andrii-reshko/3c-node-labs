import * as deviceController from '../controllers/device.controller.js';
import * as healthController from '../controllers/health.controller.js';
import {
  healthSchema,
  healthDetailsSchema,
} from '../../schemas/health.schema.js';
import {
  listDeviceSchema,
  createDeviceSchema,
  updateDeviceSchema,
  removeDeviceSchema,
} from '../../schemas/device.schema.js';

const router = async (fastify) => {
  fastify.get('/health', { schema: healthSchema }, healthController.check);
  fastify.get(
    '/health/details',
    {
      schema: healthDetailsSchema,
      onRequest: async (request, reply) => {
        const apiKey = request.headers['x-api-key'];
        if (apiKey !== fastify.config.ADMIN_API_KEY) {
          reply.unauthorized('Invalid API Key');
        }
      },
    },
    healthController.details,
  );
  fastify.get('/device', { schema: listDeviceSchema }, deviceController.list);
  fastify.get('/device/export', deviceController.exportItems);
  fastify.post('/device/import', deviceController.importItems);
  fastify.post(
    '/device',
    { schema: createDeviceSchema },
    deviceController.create,
  );
  fastify.patch(
    '/device/:id',
    { schema: updateDeviceSchema },
    deviceController.update,
  );
  fastify.delete(
    '/device/:id',
    { schema: removeDeviceSchema },
    deviceController.remove,
  );
};

export default router;
