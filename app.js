const { createServer } = require('node:http');
const { URL } = require('node:url');
const Ajv = require('ajv');
const storage = require('./storage');
const config = require('./config');
const { requestLogger, logger } = require('./logger');

const ajv = new Ajv();

const validateDevice = ajv.compile({
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
  },
  required: ['device', 'status', 'room'],
  additionalProperties: false,
});

const validateDeviceUpdate = ajv.compile({
  type: 'object',
  properties: {
    device: { type: 'string' },
    status: { type: 'string' },
    room: { type: 'string' },
  },
  additionalProperties: false,
  minProperties: 1,
});

const readBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      try {
        body += chunk.toString();
      } catch (err) {
        reject(err);
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
};

const server = createServer((req, res) => {
  // log each request
  requestLogger(req, res);

  const schema = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const method = req.method;
  const parsedUrl = new URL(req.url, `${schema}://${host}`);
  const pathname = parsedUrl.pathname;
  res.setHeader('Content-Type', 'application/json;charset=utf-8');

  // health check endpoint
  if (method === 'GET' && pathname === '/health') {
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      }),
    );
  }

  // list devices
  if (method === 'GET' && pathname === '/device') {
    const roomFilter = parsedUrl.searchParams.get('room');
    const results = roomFilter
      ? storage.fetch((e) => e.room.toLowerCase() === roomFilter.toLowerCase())
      : storage.fetch();

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        data: results,
        total: results.length,
      }),
    );
  }

  // add a new device
  if (method === 'POST' && pathname === '/device') {
    readBody(req)
      .then((data) => {
        if (!validateDevice(data)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: validateDevice.errors }));
          return;
        }

        try {
          const instance = storage.add(data);

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

    return;
  }

  // update a device by id
  if (method === 'PATCH' && pathname.startsWith('/device/')) {
    const id = parseInt(pathname.split('/')[2]);

    readBody(req)
      .then((updates) => {
        if (!validateDeviceUpdate(updates)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: validateDeviceUpdate.errors }));
          return;
        }

        try {
          const updated = storage.update(id, updates);
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

    return;
  }

  // delete a device by id
  if (method === 'DELETE' && pathname.startsWith('/device/')) {
    const id = parseInt(pathname.split('/')[2]);
    try {
      const removed = storage.remove(id);
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
    return;
  }

  // 404
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(config.port, config.host, () => {
  logger.info(`Server running at http://${config.host}:${config.port}/`);
});

// --- Graceful Shutdown Implementation ---
// Added for Lab 2 to handle system signals and ensure a clean exit.
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. shutting down gracefully`);
  server.close((err) => {
    if (err) {
      logger.error(`${err.message}`);
      process.exit(1);
    }
    logger.info('Server closed');
    process.exit(0);
  });

  // force shutdown by timeout
  setTimeout(() => {
    logger.error('Forcefully shutting down');
    process.exit(1);
  }, 5000);
};

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle global uncaught exceptions
process.on('uncaughtException', (err, origin) => {
  logger.error(`Uncaught at ${origin}, error: ${err.stack || err}`);
  gracefulShutdown('uncaughtException');
});

// Handle global unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`rejection at ${promise}, reason: ${reason.stack || reason}`);
  gracefulShutdown('unhandledRejection');
});
