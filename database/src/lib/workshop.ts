import { promises as fs } from 'fs';
import process from 'process';
import path from 'path';
import glob from 'fast-glob';
import { ContentEntry } from '../../../website/src/app/catalog/content-entry.js';
import { FrontMatterParseResult, parseFrontMatter } from '../../../website/src/app/shared/frontmatter.js';
import { createEntry } from './entry.js';
import { getGitHubRepoUrl } from './util.js';

const mainBranch = 'main';

export interface FileInfo extends FrontMatterParseResult {
  path: string;
  lastModified: string;
}

async function readFile(filePath: string): Promise<FileInfo | undefined> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const lastModified = (await fs.stat(filePath)).mtime.toISOString();
    return {
      path: filePath,
      lastModified,
      ...parseFrontMatter(data)
    };
  } catch (error: any) {
    console.error(`Error while trying to read "${filePath}": ${error?.message}`);
    return undefined;
  }
}

export async function getWorkshops(filePaths: string[]): Promise<FileInfo[]> {
  const files = await Promise.all(filePaths.map(async (file) => readFile(file)));
  return files.filter((file): file is FileInfo =>
    Boolean(file?.meta && file.meta.published && (file.meta.type === undefined || file.meta.type === 'workshop'))
  );
}

export async function getWorkshopEntries(workshopsPath: string): Promise<ContentEntry[]> {
  const currentCwd = process.cwd();
  process.chdir(workshopsPath);

  // Find all published workshops
  const markdownFiles = await glob('**/*.md', { ignore: ['**/node_modules/**', '**/translations/*.md'] });
  const workshops = await getWorkshops(markdownFiles);
  const githubUrl = await getGitHubRepoUrl();
  const entriesPromises = workshops.map((workshop) =>
    createEntry(workshop, true, { githubUrl: `${githubUrl}/tree/${mainBranch}/workshops/${path.dirname(workshop.path)}` })
  );
  const entries = await Promise.all(entriesPromises);

  process.chdir(currentCwd);

  return entries;
}
