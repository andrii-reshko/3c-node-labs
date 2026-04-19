import { findSharedRepos as findSharedReposRest } from '../../repository/github.rest.js';
import { findSharedRepos as findSharedReposGQL } from '../../repository/github.gql.js';

const sharedReposV1 = async (request, reply) => {
  console.log(`request.server.config`, request.server.config);

  const { repo } = request.query;
  if (!repo) {
    return reply.badRequest('Missing repo parameter (e.g. fastify/fastify)');
  }
  try {
    const result = await findSharedReposRest(
      request.server.config.GITHUB_TOKEN,
      repo,
    );
    console.debug(`found ${JSON.stringify(result)}`);
    reply.send({ data: result });
  } catch (err) {
    reply.internalServerError(err.message);
  }
};

const sharedReposV2 = async (request, reply) => {
  const { repo } = request.query;
  if (!repo) {
    return reply.badRequest('Missing repo parameter (e.g. fastify/fastify)');
  }
  try {
    const result = await findSharedReposGQL(
      request.server.config.GITHUB_TOKEN,
      repo,
    );
    reply.send({ data: result });
  } catch (err) {
    reply.internalServerError(err.message);
  }
};

export { sharedReposV1, sharedReposV2 };
