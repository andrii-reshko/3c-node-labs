const check = (request, reply) => {
  // Task 6 – simulate an error for testing setErrorHandler
  // throw new Error();
  reply.send({
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
};

export { check };
