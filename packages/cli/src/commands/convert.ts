import fs from 'node:fs/promises';
import process from 'node:process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import createDebug from 'debug';
import { pathExists, readJson } from '../util.js';
import { defaultWorkshopFile } from '../constants.js';
import { convertToMarkdown } from '../asciidoc.js';

const debug = createDebug('convert');

export type ConvertOptions = {
  file?: string;
  attributes?: string;
  destination?: string;
  verbose?: boolean;
};

export async function convert(options: ConvertOptions = {}): Promise<void> {
  try {
    const { file } = options;
    const destination = options.destination ?? defaultWorkshopFile;

    if (!file) {
      throw new Error('No filename provided');
    }

    let attributes = {};
    if (options.attributes) {
      debug(`Reading attributes from ${options.attributes}...`);
      if (!(await pathExists(options.attributes))) {
        throw new Error(`Attributes file not found: ${options.attributes}`);
      }

      attributes = await readJson(options.attributes);
      debug(`Attributes: ${JSON.stringify(attributes)}`);
    }

    const { markdown, warnings, errors } = await convertToMarkdown(file, attributes);
    const destFolder = dirname(destination);
    if (!(await pathExists(destFolder))) {
      debug(`Destination folder not found, creating: ${destFolder}}`);
      await fs.mkdir(destFolder, { recursive: true });
    }

    await fs.writeFile(destination, markdown);

    if (warnings.length === 0 && errors.length === 0) {
      console.info('Converted asciidoc successfully.');
    } else {
      console.info(`Converted asciidoc with ${errors.length > 0 ? 'errors' : 'warnings'}.`);
      if (warnings.length > 0) {
        console.info(`Warnings:\n- ${warnings.join('\n- ')}`);
      }

      if (errors.length > 0) {
        console.info(`Errors:\n- ${errors.join('\n- ')}`);
        process.exitCode = 1;
      }
    }
  } catch (error: unknown) {
    const error_ = error as Error;
    console.error(error_.message);
    process.exitCode = 1;
  }
}
