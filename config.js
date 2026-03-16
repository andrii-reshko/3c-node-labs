const { PORT, HOSTNAME, NODE_ENV } = process.env;

if (!PORT || !HOSTNAME || !NODE_ENV) {
  console.error(
    'Error: Missing required environment variables (PORT, HOSTNAME, NODE_ENV).',
  );
  process.exit(1);
}

if (NODE_ENV !== 'development' && NODE_ENV !== 'production') {
  console.error(
    "Error: NODE_ENV must be either 'development' or 'production'.",
  );
  process.exit(1);
}

const config = {
  port: parseInt(PORT, 10),
  host: HOSTNAME,
  nodeEnv: NODE_ENV,
};

if (isNaN(config.port)) {
  console.error('Invalid PORT value. It must be a number.');
  process.exit(1);
}

module.exports = config;
