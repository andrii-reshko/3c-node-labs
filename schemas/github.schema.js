const githubRequestSchema = {
  querystring: {
    type: 'object',
    properties: {
      repo: { type: 'string' },
    },
    required: ['repo'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              count: { type: 'integer' },
            },
          },
        },
      },
    },
  },
};

export { githubRequestSchema };
