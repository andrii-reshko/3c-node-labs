const Device = require('../domain/device.entity');

// In memory storage for the Smart home devices.
// Example: data [{ "id": 1, "device": "Smart Lamp", "status": "on", "room": "Kitchen" }]

class Storage {
  constructor() {
    this.devices = [];
    this.nextId = 1;
  }

  fetch(filterFunc) {
    const results =
      filterFunc && typeof filterFunc === 'function'
        ? this.devices.filter(filterFunc)
        : this.devices;

    return results.map((d) => new Device(d));
  }

  add(deviceEntity) {
    // Assign ID
    const instance = {
      id: this.nextId++,
      device: deviceEntity.device,
      status: deviceEntity.status,
      room: deviceEntity.room,
    };

    this.devices.push(instance);

    return new Device(instance);
  }

  update(id, deviceEntity) {
    const index = this.devices.findIndex((d) => d.id === id);
    if (index === -1) return undefined;

    const prev = this.devices[index];

    const instance = {
      ...prev,
      device: deviceEntity.device,
      status: deviceEntity.status,
      room: deviceEntity.room,
      id: prev.id, // Ensure ID is not changed
    };

    this.devices.splice(index, 1, instance);

    return new Device(instance);
  }

  remove(id) {
    const index = this.devices.findIndex((d) => d.id === id);
    if (index === -1) return false;

    this.devices.splice(index, 1);
    return true;
  }
}

// Export a singleton instance of Storage
const storage = new Storage();

module.exports = storage;
