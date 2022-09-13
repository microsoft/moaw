import { defaultWorkshopFile, githubFileScheme, localWorkshopPath } from "./constants";

export function getFileUrl(repoPath: string) {
  if (repoPath.endsWith('/')) {
    repoPath += defaultWorkshopFile;
  }
  if (!repoPath.endsWith('.md')) {
    repoPath += '.md';
  }
  if (repoPath.startsWith(githubFileScheme)) {
    return repoPath.replace(githubFileScheme, `https://raw.githubusercontent.com/`);
  }
  return localWorkshopPath + repoPath;
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
