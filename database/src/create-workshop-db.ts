//****************************************************************************
// Search for workshops marked with "published: true" flag and
// create a JSON database of them.
//****************************************************************************

import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { getWorkshopEntries } from './lib/workshop.js';
import { getExternalEntries } from './lib/external.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workshopsPath = path.join(__dirname, '../../workshops');
const externalEntriesFiles = path.join(__dirname, '../external.yml');
const dbPath = path.join(__dirname, '../../website/src/public/workshops.json');

(async function run() {
  let entries = await getWorkshopEntries(workshopsPath);
  console.log(`Found ${entries.length} published workshop(s) in 'workshops/'`);

  // TODO: find localized versions

  const externalEntries = await getExternalEntries(externalEntriesFiles);
  console.log(`Found ${externalEntries.length} external workshop(s)`);

  entries = [...entries, ...externalEntries];

  entries.sort((a, b) => (a.lastUpdated > b.lastUpdated ? -1 : 1));
  console.log(`Total workshops: ${entries.length}`);

  try {
    await fs.writeFile(dbPath, JSON.stringify(entries, null, 2));
    console.log(`Created JSON database at ${dbPath}`);
  } catch (error: any) {
    console.error(`Error while trying to write "${dbPath}": ${error?.message}`);
  }
})();
