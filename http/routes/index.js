import * as deviceController from '../controllers/device.controller.js';
import * as healthController from '../controllers/health.controller.js';
import healthSchema from '../../schemas/health.schema.js';
import {
  listDeviceSchema,
  createDeviceSchema,
  updateDeviceSchema,
  removeDeviceSchema,
} from '../../schemas/device.schema.js';

const router = async (fastify) => {
  fastify.get('/health', { schema: healthSchema }, healthController.check);
  fastify.get('/device', { schema: listDeviceSchema }, deviceController.list);
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
