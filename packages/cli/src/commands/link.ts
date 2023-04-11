import process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import createDebug from 'debug';
import { pathExists } from '../util.js';
import { defaultWorkshopFile, pageBaseLink, workshopBaseLink, workshopsFolder } from '../constants.js';
import {
  getMoawRepositoryFromPackage,
  getRepositoryInfo,
  getShorthandString,
  type RepositoryInfo
} from '../repository.js';
import { parseFrontMatter } from '../frontmatter.js';

const debug = createDebug('link');

export type LinkOptions = {
  file?: string;
  repo?: string;
  branch?: string;
};

export async function link(options: LinkOptions = {}): Promise<void> {
  try {
    options.file = options.file?.trim() || defaultWorkshopFile;
    debug('Options %o', options);
    const { file } = options;

    if (!(await pathExists(file))) {
      throw new Error(`File not found: ${file}`);
    }

    const repo = await getRepositoryInfo({ repository: options.repo, branch: options.branch });
    debug(`Repository info: ${JSON.stringify(repo)}`);

    const filePath = path.resolve(file);
    debug(`Resolved file path: ${filePath}`);

    if (!filePath.startsWith(repo.root)) {
      throw new Error(`File "${file}" is not in repository path`);
    }

    const relativeFilePath = filePath.slice(Math.max(0, repo.root.length + 1));
    debug(`Relative file path: ${relativeFilePath}`);

    const link = await getLink(relativeFilePath, repo);
    console.info(link);
  } catch (error: unknown) {
    const error_ = error as Error;
    console.error(error_.message);
    process.exitCode = 1;
  }
}

async function getLink(file: string, repo: RepositoryInfo) {
  let source = file;
  const currentRepo = await getMoawRepositoryFromPackage();
  if (!currentRepo) {
    throw new Error('Could not get current repository details from package.json');
  }

  const isWorkshop = await isWorkshopFile(path.join(repo.root, source));
  if (isWorkshop && file.endsWith(defaultWorkshopFile)) {
    source = path.dirname(source) + path.sep;
  }

  // Make sure we have a posix path
  source = source.split(path.sep).join(path.posix.sep);

  const isMoawWorkshop =
    getShorthandString(currentRepo) === getShorthandString(repo.github) && file.startsWith(workshopsFolder);
  source = isMoawWorkshop
    ? source.slice(workshopsFolder.length)
    : `gh:${repo.github.user}/${repo.github.name}/${repo.branch}/${source}`;

  const baseLink = isWorkshop ? workshopBaseLink : pageBaseLink;
  return baseLink + source.toLowerCase();
}

async function isWorkshopFile(file: string) {
  try {
    const content = await fs.readFile(file, 'utf8');
    const { meta } = parseFrontMatter(content);
    return meta.type && meta.type === 'workshop';
  } catch {
    throw new Error(`Could not read file "${file}"`);
  }
}
