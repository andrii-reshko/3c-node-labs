import Ajv from 'ajv';
import * as deviceService from '../../services/device.service.js';
import { readBody, responseJson } from '../../utils/http-utils.js';

const ajv = new Ajv();

const deviceSchema = {
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
  },
  required: ['device', 'status', 'room'],
  additionalProperties: false,
};

const validateDevice = ajv.compile(deviceSchema);

const deviceUpdateSchema = {
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
  },
  additionalProperties: false,
  minProperties: 1,
};

const validateDeviceUpdate = ajv.compile(deviceUpdateSchema);

const list = (req, res, url) => {
  const roomFilter = url.searchParams.get('room');
  const results = deviceService.getAll(roomFilter);

  responseJson(res, 200, {
    data: results,
    total: results.length,
  });
};

const create = (req, res) => {
  readBody(req)
    .then((data) => {
      if (!validateDevice(data)) {
        responseJson(res, 400, { error: validateDevice.errors });
        return;
      }

      try {
        const instance = deviceService.create(data);
        responseJson(res, 201, { data: instance });
      } catch (err) {
        responseJson(res, 422, { error: err.message });
      }
    })
    .catch((err) => {
      responseJson(res, 400, { error: err.message });
    });
};

const update = (req, res, url) => {
  const id = parseInt(url.pathname.split('/')[2]);

  readBody(req)
    .then((updates) => {
      if (!validateDeviceUpdate(updates)) {
        responseJson(res, 400, { error: validateDeviceUpdate.errors });
        return;
      }

      try {
        const updated = deviceService.update(id, updates);
        if (updated) {
          responseJson(res, 200, { data: updated });
        } else {
          responseJson(res, 404, { error: 'Not Found' });
        }
      } catch (err) {
        responseJson(res, 422, { error: err.message });
      }
    })
    .catch((err) => {
      responseJson(res, 400, { error: err.message });
    });
};

const remove = (req, res, url) => {
  const id = parseInt(url.pathname.split('/')[2]);
  try {
    const removed = deviceService.remove(id);
    if (removed === true) {
      responseJson(res, 204);
    } else {
      responseJson(res, 404, { error: 'Not Found' });
    }
  } catch (err) {
    responseJson(res, 400, { error: err.message });
  }
};

export { list, create, update, remove };
