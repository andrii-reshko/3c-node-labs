import * as deviceService from '../../services/device.service.js';
import MESSAGES from '../../constants/messages.js';

const list = async (request, reply) => {
  const roomFilter = request.query.room;
  const results = await deviceService.getAll(roomFilter);

  reply.send({
    data: results,
    total: results.length,
  });
};

const create = async (request, reply) => {
  const data = request.body;

  try {
    const instance = await deviceService.create(data);
    reply.code(201).send({ data: instance });
  } catch (err) {
    reply.unprocessableEntity(err.message);
  }
};

const update = async (request, reply) => {
  const id = request.params.id;
  const updates = request.body;

  try {
    const updated = await deviceService.update(id, updates);
    if (updated) {
      reply.send({ data: updated });
    } else {
      reply.notFound(MESSAGES.DEVICE_NOT_FOUND);
    }
  } catch (err) {
    reply.unprocessableEntity(err.message);
  }
};

const remove = async (request, reply) => {
  const id = request.params.id;
  try {
    const removed = await deviceService.remove(id);
    if (removed === true) {
      reply.code(204).send();
    } else {
      reply.notFound(MESSAGES.DEVICE_NOT_FOUND);
    }
  } catch (err) {
    reply.badRequest(err.message);
  }
};

export { list, create, update, remove };
