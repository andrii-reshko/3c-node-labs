import storage from '../repository/device.repository.js';
import Device from '../domain/device.entity.js';

const getAll = async (filter) => {
  const items = await storage.findAll(filter);
  return items;
};

const getAllPaginated = async (page, limit, filter) => {
  return await storage.findAllPaginated(page, limit, filter);
};

const findById = async (id) => {
  return await storage.findById(id);
};

const create = async (data) => {
  const deviceEntity = new Device(data);
  return await storage.create(deviceEntity);
};

const update = async (id, data) => {
  const existing = await storage.findById(id);
  if (!existing) return undefined;
  const updatedData = {
    ...existing,
    ...data,
    id: existing.id,
  };

  const deviceEntity = new Device(updatedData);

  return await storage.update(id, deviceEntity);
};

const remove = async (id) => {
  return await storage.remove(id);
};

export { getAll, getAllPaginated, findById, create, update, remove };
