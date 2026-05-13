import mongoose from 'mongoose';
import 'dotenv/config';
import Device from '../db/models/device.model.js';

const INITIAL_DATA = [
  { device: 'Smart Lamp', status: 'on', room: 'Kitchen' },
  { device: 'Thermostat', status: 'off', room: 'Bedroom' },
  { device: 'Smart Lock', status: 'on', room: 'Entrance' },
  { device: 'Motion Sensor', status: 'on', room: 'Living Room' },
  { device: 'Smart Speaker', status: 'off', room: 'Bathroom' },
];

async function connect() {
  // eslint-disable-next-line no-process-env
  const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`;
  await mongoose.connect(uri);
}

async function seed() {
  const isForce = process.argv.includes('--force');

  await connect();

  if (isForce) {
    await Device.deleteMany({});
    console.log('Database cleared');
  }

  const count = await Device.countDocuments();
  if (count > 0) {
    console.log('Database already has data. Run with --force to reseed.');
    await mongoose.disconnect();
    return;
  }

  for (const item of INITIAL_DATA) {
    await Device.create(item);
  }
  console.log(`Seeded ${INITIAL_DATA.length} devices`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
