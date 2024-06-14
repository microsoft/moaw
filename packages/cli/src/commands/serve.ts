import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { create, type Options } from 'browser-sync';
import createDebug from 'debug';
import glob from 'fast-glob';
import { defaultWorkshopFile, websitePath } from '../constants.js';
import { isFolder, pathExists } from '../util.js';

const debug = createDebug('serve');
const __dirname = dirname(fileURLToPath(import.meta.url));
const browserSync = create();

export type ServeOptions = {
  path?: string;
  port?: number;
  host?: string;
  open?: boolean;
  verbose?: boolean;
};

export async function serve(options: ServeOptions = {}) {
  try {
    const basePath = options.path || '.';
    const port = options.port || 4444;
    const host = options.host || 'localhost';
    const open = Boolean(options.open);
    debug('Options %o', { basePath, port, host, open, verbose: options.verbose });

    if (!(await pathExists(basePath))) {
      throw new Error(`Path not found: ${basePath}`);
    }

    let isPathFolder = await isFolder(basePath);
    let targetPath = basePath;
    if (isPathFolder) {
      debug(`Path is a folder: ${basePath}`);
      const workshops = await glob(`**/${defaultWorkshopFile}`, {
        ignore: ['**/node_modules/**'],
        cwd: basePath
      });
      if (workshops.length === 0) {
        throw new Error(`No workshop found in path: ${basePath}`);
      }

      const workshopFile = path.join(basePath, workshops[0]);
      const workshopFolder = path.dirname(workshopFile);
      const isCurrentFolder = workshopFolder === '.';
      debug(`Found ${workshops.length} workshop(s) in path: ${basePath}`);
      debug(`Using first workshop found: ${workshopFile}`);
      debug(`Workshop folder: ${workshopFolder}`);
      targetPath = isCurrentFolder ? workshopFile : workshopFolder;
      debug(`Target path: ${targetPath}`);
      isPathFolder = !isCurrentFolder;
    }

    const startPath = `/workshop/${path.basename(targetPath) + (isPathFolder ? '/' : '')}`;

    browserSync.init(
      {
        port,
        open,
        startPath,
        listen: host,
        ui: false,
        injectChanges: false,
        notify: false,
        ghostMode: false,
        ignore: ['node_modules'],
        files: [`${path.dirname(targetPath)}/**/*`],
        server: {
          baseDir: [path.join(__dirname, '../..', websitePath)],
          directory: true,
          routes: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '/workshops': path.dirname(targetPath)
          }
        },
        logLevel: options.verbose ? 'info' : 'silent',
        logPrefix: 'moaw',
        middleware: [
          (request, _response, next) => {
            if (request.url && /(^\/workshop\/.*)/.test(request.url)) {
              request.url = '/index.html';
            }

            next();
          }
        ]
      } as Options, // Typings are wrong
      (error, _bs) => {
        if (error) {
          throw error;
        }

        const codespace = process.env.CODESPACE_NAME;
        const url =
          host === 'localhost' && codespace
            ? `https://${codespace}-${port}.app.github.dev${startPath}`
            : `http://${host}:${port}${startPath}`;

        console.info(`Preview workshop at ${url}`);
        console.info(`Watching for changes...`);
      }
    );
  } catch (error: unknown) {
    const error_ = error as Error;
    console.error(error_.message);
    process.exitCode = 1;
  }
}
