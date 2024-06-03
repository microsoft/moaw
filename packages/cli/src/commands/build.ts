import fs from 'node:fs/promises';
import process from 'node:process';
import { dirname, parse } from 'node:path';
import createDebug from 'debug';
import { pathExists, readJson } from '../util.js';
import { defaultWorkshopFile } from '../constants.js';
import { processFileIncludes } from '../include.js';

const debug = createDebug('build');
const defaultDestinationSuffix = '.build.md';

export type BuildOptions = {
  file?: string;
  destination?: string;
  verbose?: boolean;
};

export async function build(options: BuildOptions = {}): Promise<void> {
  try {
    options.file = options.file?.trim() || defaultWorkshopFile;
    debug('Options %o', options);
    const { file } = options;
    const destination = options.destination ?? `${parse(file).name}${defaultDestinationSuffix}`;

    if (file === destination) {
      throw new Error('Source and destination files are the same');
    }

    if (!(await pathExists(file))) {
      throw new Error(`File not found: ${file}`);
    }

    const content = await processFileIncludes(file);

    const destFolder = dirname(destination);
    if (!(await pathExists(destFolder))) {
      debug(`Destination folder not found, creating: ${destFolder}}`);
      await fs.mkdir(destFolder, { recursive: true });
    }

    await fs.writeFile(destination, content);
    console.info(`Built workshop to ${destination} successfully.`);
  } catch (error: unknown) {
    const error_ = error as Error;
    console.error(error_.message);
    process.exitCode = 1;
  }
}
