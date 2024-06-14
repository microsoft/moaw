import { join, dirname, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import createDebug from 'debug';
import { pathExists, readJson, runCommand } from './util.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const debug = createDebug('repo');
const repositoryRegex = /.*[/:](.*)\/(.*?)(?:\.git)?$|^([^/]*)\/([^/]*)$/;

export type RepositoryOptions = {
  repository?: string;
  branch?: string;
};

export type RepositoryInfo = {
  root: string;
  branch: string;
  github: GitHubRepository;
};

export type GitHubRepository = {
  user: string;
  name: string;
};

export const getShorthandString = (repo: GitHubRepository) => `${repo.user}/${repo.name}`;

export async function getRepositoryInfo(options: RepositoryOptions = {}): Promise<RepositoryInfo> {
  if (!(await hasGitInstalled())) {
    throw new Error('Git binary not found');
  }

  const root = await getGitRoot();
  if (!root) {
    throw new Error('Not a git repository');
  }

  const branch = options.branch?.trim() ?? (await getCurrentBranchFromGit());
  if (!branch) {
    throw new Error('Could not determine current branch');
  }

  const repository = parseRepository(options.repository) ?? (await getRepositoryFromGit());
  if (!repository) {
    throw new Error(`Invalid GitHub repository${options.repository ? ': ' + options.repository : ''}`);
  }

  return { root, branch, github: repository };
}

export async function hasGitInstalled() {
  try {
    await runCommand(`git --version`);
    return true;
  } catch {
    return false;
  }
}

export function parseRepository(string?: string): GitHubRepository | undefined {
  if (!string) {
    return undefined;
  }

  const match = repositoryRegex.exec(string.trim());
  if (!match) {
    return undefined;
  }

  const shorthand = Boolean(match[3]);
  return {
    user: shorthand ? match[3] : match[1],
    name: shorthand ? match[4] : match[2]
  };
}

export async function getRepositoryFromGit(): Promise<GitHubRepository | undefined> {
  try {
    const stdout = await runCommand('git remote get-url origin');
    const repository = parseRepository(stdout);
    debug(
      repository ? 'Repository found in git origin:' : 'No repository found in git origin',
      repository ? getShorthandString(repository) : ''
    );
    return repository;
  } catch (error: unknown) {
    debug(`Git error: ${String(error as Error)}`);
    return undefined;
  }
}

export async function getCurrentBranchFromGit(): Promise<string | undefined> {
  try {
    const stdout = await runCommand('git rev-parse --abbrev-ref HEAD');
    return stdout.trim();
  } catch (error: unknown) {
    debug(`Git error: ${String(error as Error)}`);
    return undefined;
  }
}

export async function getGitRoot(): Promise<string | undefined> {
  try {
    const stdout = await runCommand('git rev-parse --show-toplevel');
    // Git may use posix path on windows, so we normalize if needed
    return stdout.trim().split(posix.sep).join(sep);
  } catch {
    return undefined;
  }
}

export async function getMoawRepositoryFromPackage(): Promise<GitHubRepository | undefined> {
  const pkgFile = join(__dirname, '..', 'package.json');

  if (!(await pathExists(pkgFile))) {
    debug('No package.json found');
    return undefined;
  }

  try {
    const pkg = await readJson(pkgFile);
    const repository = parseRepository((pkg.repository?.url || pkg.repository) as string);
    debug(
      repository ? 'Repository found in package.json:' : 'No repository found in package.json',
      repository ? getShorthandString(repository) : ''
    );
    return repository;
  } catch (error: unknown) {
    debug('Error while reading package.json:', String(error));
    return undefined;
  }
}
