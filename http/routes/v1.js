import * as deviceController from '../controllers/device.controller.js';
import * as healthController from '../controllers/health.controller.js';
import {
  healthDetailsSchema,
  healthSchema,
} from '../../schemas/health.schema.js';
import {
  createDeviceSchema,
  listDeviceSchema,
  removeDeviceSchema,
  updateDeviceSchema,
} from '../../schemas/device.schema.js';
import { requiresApiKey } from '../hooks/api-key.js';

const router = async (fastify) => {
  fastify.register(
    async (instance) => {
      instance.get('/', { schema: healthSchema }, healthController.check);
      instance.get(
        '/details',
        { schema: healthDetailsSchema, onRequest: requiresApiKey },
        healthController.details,
      );
    },
    { prefix: '/health' },
  );

  fastify.register(
    async (instance) => {
      instance.get('/', { schema: listDeviceSchema }, deviceController.list);
      instance.get('/export', deviceController.exportItems);
      instance.post('/import', deviceController.importItems);
      instance.post(
        '/',
        { schema: createDeviceSchema },
        deviceController.create,
      );
      instance.patch(
        '/:id',
        { schema: updateDeviceSchema },
        deviceController.update,
      );
      instance.delete(
        '/:id',
        { schema: removeDeviceSchema },
        deviceController.remove,
      );
      instance.post(
        '/:id/image',
        { config: { validate: false } },
        deviceController.uploadImage,
      );
    },
    { prefix: '/device' },
  );
};

export default router;
