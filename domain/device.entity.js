class Device {
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be an object');
    }
    // ID is optional because it might not be assigned yet (pre-persistence)
    if (data.id && typeof data.id !== 'number') {
      throw new Error('ID must be a number');
    }
    if (!data.device || typeof data.device !== 'string') {
      throw new Error('Device name is required and must be a string');
    }
    if (!data.status || typeof data.status !== 'string') {
      throw new Error('Status is required and must be a string');
    }
    if (!data.room || typeof data.room !== 'string') {
      throw new Error('Room is required and must be a string');
    }

    this.id = data.id || null;
    this.device = data.device;
    this.status = data.status;
    this.room = data.room;
  }
}

module.exports = Device;
