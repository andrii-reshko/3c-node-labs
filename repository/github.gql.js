import { graphql } from '@octokit/graphql';

export async function findSharedRepos(token, inputRepo) {
  if (!token) throw new Error('GitHub token is required');

  const gql = graphql.defaults({
    headers: { authorization: `token ${token}` },
  });

  const [owner, name] = inputRepo.split('/');

  // 1. Отримуємо контриб'юторів цільового репо (пагінація по commits)
  async function getContributors(rOwner, rName) {
    const commitCounts = {};
    let cursor = null;
    let pages = 0;

    while (pages < 10) {
      try {
        const data = await gql(
          `
          query($owner: String!, $name: String!, $cursor: String) {
            repository(owner: $owner, name: $name) {
              defaultBranchRef {
                target {
                  ... on Commit {
                    history(first: 100, after: $cursor) {
                      pageInfo { hasNextPage endCursor }
                      nodes { author { user { login } } }
                    }
                  }
                }
              }
            }
          }
        `,
          { owner: rOwner, name: rName, cursor },
        );

        const history = data?.repository?.defaultBranchRef?.target?.history;
        for (const node of history?.nodes ?? []) {
          const login = node?.author?.user?.login;
          if (login) commitCounts[login] = (commitCounts[login] ?? 0) + 1;
        }

        pages++;
        if (
          !history?.pageInfo?.hasNextPage ||
          Object.keys(commitCounts).length >= 30
        )
          break;
        cursor = history.pageInfo.endCursor;
      } catch {
        break;
      }
    }

    return Object.entries(commitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([login]) => login);
  }

  const contributorLogins = await getContributors(owner, name);
  if (!contributorLogins.length) return [];

  const contributorSet = new Set(contributorLogins);

  // 2. Збираємо кандидатні репозиторії (не форки)
  const candidateRepos = new Set();

  await Promise.all(
    contributorLogins.map(async (login) => {
      try {
        const data = await gql(
          `
          query($login: String!) {
            user(login: $login) {
              repositories(first: 30, orderBy: { field: PUSHED_AT, direction: DESC }, ownerAffiliations: [OWNER], isFork: false) {
                nodes { nameWithOwner }
              }
            }
          }
        `,
          { login },
        );

        for (const repo of data?.user?.repositories?.nodes ?? []) {
          if (repo.nameWithOwner !== inputRepo) {
            candidateRepos.add(repo.nameWithOwner);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }),
  );

  // 3. Для кожного кандидата рахуємо перетин contributors
  const results = [];

  await Promise.all(
    [...candidateRepos].map(async (repoFullName) => {
      try {
        const [rOwner, rName] = repoFullName.split('/');
        const repoContributors = await getContributors(rOwner, rName);

        let sharedCount = 0;
        for (const login of repoContributors) {
          if (contributorSet.has(login)) sharedCount++;
        }

        if (sharedCount > 0) {
          results.push({ name: repoFullName, count: sharedCount });
        }
      } catch (e) {
        console.error(e);
      }
    }),
  );

  // 4. Сортуємо по кількості спільних contributors
  return results.sort((a, b) => b.count - a.count).slice(0, 5);
}
