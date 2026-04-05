import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'items');

export async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, { encoding: 'utf8' });
  return JSON.parse(content);
}

export async function atomicWrite(dir, id, data) {
  const targetDir = dir || DATA_DIR;
  const tempPath = path.join(targetDir, `${id}.tmp.json`);
  const finalPath = path.join(targetDir, `${id}.json`);

  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), {
    encoding: 'utf8',
    flag: 'w',
  });

  await fs.rename(tempPath, finalPath);
}

export { DATA_DIR };
