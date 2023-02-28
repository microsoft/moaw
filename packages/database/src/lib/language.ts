import path from 'path';
import glob from 'fast-glob';
import { defaultLanguage } from '../../../website/src/app/shared/constants.js';
import { ContentEntry } from '../../../website/src/app/catalog/content-entry.js';
import { getWorkshops } from './workshop.js';
import { createEntry } from './entry.js';

const languageRegex = /.*?\.([a-zA-Z]{2})\.md$/;
const translationsFolder = 'translations';

export function getLanguageFromFile(filePath: string): string {
  const match = languageRegex.exec(filePath);
  return match ? match[1] : defaultLanguage;
}

export async function findTranslations(filePath: string): Promise<ContentEntry[]> {
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
