import Ajv from 'ajv';
import * as deviceService from '../../services/device.service.js';
import { readBody } from '../../utils/http-utils.js';

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

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      data: results,
      total: results.length,
    }),
  );
};

const create = (req, res) => {
  readBody(req)
    .then((data) => {
      if (!validateDevice(data)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: validateDevice.errors }));
        return;
      }

      try {
        const instance = deviceService.create(data);

        res.statusCode = 201;
        res.end(JSON.stringify({ data: instance }));
      } catch (err) {
        res.statusCode = 422;
        res.end(JSON.stringify({ error: err.message }));
      }
    })
    .catch((err) => {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: err.message }));
    });
};

const update = (req, res, url) => {
  const id = parseInt(url.pathname.split('/')[2]);

  readBody(req)
    .then((updates) => {
      if (!validateDeviceUpdate(updates)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: validateDeviceUpdate.errors }));
        return;
      }

      try {
        const updated = deviceService.update(id, updates);
        if (updated) {
          res.statusCode = 200;
          res.end(JSON.stringify({ data: updated }));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not Found' }));
        }
      } catch (err) {
        res.statusCode = 422;
        res.end(JSON.stringify({ error: err.message }));
      }
    })
    .catch((err) => {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: err.message }));
    });
};

const remove = (req, res, url) => {
  const id = parseInt(url.pathname.split('/')[2]);
  try {
    const removed = deviceService.remove(id);
    if (removed === true) {
      res.statusCode = 204;
      res.end();
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } catch (err) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: err.message }));
  }
};

export { list, create, update, remove };
