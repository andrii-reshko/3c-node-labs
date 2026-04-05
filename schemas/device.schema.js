const deviceProps = {
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
    description: { type: 'string' },
    enabled: { type: 'boolean' },
    image: { type: 'string', nullable: true },
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

export {
  createDeviceSchema,
  updateDeviceSchema,
  listDeviceSchema,
  removeDeviceSchema,
  importDeviceSchema,
};
