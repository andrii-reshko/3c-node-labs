import fp from 'fastify-plugin';
import { createDeviceRepository } from '../repository/device.repository.js';
import remote from '../repository/remote.repository.js';

async function deviceServicePlugin(fastify) {
  const storage = createDeviceRepository(fastify.mysql);

  const getAll = async (filter) => {
    return await storage.findAll(filter);
  };

  const getAllPaginated = async (page, limit, filter) => {
    return await storage.findAllPaginated(page, limit, filter);
  };

  const findById = async (id) => {
    return await storage.findById(id);
  };

  const create = async (data) => {
    return await storage.create(data);
  };

  const update = async (id, data) => {
    const existing = await storage.findById(id);
    if (!existing) return undefined;
    return await storage.update(id, data);
  };

  const remove = async (id) => {
    return await storage.remove(id);
  };

  const getDeviceWithReference = async (id) => {
    const device = await findById(id);
    if (!device) return undefined;

    let referenceData = null;
    try {
      referenceData = await remote.getReferenceData();
    } catch (err) {
      fastify.log.debug(err);
    }

    const typeInfo = referenceData?.find(
      (t) => String(t.id) === String(device.id),
    ) || {
      powerWatt: null,
    };

    return {
      ...device,
      power: typeInfo.powerWatt,
    };
  };

  const streamAll = async function* () {
    for await (const item of storage.streamAll()) {
      yield item;
    }
  };

  fastify.decorate('deviceService', {
    getAll,
    getAllPaginated,
    findById,
    create,
    update,
    remove,
    getDeviceWithReference,
    streamAll,
  });
}

export default fp(deviceServicePlugin, {
  dependencies: ['mysql'],
});
