import storage from '../repository/device.repository.js';
import Device from '../domain/device.entity.js';

const getAll = async (filter) => {
  const items = await storage.findAll();
  if (filter) {
    return items.filter((e) => e.room.toLowerCase() === filter.toLowerCase());
  }
  return items;
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

export { getAll, findById, create, update, remove };
