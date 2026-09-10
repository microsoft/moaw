import path from 'path';
import glob from 'fast-glob';
import { promises as fs } from 'fs';
import { defaultLanguage } from '../../../website/src/app/shared/constants.js';
import { ContentEntry } from '../../../website/src/app/catalog/content-entry.js';
import { getWorkshops } from './workshop.js';
import { createEntry } from './entry.js';
import { FileInfo } from './workshop.js';
import { parseCsvOrArray } from './util.js';

const languageRegex = /.*?\.([a-zA-Z]{2}(?:_[A-Z]{2})?)\.md$/;
const translationsFolder = 'translations';

export function getLanguageFromFile(filePath: string): string {
  const match = languageRegex.exec(filePath);
  return match ? match[1] : defaultLanguage;
}

export async function findTranslations(filePath: string, fileInfo?: FileInfo): Promise<ContentEntry[]> {
  const dir = path.dirname(filePath);
  const originalLanguage = getLanguageFromFile(filePath);
  const extension = (originalLanguage !== defaultLanguage ? `.${originalLanguage}` : '') + path.extname(filePath);
  const baseName = path.basename(filePath, extension);
  const translationsDir = path.join(dir, translationsFolder);
  
  // Find translations from filesystem
  const translations = glob.sync(`${translationsDir}/${baseName}*.md`);
  
  // Also check metadata for translations list
  const metadataTranslations: string[] = [];
  if (fileInfo?.meta?.translations) {
    const translationCodes = parseCsvOrArray(fileInfo.meta.translations);
    for (const langCode of translationCodes) {
      const translationPath = path.join(translationsDir, `${baseName}.${langCode}.md`);
      // Only add if file exists and not already in the list
      try {
        await fs.access(translationPath);
        if (!translations.includes(translationPath)) {
          metadataTranslations.push(translationPath);
        }
      } catch {
        console.warn(`Translation file not found for language '${langCode}': ${translationPath}`);
      }
    }
  }
  
  const allTranslations = [...translations, ...metadataTranslations];
  const translatedFiles = await getWorkshops(allTranslations);
  const entriesPromises = translatedFiles.map((file) => createEntry(file, false));
  return Promise.all(entriesPromises);
}
