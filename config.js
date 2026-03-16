const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const { PORT, HOSTNAME, NODE_ENV } = process.env;

const config = {
  port: parseInt(PORT, 10),
  host: HOSTNAME,
  nodeEnv: NODE_ENV,
};

const validate = ajv.compile({
  type: 'object',
  properties: {
    port: { type: 'integer', minimum: 1, maximum: 65535 },
    host: { type: 'string', minLength: 1 },
    nodeEnv: { type: 'string', enum: ['development', 'production'] },
  },
  required: ['port', 'host', 'nodeEnv'],
  additionalProperties: false,
});
const valid = validate(config);

if (!valid) {
  console.error('Invalid configuration:');
  validate.errors.forEach((err) => {
    console.error(`- ${err.instancePath || 'config'} ${err.message}`);
  });
  process.exit(1);
}

module.exports = config;
