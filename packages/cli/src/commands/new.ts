import fs from 'node:fs/promises';
import process from 'node:process';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import createDebug from 'debug';
import kebabCase from 'lodash.kebabcase';
import { templatePath, defaultWorkshopFile } from '../constants.js';
import { pathExists, recursiveCopy } from '../util.js';

const debug = createDebug('init');
const __dirname = dirname(fileURLToPath(import.meta.url));

export type NewOptions = {
  name?: string;
};

export async function createNew(options: NewOptions = {}): Promise<void> {
  try {
    const { name } = options;
    if (!name) {
      throw new Error('Please provide a name for the new workshop');
    }

    const foldername = kebabCase(name);
    await copyTemplate(foldername);
    console.info(`Created new workshop in '${foldername}'`);
    console.info(`Edit '${foldername}/${defaultWorkshopFile}' and run 'moaw serve ${foldername}' to preview your workshop.`);
  } catch (error: unknown) {
    const error_ = error as Error;
    console.error(error_.message);
    process.exitCode = 1;
  }
}

async function copyTemplate(destinationPath: string): Promise<void> {
  if (await pathExists(destinationPath)) {
    throw new Error(`Destination path '${destinationPath}' already exists`);
  } else {
    debug('Creating destination path %s', destinationPath);
    await fs.mkdir(destinationPath, { recursive: true });
  }

  debug('Copying template to %s', destinationPath);
  await recursiveCopy(path.join(__dirname, '../..', templatePath), destinationPath);
}
