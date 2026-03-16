import * as deviceController from '../controllers/device.controller.js';
import * as healthController from '../controllers/health.controller.js';

const router = async (fastify) => {
  fastify.get('/health', healthController.check);
  fastify.get('/device', deviceController.list);
  fastify.post('/device', deviceController.create);
  fastify.patch('/device/:id', deviceController.update);
  fastify.delete('/device/:id', deviceController.remove);
};

export default router;
