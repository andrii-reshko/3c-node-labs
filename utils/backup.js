import fs from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { Readable } from 'stream';

const DATA_DIR = path.join(process.cwd(), 'data', 'items');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 5;

export async function createBackup() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const files = await fs.readdir(DATA_DIR);
  const itemsFiles = files
    .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));

  if (itemsFiles.length === 0) {
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${timestamp}.gz`);

  const readable = Readable.from(
    (async function* () {
      for (const file of itemsFiles) {
        const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
        yield content + '\n';
      }
    })(),
  );

  await pipeline(readable, createGzip(), createWriteStream(backupPath));

  await cleanupOldBackups();

  return { timestamp, count: itemsFiles.length };
}

async function cleanupOldBackups() {
  const files = await fs.readdir(BACKUP_DIR);
  const gzFiles = files
    .filter((f) => f.endsWith('.gz'))
    .sort()
    .reverse();

  const toDelete = gzFiles.slice(MAX_BACKUPS);
  await Promise.all(
    toDelete.map(async (file) => {
      const filePath = path.join(BACKUP_DIR, file);
      await fs.unlink(filePath);
    }),
  );

  if (toDelete.length > 0) {
    console.log(`Deleted ${toDelete.length} old backup(s)`);
  }
}
