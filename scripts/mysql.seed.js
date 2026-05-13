import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import { devices } from '../db/schema.js';

const INITIAL_DATA = [
  { device: 'Smart Lamp', status: 'on', room: 'Kitchen' },
  { device: 'Thermostat', status: 'off', room: 'Bedroom' },
  { device: 'Smart Lock', status: 'on', room: 'Entrance' },
  { device: 'Motion Sensor', status: 'on', room: 'Living Room' },
  { device: 'Smart Speaker', status: 'off', room: 'Bathroom' },
];

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

async function seed() {
  const isForce = process.argv.includes('--force');

  const pool = await connect();
  const db = drizzle(pool, { mode: 'default' });

  if (isForce) {
    await db.delete(devices);
    console.log('Database cleared');
  }

  const count = await db.select({ count: devices.id }).from(devices);
  if (count.length > 0) {
    console.log('Database already has data. Run with --force to reseed.');
    await pool.end();
    return;
  }

  for (const item of INITIAL_DATA) {
    await db.insert(devices).values(item);
  }
  console.log(`Seeded ${INITIAL_DATA.length} devices`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
