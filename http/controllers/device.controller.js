import Ajv from 'ajv';
import * as deviceService from '../../services/device.service.js';

const ajv = new Ajv();

const deviceSchema = {
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
  },
  required: ['device', 'status', 'room'],
  additionalProperties: false,
};

const validateDevice = ajv.compile(deviceSchema);

const deviceUpdateSchema = {
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
  },
  additionalProperties: false,
  minProperties: 1,
};

const validateDeviceUpdate = ajv.compile(deviceUpdateSchema);

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

  if (!validateDevice(data)) {
    reply.code(400).send({ error: validateDevice.errors });
    return;
  }

  try {
    const instance = deviceService.create(data);
    reply.code(201).send({ data: instance });
  } catch (err) {
    reply.code(422).send({ error: err.message });
  }
};

const update = (request, reply) => {
  const id = parseInt(request.params.id);
  const updates = request.body;

  if (!validateDeviceUpdate(updates)) {
    reply.code(400).send({ error: validateDeviceUpdate.errors });
    return;
  }

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
  const id = parseInt(request.params.id);
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
