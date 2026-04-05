class Device {
  static DEFAULTS = {
    id: null,
    device: '',
    status: 'offline',
    room: ''
  };

  constructor(data = {}) {
    const merged = { ...Device.DEFAULTS, ...data };
    
    if (!merged.device || typeof merged.device !== 'string') {
      throw new Error('Device name is required and must be a string');
    }
    if (!merged.status || typeof merged.status !== 'string') {
      throw new Error('Status is required and must be a string');
    }
    if (!merged.room || typeof merged.room !== 'string') {
      throw new Error('Room is required and must be a string');
    }

    this.id = merged.id;
    this.device = merged.device;
    this.status = merged.status;
    this.room = merged.room;
  }
}

export default Device;
