import * as deviceService from '../../services/device.service.js';
import MESSAGES from '../../constants/messages.js';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import { importDeviceSchema } from '../../schemas/device.schema.js';
import { Ajv } from 'ajv';

const list = async (request, reply) => {
  const roomFilter = request.query.room;
  const results = await deviceService.getAll(roomFilter);

  reply.send({
    data: results,
    total: results.length,
  });
};

const exportItems = async (request, reply) => {
  const results = await deviceService.getAll();

  const rows = results.map((item) => ({
    id: item.id,
    device: item.device,
    status: item.status,
    room: item.room,
    description: item.description || '',
    enabled: item.enabled,
    image: item.image
      ? `http://localhost:${request.server.config.PORT}/images/${item.image}`
      : '',
  }));

  const csv = stringify(rows, { header: true });

  reply.header('Content-Type', 'text/csv');
  reply.header('Content-Disposition', 'attachment; filename="items.csv"');
  reply.header('Content-Length', Buffer.byteLength(csv));
  reply.send(csv);
};

const create = async (request, reply) => {
  const data = request.body;

  try {
    const instance = await deviceService.create(data);
    reply.code(201).send({ data: instance });
  } catch (err) {
    reply.unprocessableEntity(err.message);
  }
};

const update = async (request, reply) => {
  const id = request.params.id;
  const updates = request.body;

  try {
    const updated = await deviceService.update(id, updates);
    if (updated) {
      reply.send({ data: updated });
    } else {
      reply.notFound(MESSAGES.DEVICE_NOT_FOUND);
    }
  } catch (err) {
    reply.unprocessableEntity(err.message);
  }
};

const remove = async (request, reply) => {
  const id = request.params.id;
  try {
    const removed = await deviceService.remove(id);
    if (removed === true) {
      reply.code(204).send();
    } else {
      reply.notFound(MESSAGES.DEVICE_NOT_FOUND);
    }
  } catch (err) {
    reply.badRequest(err.message);
  }
};

const importItems = async (request, reply) => {
  const data = await request.file();
  if (!data) {
    return reply.badRequest('No file uploaded');
  }

  const buffer = await data.toBuffer();
  const content = buffer.toString('utf8');
  const filename = data.filename.toLowerCase();

  let records;

  if (filename.endsWith('.csv')) {
    records = parse(content, { columns: true, skip_empty_lines: true });
  } else if (filename.endsWith('.json')) {
    try {
      records = JSON.parse(content);
      if (!Array.isArray(records)) {
        records = [records];
      }
    } catch {
      return reply.badRequest('Invalid JSON file');
    }
  } else {
    return reply.badRequest('Unsupported file format. Use CSV or JSON');
  }

  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(importDeviceSchema);

  const imported = [];
  const rejected = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    if (record.enabled !== undefined) {
      record.enabled =
        record.enabled === true ||
        record.enabled === 'true' ||
        record.enabled === '1';
    }

    const valid = validate(record);
    if (!valid) {
      rejected.push({
        row: i + 1,
        errors: validate.errors,
      });
    } else {
      try {
        const created = await deviceService.create(record);
        imported.push(created);
      } catch (err) {
        rejected.push({
          row: i + 1,
          reason: err.message,
        });
      }
    }
  }

  reply.send({
    imported: imported.length,
    rejected: rejected.length,
    rejectedDetails: rejected,
  });
};

export { list, create, update, remove, exportItems, importItems };
