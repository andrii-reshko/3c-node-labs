const { URL } = require('node:url');
const deviceController = require('../controllers/device.controller');
const healthController = require('../controllers/health.controller');

const router = (req, res) => {
  const schema = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const parsedUrl = new URL(req.url, `${schema}://${host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  res.setHeader('Content-Type', 'application/json;charset=utf-8');

  if (method === 'GET' && pathname === '/health') {
    return healthController.check(req, res);
  }

  if (method === 'GET' && pathname === '/device') {
    return deviceController.list(req, res, parsedUrl);
  }

  if (method === 'POST' && pathname === '/device') {
    return deviceController.create(req, res);
  }

  if (method === 'PATCH' && pathname.startsWith('/device/')) {
    return deviceController.update(req, res, parsedUrl);
  }

  if (method === 'DELETE' && pathname.startsWith('/device/')) {
    return deviceController.remove(req, res, parsedUrl);
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Route not found' }));
};

module.exports = router;
