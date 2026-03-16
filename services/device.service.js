import storage from '../repository/device.repository.js';
import Device from '../domain/device.entity.js';

const getAll = (filter) => {
  if (filter) {
    return storage.fetch((e) => e.room.toLowerCase() === filter.toLowerCase());
  }
  return storage.fetch();
};

const create = (data) => {
  const deviceEntity = new Device(data);
  return storage.add(deviceEntity);
};

const update = (id, data) => {
  const all = storage.fetch();
  const existing = all.find((d) => d.id === id);

  if (!existing) return undefined;

  const updatedData = {
    ...existing,
    ...data,
    id: existing.id, // Immutable ID
  };

  const deviceEntity = new Device(updatedData);

  return storage.update(id, deviceEntity);
};

const remove = (id) => {
  return storage.remove(id);
};

export { getAll, create, update, remove };
