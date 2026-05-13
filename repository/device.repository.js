import Device from '../db/models/device.model.js';

function createDeviceRepository() {
  return {
    async findAll(filter) {
      const query = filter
        ? { room: { $regex: new RegExp(`^${filter}$`, 'i') } }
        : {};
      const docs = await Device.find(query).lean();
      return docs.map((doc) => ({
        ...doc,
        id: doc._id,
      }));
    },

    async findAllPaginated(page = 1, limit = 10, filter = null) {
      const query = filter
        ? { room: { $regex: new RegExp(`^${filter}$`, 'i') } }
        : {};
      const [data, total] = await Promise.all([
        Device.find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Device.countDocuments(query),
      ]);
      return {
        data: data.map((doc) => ({ ...doc, id: doc._id })),
        total,
      };
    },

    async findById(id) {
      const doc = await Device.findById(id).lean();
      if (!doc) return undefined;
      return { ...doc, id: doc._id };
    },

    async create(data = {}) {
      const defaults = {
        device: '',
        status: 'offline',
        room: '',
        description: 'no description',
        enabled: false,
        image: null,
        power: 0,
      };
      const doc = await Device.create({ ...defaults, ...data });
      const obj = doc.toObject();
      return { ...obj, id: obj._id };
    },

    async update(id, data) {
      const doc = await Device.findByIdAndUpdate(id, data, {
        new: true,
        lean: true,
      });
      if (!doc) return undefined;
      return { ...doc, id: doc._id };
    },

    async remove(id) {
      const result = await Device.findByIdAndDelete(id);
      return result !== null;
    },

    async *streamAll() {
      const cursor = Device.find().lean().cursor();
      for await (const doc of cursor) {
        yield { ...doc, id: doc._id };
      }
    },
  };
}

export { createDeviceRepository };
