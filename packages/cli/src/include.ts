import fs from 'node:fs/promises';
import { join, dirname } from 'node:path';
import createDebug from 'debug';
import { pathExists, replaceAllAsync } from './util.js';

const debug = createDebug('include');

export type IncludeOptions = {
  // Indent, tags, etc.
};

const includeRegex = /include::(.*)\[(.*)]/g;

// Function to loading a workshop file and build it

export async function processFileIncludes(file: string, options: IncludeOptions = {}) {
  const content = await fs.readFile(file, 'utf8');

  // TODO: handle attributes/options

  // Replace all includes matches with the content of the included file
  const newContent = replaceAllAsync(content, includeRegex, async (_match, filename: string, attributes: string) => {
    debug(`Found include ${filename} with attributes ${attributes}`);

    const includeFile = join(dirname(file), filename);
    if (!(await pathExists(includeFile))) {
      throw new Error(`Include file not found: ${includeFile} (in: ${file})`);
    }

    const includeContent = await processFileIncludes(includeFile, options);
    return includeContent;
  });

  return newContent;
}
