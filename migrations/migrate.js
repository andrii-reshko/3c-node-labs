import crypto from 'crypto';

function computeModelHash() {
  const modelString = JSON.stringify(
    {
      device: '',
      status: 'offline',
      room: '',
      description: 'no description',
      enabled: false,
      image: null,
      power: 0,
    },
    Object.keys({
      device: '',
      status: 'offline',
      room: '',
      description: 'no description',
      enabled: false,
      image: null,
      power: 0,
    }).sort(),
  );
  return crypto.createHash('md5').update(modelString).digest('hex');
}

export async function migrate() {
  const currentHash = computeModelHash();
  console.log('MongoDB migration check - Hash:', currentHash);
  return true;
}

export function getModelHash() {
  return computeModelHash();
}

migrate();
