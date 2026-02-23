// In memory storage for the Smart home devices.
// Example: data [{ "id": 1, "device": "Smart Lamp", "status": "on", "room": "Kitchen" }]

class Storage {
    constructor() {
        this.devices = [];
        this.nextId = 1;
    }

    fetch(filterFunc) {
        if (filterFunc && typeof filterFunc === "function") {
            return this.devices.filter(filterFunc);
        }
        return this.devices;
    }

    add(data) {
        const instance = {
            ...data,
            id: this.nextId++,
        };

        this._validate(instance);

        this.devices.push(instance);

        return instance;
    }

    update(id, data) {
        const index = this.devices.findIndex((d) => d.id === id);
        if (index === -1) return undefined;

        const prev = this.devices[index];

        const instance = {
            ...prev,
            ...data,
            id: prev.id, // Ensure ID is not changed
        }

        this._validate(prev);

        this.devices.splice(index, 1, instance);

        return instance;
    }

    remove(id) {
        const index = this.devices.findIndex((d) => d.id === id);
        if (index === -1) return false;

        this.devices.splice(index, 1);
        return true;
    }

    _validate(data) {
        if (!data || typeof data !== "object") {
            throw new Error("Data must be an object");
        }
        if (!data.id || typeof data.id !== "number") {
            throw new Error("ID is required and must be a number");
        }
        if (!data.device || typeof data.device !== "string") {
            throw new Error("Device name is required and must be a string");
        }
        if (!data.status || typeof data.status !== "string") {
            throw new Error("Status is required and must be a string");
        }
        if (!data.room || typeof data.room !== "string") {
            throw new Error("Room is required and must be a string");
        }
    }
}

// Export a singleton instance of Storage
const storage = new Storage();

module.exports = storage;