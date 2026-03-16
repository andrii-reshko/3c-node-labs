const check = (req, res) => {
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    }),
  );
};

export { check };
