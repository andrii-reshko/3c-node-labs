import fs from 'fs/promises';
import path from 'path';
import { constants } from 'fs';
import Device from '../domain/device.entity.js';
import { atomicWrite, readJsonFile, DATA_DIR } from '../utils/filesystem.js';

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

class DeviceRepository {
  async findAll(filter) {
    await ensureDir();
    const files = await fs.readdir(DATA_DIR);

    const items = await Promise.all(
      files
        .filter((f) => f.endsWith('.json') && !f.endsWith('.tmp.json'))
        .map(async (file) => {
          try {
            const filePath = path.join(DATA_DIR, file);
            const data = await readJsonFile(filePath);
            return new Device(data);
          } catch (err) {
            if (err instanceof SyntaxError) {
              return null;
            }
            throw err;
          }
        }),
    );

    const result = items.filter(Boolean);
    if (filter) {
      return result.filter(
        (e) => e.room.toLowerCase() === filter.toLowerCase(),
      );
    }
    return result;
  }

  async findAllPaginated(page = 1, limit = 10, filter = null) {
    const allItems = await this.findAll(filter);
    const total = allItems.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = allItems.slice(start, end);
    return { data, total };
  }

  async findById(id) {
    await ensureDir();
    const filePath = path.join(DATA_DIR, `${id}.json`);

    try {
      await fs.access(filePath, constants.R_OK);
      const data = await readJsonFile(filePath);
      return new Device(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return undefined;
      }
      throw err;
    }
  }

  async create(data = {}) {
    await ensureDir();

    const merged = { ...Device.DEFAULTS, ...data };

    const files = await fs.readdir(DATA_DIR);
    const existingIds = files
      .filter((f) => f.endsWith('.json') && !f.endsWith('.tmp.json'))
      .map((f) => parseInt(f.replace('.json', ''), 10))
      .filter((n) => !isNaN(n));

    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    const instance = {
      id: newId,
      device: merged.device,
      status: merged.status,
      room: merged.room,
      description: merged.description,
      image: merged.image,
    };

    await atomicWrite(DATA_DIR, newId, instance);

    return new Device(instance);
  }

  async update(id, data) {
    await ensureDir();
    const filePath = path.join(DATA_DIR, `${id}.json`);

    let existing;
    try {
      existing = await readJsonFile(filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return undefined;
      }
      if (err instanceof SyntaxError) {
        return undefined;
      }
      throw err;
    }

    const merged = {
      ...Device.DEFAULTS,
      ...existing,
      ...data,
      id: id,
    };

    await atomicWrite(DATA_DIR, id, merged);

    return new Device(merged);
  }

  async remove(id) {
    await ensureDir();
    const filePath = path.join(DATA_DIR, `${id}.json`);

    try {
      await fs.unlink(filePath);
      return true;
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    }
  }
}

const deviceRepository = new DeviceRepository();

async function* streamAll() {
  await ensureDir();
  const files = await fs.readdir(DATA_DIR);
  const jsonFiles = files.filter(
    (f) => f.endsWith('.json') && !f.endsWith('.tmp.json'),
  );

  for (const file of jsonFiles) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const data = await readJsonFile(filePath);
      yield new Device(data);
    } catch (err) {
      if (err instanceof SyntaxError) {
        continue;
      }
      throw err;
    }
  }
}

export default deviceRepository;
export { streamAll };
