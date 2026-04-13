export const requiresApiKey = async (request, reply) => {
  const apiKey = request.headers['x-api-key'];
  const config = request.server.config || { ADMIN_API_KEY: null };
  if (apiKey !== config.ADMIN_API_KEY) {
    reply.unauthorized('Invalid API Key');
  }
};
