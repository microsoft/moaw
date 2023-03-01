import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import createDebug from 'debug';
import kebabCase from 'lodash.kebabcase';
import { templateFiles } from '../constants.js';
import { pathExists, recursiveCopy } from '../util.js';

const debug = createDebug('init');

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
    console.info('Done!');
    console.info(
      `Edit ${path.join(
        path.resolve(foldername),
        'workshop.md'
      )} then run "moaw serve ${foldername}" to preview your workshop.`
    );
  } catch (error: unknown) {
    const error_ = error as Error;
    console.error(error_.message);
    process.exitCode = 1;
  }
}

async function copyTemplate(destinationPath: string): Promise<void> {
  if (await pathExists(destinationPath)) {
    debug('Destination path %s already exists', destinationPath);
    const isFolder = await fs.lstat(destinationPath).then((stats) => stats.isDirectory());
    if (!isFolder) {
      throw new Error(`Destination path ${destinationPath} is not a directory`);
    }
  } else {
    debug('Creating destination directory %s', destinationPath);
    await fs.mkdir(destinationPath, { recursive: true });
  }

  debug('Copying template to %s', destinationPath);
  const copyPromises = templateFiles.map(async (templateFile) => recursiveCopy(templateFile, destinationPath));
  await Promise.all(copyPromises);
}
