import fs from 'fs/promises';
import path from 'path';
import { constants } from 'fs';
import Device from '../domain/device.entity.js';

const DATA_DIR = path.join(process.cwd(), 'data', 'items');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function atomicWrite(id, data) {
  const tempPath = path.join(DATA_DIR, `${id}.tmp.json`);
  const finalPath = path.join(DATA_DIR, `${id}.json`);

  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), {
    encoding: 'utf8',
    flag: 'w',
  });

  await fs.rename(tempPath, finalPath);
}

async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, { encoding: 'utf8' });
  return JSON.parse(content);
}

class DeviceRepository {
  async findAll() {
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

    return items.filter(Boolean);
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
    };

    await atomicWrite(newId, instance);

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

    await atomicWrite(id, merged);

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

export default deviceRepository;
