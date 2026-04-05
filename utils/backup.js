import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'items');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 5;

export async function createBackup() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const files = await fs.readdir(DATA_DIR);
  const itemsFiles = files.filter(
    (f) => f.endsWith('.json') && !f.endsWith('.tmp.json'),
  );

  if (itemsFiles.length === 0) {
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, timestamp);
  await fs.mkdir(backupPath, { recursive: true });

  await Promise.all(
    itemsFiles.map(async (file) => {
      const src = path.join(DATA_DIR, file);
      const dest = path.join(backupPath, file);
      await fs.copyFile(src, dest);
    }),
  );

  await cleanupOldBackups();

  return { timestamp, count: itemsFiles.length };
}

async function cleanupOldBackups() {
  const folders = await fs.readdir(BACKUP_DIR);
  const sorted = folders.sort().reverse();

  const toDelete = sorted.slice(MAX_BACKUPS);
  await Promise.all(
    toDelete.map(async (folder) => {
      const folderPath = path.join(BACKUP_DIR, folder);
      await fs.rm(folderPath, { recursive: true, force: true });
    }),
  );

  if (toDelete.length > 0) {
    console.log(`Deleted ${toDelete.length} old backup(s)`);
  }
}
