import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');

function getFilePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

export async function get(key, defaultValue = undefined) {
  try {
    const filePath = getFilePath(key);
    const content = await fs.readFile(filePath, 'utf8');
    const entry = JSON.parse(content);
    if (Date.now() < entry.expiry) {
      return entry.value;
    }
  } catch {
    // file doesn't exist or is expired
  }
  return defaultValue;
}

export async function set(key, value, ttl) {
  const entry = {
    value,
    expiry: Date.now() + ttl,
  };
  const filePath = getFilePath(key);
  await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
}

export async function remember(key, ttl, fetchFunction) {
  const cachedValue = await get(key);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  try {
    const result = await fetchFunction();
    await set(key, result, ttl);
    return result;
  } catch (err) {
    const fallback = await get(key);
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

ensureCacheDir().catch((err) => {
  console.error('Failed to create cache directory:', err);
});
