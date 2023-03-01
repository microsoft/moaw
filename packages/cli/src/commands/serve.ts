import fs from 'node:fs/promises';
import process from 'node:process';
import createDebug from 'debug';

const debug = createDebug('serve');

export type ServeOptions = {
  path?: string;
  port?: number;
  host?: string;
  open?: boolean;
};

export async function serve(options: ServeOptions = {}) {
  try {
    // TODO: search for workshop.md
  } catch (error: unknown) {
    const error_ = error as Error;
    console.error(error_.message);
    process.exitCode = 1;
  }
}
