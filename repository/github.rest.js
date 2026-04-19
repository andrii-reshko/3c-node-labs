import { Octokit } from '@octokit/rest';

export async function findSharedRepos(token, inputRepo) {
  if (!token) throw new Error('GitHub token is required');

  const octokit = new Octokit({ auth: token });
  const [owner, repo] = inputRepo.split('/');

  // 1. Отримуємо контриб'юторів цільового репо
  let contributors;
  try {
    const { data } = await octokit.repos.listContributors({
      owner,
      repo,
      per_page: 30,
      anon: 'no',
    });
    contributors = data;
  } catch {
    return [];
  }

  if (!Array.isArray(contributors) || !contributors.length) return [];

  const contributorSet = new Set(contributors.map((c) => c.login));

  // 2. Збираємо кандидатні репозиторії
  const candidateRepos = new Set();

  await Promise.all(
    contributors.map(async (user) => {
      try {
        const { data: repos } = await octokit.repos.listForUser({
          username: user.login,
          per_page: 30,
          sort: 'pushed',
          type: 'owner',
        });

        for (const r of repos) {
          if (r.full_name !== inputRepo && !r.fork) {
            candidateRepos.add(r.full_name);
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
        const [rOwner, rRepo] = repoFullName.split('/');
        const { data: repoContributors } = await octokit.repos.listContributors(
          {
            owner: rOwner,
            repo: rRepo,
            per_page: 30,
          },
        );

        if (!Array.isArray(repoContributors)) return;

        let sharedCount = 0;
        for (const c of repoContributors) {
          if (contributorSet.has(c.login)) sharedCount++;
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
