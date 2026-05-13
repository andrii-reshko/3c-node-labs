import crypto from 'crypto';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

function computeModelHash() {
  const columns = [
    'id',
    'device',
    'status',
    'room',
    'description',
    'enabled',
    'image',
    'power',
  ];
  const modelString = JSON.stringify(columns.sort());
  return crypto.createHash('md5').update(modelString).digest('hex');
}

async function connect() {
  return mysql.createPool({
    // eslint-disable-next-line no-process-env
    host: process.env.MYSQL_HOST,
    // eslint-disable-next-line no-process-env
    port: parseInt(process.env.MYSQL_PORT, 10),
    // eslint-disable-next-line no-process-env
    user: process.env.MYSQL_USER,
    // eslint-disable-next-line no-process-env
    password: process.env.MYSQL_PASSWORD,
    // eslint-disable-next-line no-process-env
    database: process.env.MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
  });
}

async function initSchema(pool) {
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf8');
  const statements = schema.split(';').filter((s) => s.trim());
  for (const stmt of statements) {
    await pool.query(stmt);
  }
}

export async function migrate(pool) {
  await initSchema(pool);
  const currentHash = computeModelHash();

  const [rows] = await pool.query(
    'SELECT hash FROM migrations WHERE name = ?',
    ['devices'],
  );
  const storedHash = rows[0]?.hash;

  if (storedHash === currentHash) {
    console.log('No migration needed');
    return false;
  }

  await pool.query(
    'INSERT INTO migrations (name, hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE hash = ?',
    ['devices', currentHash, currentHash],
  );

  console.log(`Migration completed. Hash: ${currentHash}`);
  return true;
}

export function getModelHash() {
  return computeModelHash();
}

async function main() {
  const pool = await connect();
  await migrate(pool);
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
