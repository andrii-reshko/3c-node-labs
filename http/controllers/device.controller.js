import * as deviceService from '../../services/device.service.js';

const list = (request, reply) => {
  const roomFilter = request.query.room;
  const results = deviceService.getAll(roomFilter);

  reply.send({
    data: results,
    total: results.length,
  });
};

const create = (request, reply) => {
  const data = request.body;

  try {
    const instance = deviceService.create(data);
    reply.code(201).send({ data: instance });
  } catch (err) {
    reply.code(422).send({ error: err.message });
  }
};

const update = (request, reply) => {
  const id = request.params.id; // Fastify coerces this to number based on schema
  const updates = request.body;

  try {
    const updated = deviceService.update(id, updates);
    if (updated) {
      reply.send({ data: updated });
    } else {
      reply.code(404).send({ error: 'Not Found' });
    }
  } catch (err) {
    reply.code(422).send({ error: err.message });
  }
};

const remove = (request, reply) => {
  const id = request.params.id;
  try {
    const removed = deviceService.remove(id);
    if (removed === true) {
      reply.code(204).send();
    } else {
      reply.code(404).send({ error: 'Not Found' });
    }
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

export { list, create, update, remove };
