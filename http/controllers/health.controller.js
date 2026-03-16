import { responseJson } from '../../utils/http-utils.js';

const check = (req, res) => {
  responseJson(res, 200, {
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
};

export { check };
