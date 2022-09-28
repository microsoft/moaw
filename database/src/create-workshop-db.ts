//****************************************************************************
// Search for workshops marked with "published: true" flag and
// create a JSON database of them.
//****************************************************************************

import path from 'path';
import process from 'process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import glob from 'fast-glob';
import { marked } from 'marked';
import { FrontMatterParseResult, parseFrontMatter } from '../../website/src/app/shared/frontmatter.js';
import { markedOptionsFactory } from '../../website/src/app/shared/markdown.js';
import { ContentEntry } from '../../website/src/app/catalog/content-entry.js';
import { defaultLanguage, defaultWorkshopFile } from '../../website/src/app/shared/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainBranch = 'main';
const workshopsPath = path.join(__dirname, '../../workshops');
const dbPath = path.join(__dirname, '../../website/src/public/workshops.json');
const languageRegex = /.*?\.([a-zA-Z]{2})\.md$/;
const translationsFolder = 'translations';

interface FileInfo extends FrontMatterParseResult {
  path: string;
  lastModified: string;
}

(async function run() {
  process.chdir(workshopsPath);

  // Find all published workshops
  const markdownFiles = await glob('**/*.md', { ignore: ['**/node_modules/**', '**/translations/*.md'] });
  const workshops = await getWorkshops(markdownFiles);

  console.log(`Found ${workshops.length} published workshop(s)`);

  // Create JSON database
  const entriesPromises = workshops.map((workshop) => createEntry(workshop));
  const entries = await Promise.all(entriesPromises);
  entries.sort((a, b) => (a.lastUpdated > b.lastUpdated ? 1 : -1));

  // TODO: find localized versions

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

async function createEntry(file: FileInfo, searchTranslations = true): Promise<ContentEntry> {
  const title = file.meta.title ?? getFirstHeading(file.markdown);
  if (!title) {
    console.error(`No title found for file "${file.path}"`);
  }

  const description = file.meta.description;
  if (!description) {
    console.error(`No description found for file "${file.path}"`);
  }

  const url = file.path.endsWith(defaultWorkshopFile) ? `${path.dirname(file.path)}/` : file.path;

  return {
    title: title ?? '[NO TITLE!]',
    description: description ?? '',
    tags: parseCsvOrArray(file.meta.tags),
    authors: parseCsvOrArray(file.meta.authors),
    duration: file.meta.duration_minutes,
    bannerUrl: file.meta.banner_url,
    lastUpdated: file.lastModified,
    url,
    language: getLanguageFromFile(file.path),
    ...(searchTranslations ? { translations: await findTranslations(file.path) } : {})
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

function getFirstHeading(markdown: string): string | undefined {
  let firstHeading;
  try {
    const options = markedOptionsFactory();
    options.renderer.heading = (_text, _level, raw, _slugger) => {
      firstHeading = raw;
      throw new Error(); // Quiclky exit parser
    };
    marked(markdown, options);
  } catch {}
  return firstHeading;
}

function getLanguageFromFile(filePath: string): string {
  const match = languageRegex.exec(filePath);
  return match ? match[1] : defaultLanguage;
}

async function findTranslations(filePath: string): Promise<ContentEntry[]> {
  const dir = path.dirname(filePath);
  const originalLanguage = getLanguageFromFile(filePath);
  const extension = (originalLanguage !== defaultLanguage ? `.${originalLanguage}` : '') + path.extname(filePath);
  const baseName = path.basename(filePath, extension);
  const translationsDir = path.join(dir, translationsFolder);
  const translations = glob.sync(`${translationsDir}/${baseName}*.md`);
  const translatedFiles = await getWorkshops(translations);
  const entriesPromises = translatedFiles.map((file) => createEntry(file, false));
  return Promise.all(entriesPromises);
}

async function getWorkshops(filePaths: string[]): Promise<FileInfo[]> {
  const files = await Promise.all(filePaths.map(async (file) => readFile(file)));
  return files.filter((file): file is FileInfo =>
    Boolean(file?.meta && file.meta.published && (file.meta.type === undefined || file.meta.type === 'workshop'))
  );
}
