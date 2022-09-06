//****************************************************************************
// Search for workshops marked with "published: true" flag and
// create a JSON database of them.
//****************************************************************************

import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { chdir } from 'process';
import { exec } from 'child_process';
import { promisify } from 'util';
import glob from 'fast-glob';
import { marked } from 'marked';
import { FrontMatterParseResult, parseFrontMatter } from '../src/app/shared/frontmatter.js';
import { markedOptionsFactory } from '../src/app/shared/markdown.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainBranch = 'main';
const workshopsPath = path.join(__dirname, '../../../workshops');
const dbPath = path.join(__dirname, '../../src/public/workshops.json');
const githubRepoRegex = /github\.com[:/]([^/]+\/[^/]+)\.git$/;

let baseRepoUrl: string;

interface FileInfo extends FrontMatterParseResult {
  path: string;
  lastModified: string;
}

interface ContentEntry {
  title: string;
  description: string;
  tags: string[];
  url: string;
  authors: string[];
  duration: number | undefined;
  bannerUrl: string | undefined;
  lastUpdated: string;
}

(async function run() {
  chdir(workshopsPath);
  baseRepoUrl = await getBaseRepoUrl();

  // Find all published workshops
  const markdownFiles = await glob('**/*.md');
  const files = await Promise.all(markdownFiles.map(async (file) => readFile(file)));
  const workshops = files.filter((file): file is FileInfo =>
    Boolean(
      file?.meta &&
        file.meta.published &&
        (file.meta.type === undefined || file.meta.type === 'workshop')
    )
  );

  console.log(`Found ${workshops.length} published workshop(s)`);

  // Create JSON database
  const entries = workshops.map((workshop) => createEntry(workshop));
  try {
    await fs.writeFile(dbPath, JSON.stringify(entries, null, 2));
    console.log(`Created JSON database at ${dbPath}`);
  } catch (error: any) {
    console.error(`Error while trying to write "${dbPath}": ${error?.message}`);
  }
})();

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

function createEntry(file: FileInfo): ContentEntry {
  const title = file.meta.title ?? getFirstHeading(file.markdown);
  if (!title) {
    console.error(`No title found for file "${file.path}"`);
  }

  const description = file.meta.description;
  if (!description) {
    console.error(`No description found for file "${file.path}"`);
  }

  return {
    title: title ?? '[NO TITLE!]',
    description: description ?? '',
    tags: parseCsvOrArray(file.meta.tags),
    authors: parseCsvOrArray(file.meta.authors),
    duration: file.meta.duration_minutes,
    bannerUrl: file.meta.banner_url,
    lastUpdated: file.lastModified,
    url: `${baseRepoUrl}/${file.path}`,
  };
}

function parseCsvOrArray(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    return value.split(',').map((value) => value.trim());
  }
  return value;
}

async function getBaseRepoUrl() {
  const { stdout } = await promisify(exec)('git remote get-url origin');
  const url = stdout.trim();
  const match = githubRepoRegex.exec(url);
  if (!match) {
    throw new Error(`Error, could not get current GitHub repository URL!`);
  }
  return `${match[1]}/${mainBranch}`;
}

function getFirstHeading(markdown: string): string | undefined {
  let firstHeading;
  try {
    const options = markedOptionsFactory();
    options.renderer.heading = (_text, _level, raw, _slugger) => {
      firstHeading = raw;
      throw new Error();  // Quiclky exit parser
    };
    marked(markdown, options);
  } catch {}
  return firstHeading;
}
