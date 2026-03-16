const deviceProps = {
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
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

export {
  createDeviceSchema,
  updateDeviceSchema,
  listDeviceSchema,
  removeDeviceSchema,
};
