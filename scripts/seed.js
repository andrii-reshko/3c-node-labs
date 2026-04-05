import deviceRepository from '../repository/device.repository.js';

const INITIAL_DATA = [
  { device: 'Smart Lamp', status: 'on', room: 'Kitchen' },
  { device: 'Thermostat', status: 'off', room: 'Bedroom' },
  { device: 'Smart Lock', status: 'on', room: 'Entrance' },
  { device: 'Motion Sensor', status: 'on', room: 'Living Room' },
  { device: 'Smart Speaker', status: 'off', room: 'Bathroom' },
];

async function seed() {
  for (const item of INITIAL_DATA) {
    await deviceRepository.create(item);
  }
  console.log(`Seeded ${INITIAL_DATA.length} devices`);
}

seed().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
