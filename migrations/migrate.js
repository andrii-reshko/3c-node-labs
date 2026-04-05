import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import Device from '../domain/device.entity.js';
import deviceRepository from '../repository/device.repository.js';
import { readJsonFile } from '../utils/filesystem.js';

const VERSION_FILE = path.join(process.cwd(), 'data', 'version.json');

function computeModelHash() {
  const modelString = JSON.stringify(
    Device.DEFAULTS,
    Object.keys(Device.DEFAULTS).sort(),
  );
  return crypto.createHash('md5').update(modelString).digest('hex');
}

export async function migrate() {
  const currentHash = computeModelHash();

  let storedHash = null;
  try {
    const versionData = await readJsonFile(VERSION_FILE);
    storedHash = versionData.hash;
  } catch (err) {
    if (err.code !== 'ENOENT' && !(err instanceof SyntaxError)) {
      throw err;
    }
  }

  if (storedHash === currentHash) {
    console.log('No migration needed');
    return false;
  }

  const items = await deviceRepository.findAll();

  for (const item of items) {
    const migrated = {
      ...Device.DEFAULTS,
      ...item,
    };
    await deviceRepository.update(item.id, migrated);
    console.log(`Migrated: ${item.id}.json`);
  }

  await fs.writeFile(
    VERSION_FILE,
    JSON.stringify({ hash: currentHash }, null, 2),
    { encoding: 'utf8' },
  );

  console.log(`Migration completed. Hash: ${currentHash}`);
  return true;
}

export function getModelHash() {
  return computeModelHash();
}

migrate();
