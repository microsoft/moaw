//****************************************************************************
// Search for workshops marked with "published: true" flag and
// create a JSON database of them.
//****************************************************************************

import path from 'path';
import process from 'process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { getWorkshopEntries } from './lib/workshop.js';
import { getExternalEntries } from './lib/external.js';
import { getEntriesFromExternalSources } from './lib/parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workshopsPath = path.join(__dirname, '../../workshops');
const externalEntriesFiles = path.join(__dirname, '../external.yml');
const dbPath = path.join(__dirname, '../../website/src/public/workshops.json');

(async function run() {
  let entries = await getWorkshopEntries(workshopsPath);
  console.log(`Found ${entries.length} published workshop(s) in 'workshops/'`);

  // TODO: find localized versions

  try {
    const externalEntries = await getExternalEntries(externalEntriesFiles);
    console.log(`Found ${externalEntries.length} external workshop(s)`);
  
    const externalSourcesEntries = await getEntriesFromExternalSources();
    console.log(`Found ${externalSourcesEntries.length} workshop(s) from external sources`);
  
    entries = [...entries, ...externalEntries, ...externalSourcesEntries];
  
    entries.sort((a, b) => (a.lastUpdated > b.lastUpdated ? -1 : 1));
    console.log(`Total workshops: ${entries.length}`);
  } catch (error: any) {
    console.error(`Error while trying to build database: ${error?.message}`);
    process.exitCode = 1;
    return;
  }

  try {
    await fs.writeFile(dbPath, JSON.stringify(entries, null, 2));
    console.log(`Created JSON database at ${dbPath}`);
  } catch (error: any) {
    console.error(`Error while trying to write "${dbPath}": ${error?.message}`);
  }
})();
