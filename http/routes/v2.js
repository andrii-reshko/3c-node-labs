import * as deviceController from '../controllers/device.controller.js';
import {
  createDeviceSchema,
  listDeviceSchema,
  removeDeviceSchema,
  updateDeviceSchema,
} from '../../schemas/device.schema.js';

const router = async (fastify) => {
  fastify.register(
    async (route) => {
      route.get(
        '/',
        { schema: listDeviceSchema },
        deviceController.listPaginated,
      );
      route.get('/export', deviceController.exportItems);
      route.post('/import', deviceController.importItems);
      route.post('/', { schema: createDeviceSchema }, deviceController.create);
      route.patch(
        '/:id',
        { schema: updateDeviceSchema },
        deviceController.update,
      );
      route.delete(
        '/:id',
        { schema: removeDeviceSchema },
        deviceController.remove,
      );
      route.post(
        '/:id/image',
        { config: { validate: false } },
        deviceController.uploadImage,
      );
    },
    { prefix: '/device' },
  );
};

export default router;
