import { ContentEntry } from '../../../website/src/app/catalog/content-entry.js';
import { ExternalEntry, createEntryFromExternalEntry } from './external.js';
import * as parsers from '../parsers/index.js';

export type ExternalSourceParser = () => Promise<ExternalEntry[]>;

export async function getEntriesFromExternalSources(): Promise<ContentEntry[]> {
  try {
    const parseFunctions: ExternalSourceParser[] = Object.values(parsers).map((parser) => parser.default);
    const entriesPromises = parseFunctions.map(async (parse) => {
      const rawEntries = await parse();
      const entriesPromises = rawEntries.map((rawEntry) => createEntryFromExternalEntry(rawEntry));
      const entries = await Promise.all(entriesPromises);
      return entries;
    });
    const entries = await Promise.all(entriesPromises);
    return entries.flat();
  } catch (error: any) {
    console.error(`Error while trying to get entries from external parsers: ${error?.message}`);
    return [];
  }
}
