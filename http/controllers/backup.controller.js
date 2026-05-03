import fs from 'fs';
import path from 'path';

export const getBackup = async (request, reply) => {
  const timestamp = path.basename(request.params.timestamp);
  const backupFile = timestamp.endsWith('.gz') ? timestamp : `${timestamp}.gz`;
  const backupPath = path.join(process.cwd(), 'data', 'backups', backupFile);

  try {
    await fs.promises.access(backupPath);
  } catch {
    return reply.notFound('Backup not found');
  }

  reply.header('Content-Type', 'application/gzip');
  reply.header('Content-Disposition', `attachment; filename="${backupFile}"`);

  return reply.send(fs.createReadStream(backupPath));
};
