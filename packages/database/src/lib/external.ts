import process from 'process';
import { promises as fs } from 'fs';
import { parse } from 'yaml';
import { FrontMatterData } from '../../../website/src/app/shared/frontmatter.js';
import { ContentEntry } from '../../../website/src/app/catalog/content-entry.js';
import { FileInfo } from './workshop.js';
import { createEntry } from './entry.js';

export type ExternalEntryAdditionalData = {
  url: string;
  github_url: string;
  last_updated: string;
  language: string;
};

export type ExternalEntry = FrontMatterData & Partial<ExternalEntryAdditionalData>;

export async function getExternalEntries(filePath: string): Promise<ContentEntry[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const rawEntries = parse(data) as ExternalEntry[];
    const entriesPromises = rawEntries.map((rawEntry) => createEntryFromExternalEntry(rawEntry));
    const entries = await Promise.all(entriesPromises);
    return entries;
  } catch (error: any) {
    throw new Error(`Error while trying to read or parse "${filePath}": ${error?.message}`);
  }
}

function validateExtraProperties(entry: ExternalEntry) {
  if (!entry.url) {
    console.error(`No title found for external entry "${entry.title}"`);
    process.exitCode = 1;
  }

  if (!entry.last_updated) {
    console.error(`No last_updated found for external entry "${entry.title || entry.url}"`);
    process.exitCode = 1;
  }

  if (!entry.language) {
    console.error(`No language found for external entry "${entry.title || entry.url}"`);
    process.exitCode = 1;
  }
}

export async function createEntryFromExternalEntry(rawEntry: ExternalEntry): Promise<ContentEntry> {
  validateExtraProperties(rawEntry);

  const file: FileInfo = {
    // Used to trace errors
    path: `External entry: ${rawEntry.title || rawEntry.url}`,
    lastModified: '',
    meta: {
      ...rawEntry,
      published: true
    },
    markdown: ''
  };

  const extraData = {
    url: rawEntry.url,
    githubUrl: rawEntry.github_url,
    language: rawEntry.language,
    lastUpdated: rawEntry.last_updated ? new Date(rawEntry.last_updated).toISOString() : undefined
  };

  return createEntry(file, false, extraData);
}
