import { exec } from 'child_process';
import { promisify } from 'util';

const githubRepoRegex = /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/;

export function parseCsvOrArray(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    return value.split(',').map((value) => value.trim());
  }
  return value;
}

export async function getGitHubRepoUrl(): Promise<string | undefined> {
  let url: string | undefined = process.env['GITHUB_REPO_URL'];
  if (!url) {
    const { stdout } = await promisify(exec)('git remote get-url origin');
    url = stdout.trim();
  }
  const match = githubRepoRegex.exec(url);
  if (!match) {
    throw new Error(`Error, could not get current GitHub repository URL!`);
  }
  return `https://github.com/${match[1]}`;
}
