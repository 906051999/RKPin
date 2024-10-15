async function getGitHubReadme(repoUrl) {
    console.log('getGitHubReadme called with:', repoUrl);
    const branches = ['main', 'master'];
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  
    console.log('Fetching README for repo:', repoUrl);
    console.log('Using proxy:', proxyUrl);
  
    // 从 repoUrl 中提取用户名和仓库名
    const [, user, repo] = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    for (const branch of branches) {
      const readmeUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/README.md`;
      console.log('Trying URL:', readmeUrl);
      try {
        console.log('Fetching:', readmeUrl);
        const response = await fetch(readmeUrl, {
          agent: proxyUrl ? new URL(proxyUrl) : undefined
        });
        console.log('Response status:', response.status);
        if (response.ok) {
          const content = await response.text();
          console.log('README content length:', content.length);
          return content;
        }
      } catch (error) {
        console.error(`Error fetching README from ${branch} branch:`, error);
      }
    }
    
    console.error('README not found in main or master branch');
    throw new Error('README not found in main or master branch');
}

export default getGitHubReadme;
