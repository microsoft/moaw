export function getFileUrl(repoPath: string) {
  if (repoPath.endsWith('/')) {
    repoPath += 'workshop.md';
  }
  if (!repoPath.endsWith('.md')) {
    repoPath += '.md';
  }
  return `https://raw.githubusercontent.com/${repoPath}`;
}

export function getBaseUrl(url: string) {
  if (url.endsWith('/')) {
    return url;
  }
  const lastSlash = url.lastIndexOf('/');
  if (lastSlash === -1) {
    return url;
  }
  return url.substring(0, lastSlash + 1);
}

export function getGitHubRepoUrl(url: string) {
  return url.split('/').slice(0, 4).join('/');
}
