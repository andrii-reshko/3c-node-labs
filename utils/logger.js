import config from '../config/env.js';

const log = (level, method, url, statusCode, message = '') => {
  const timestamp = new Date().toISOString();
  console.log(
    `${timestamp} | ${level} | ${method} | ${url} | ${statusCode}${message ? ` | ${message}` : ''}`,
  );
};

// middleware-like stuff for logging.
const requestLogger = (req, res) => {
  const originalEnd = res.end;
  res.end = (...args) => {
    const { method, url } = req;
    const { statusCode } = res;
    if (config.nodeEnv === 'development') {
      log('INFO', method, url, statusCode);
    } else if (config.nodeEnv === 'production' && statusCode >= 400) {
      log('ERROR', method, url, statusCode);
    }
    originalEnd.apply(res, args);
  };
};

// generic logger.
const logger = {
  info: (message) =>
    console.log(`${new Date().toISOString()} | INFO | ${message}`),
  error: (message) =>
    console.error(`${new Date().toISOString()} | ERROR | ${message}`),
};

export { requestLogger, logger };
