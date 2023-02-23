import path from 'path';
import process from 'process';
import crypto from 'crypto';
import { defaultWorkshopFile } from '../../../website/src/app/shared/constants.js';
import { ContentEntry } from '../../../website/src/app/catalog/content-entry.js';
import { FileInfo } from './workshop.js';
import { parseCsvOrArray } from './util.js';
import { getFirstHeading } from './markdown.js';
import { getLanguageFromFile, findTranslations } from './language.js';

export type AdditionalMetadata = Partial<{
  url: string;
  githubUrl: string;
  lastUpdated: string;
  language: string;
}>;

export async function createEntry(
  file: FileInfo,
  searchTranslations = true,
  extraData?: AdditionalMetadata
): Promise<ContentEntry> {
  extraData = extraData || {};
  file.meta.title = file.meta.title || getFirstHeading(file.markdown);
  validateEntry(file);
  const entryWithoutId: Partial<ContentEntry> = {
    title: file.meta.title ?? '[NO TITLE!]',
    description: file.meta.description ?? '',
    tags: parseCsvOrArray(file.meta.tags),
    authors: parseCsvOrArray(file.meta.authors),
    duration: file.meta.duration_minutes,
    bannerUrl: file.meta.banner_url,
    lastUpdated: extraData.lastUpdated ?? file.lastModified,
    url: extraData.url ?? getUrl(file.path),
    githubUrl: extraData.githubUrl ?? undefined,
    language: extraData.language ?? getLanguageFromFile(file.path),
    level: file.meta.level ?? 'beginner',
    audience: parseCsvOrArray(file.meta.audience) ?? ['students', 'pro devs'],
    ...(searchTranslations ? { translations: await findTranslations(file.path) } : {})
  };
  return {
    ...entryWithoutId,
    id: createHash(entryWithoutId)
  } as ContentEntry;
}

function getUrl(filePath: string): string {
  return filePath.endsWith(defaultWorkshopFile) ? `${path.dirname(filePath)}/` : filePath;
}

function validateEntry(file: FileInfo) {
  if (!file.meta.title) {
    console.error(`No title found for file "${file.path}"`);
    process.exitCode = 1;
  }

  if (!file.meta.description) {
    console.error(`No description found for file "${file.path}"`);
    process.exitCode = 1;
  }

  if (!file.meta.level) {
    console.error(`No level found for file "${file.path}"`);
    process.exitCode = 1;
  }

  // TODO: validate tags, authors, duration, banner_url
}

function createHash(data: any) {
  return crypto.createHash("shake256", { outputLength: 16 })
    .update(JSON.stringify(data))
    .digest("hex");
}
