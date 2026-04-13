import * as deviceController from '../controllers/device.controller.js';
import {
  createDeviceSchema,
  listDeviceSchema,
  removeDeviceSchema,
  updateDeviceSchema,
} from '../../schemas/device.schema.js';
import { tagsV2 } from '../../plugins/apidocs.js';

const router = async (fastify) => {
  fastify.register(
    async (route) => {
      route.get(
        '/',
        { schema: { ...listDeviceSchema, ...tagsV2 } },
        deviceController.listPaginated,
      );
      route.get(
        '/export',
        { schema: { ...tagsV2 } },
        deviceController.exportItems,
      );
      route.post(
        '/import',
        { schema: { ...tagsV2 } },
        deviceController.importItems,
      );
      route.post(
        '/',
        { schema: { ...createDeviceSchema, ...tagsV2 } },
        deviceController.create,
      );
      route.patch(
        '/:id',
        { schema: { ...updateDeviceSchema, ...tagsV2 } },
        deviceController.update,
      );
      route.delete(
        '/:id',
        { schema: { ...removeDeviceSchema, ...tagsV2 } },
        deviceController.remove,
      );
      route.post(
        '/:id/image',
        { config: { validate: false }, schema: { ...tagsV2 } },
        deviceController.uploadImage,
      );
    },
    { prefix: '/device' },
  );
};

export default router;
