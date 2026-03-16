const errorHandler = (error, request, reply) => {
  request.log.error(error);

  const statusCode = error.statusCode || 500;
  reply.code(statusCode).send({
    error: error.name || 'Error',
    message: error.message || 'Internal Server Error',
    statusCode,
  });
};

export { errorHandler };
