const deviceProps = {
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
    description: { type: 'string' },
    enabled: { type: 'boolean' },
    image: { type: 'string', nullable: true },
    power: { type: 'integer' },
  },
  additionalProperties: false,
};

const deviceResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
    description: { type: 'string' },
    enabled: { type: 'boolean' },
    image: { type: 'string', nullable: true },
    power: { type: 'integer' },
  },
};

const createDeviceSchema = {
  body: {
    ...deviceProps,
    required: ['device', 'status', 'room'],
  },
  response: {
    201: {
      type: 'object',
      properties: {
        data: deviceResponseSchema,
      },
    },
  },
};

const updateDeviceSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
    },
    required: ['id'],
  },
  body: {
    ...deviceProps,
    minProperties: 1,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: deviceResponseSchema,
      },
    },
  },
};

const listDeviceSchema = {
  querystring: {
    type: 'object',
    properties: {
      room: { type: 'string' },
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: deviceResponseSchema,
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
  },
};

const listDeviceSchemaV1 = {
  querystring: {
    type: 'object',
    properties: {
      room: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: deviceResponseSchema,
        },
        total: { type: 'integer' },
      },
    },
  },
};

const removeDeviceSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
    },
    required: ['id'],
  },
  response: {
    204: {
      type: 'null',
    },
  },
};

const importDeviceSchema = {
  ...deviceProps,
  required: ['device', 'status', 'room'],
};

const exportDeviceSchema = {
  querystring: {
    type: 'object',
    properties: {
      transform: { type: 'boolean', default: false },
    },
  },
};

export {
  createDeviceSchema,
  updateDeviceSchema,
  listDeviceSchema,
  listDeviceSchemaV1,
  removeDeviceSchema,
  importDeviceSchema,
  exportDeviceSchema,
};
