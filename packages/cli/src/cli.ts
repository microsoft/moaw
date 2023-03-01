import process from 'node:process';
import debug from 'debug';
import minimist from 'minimist';
import { createNew, serve } from './commands/index.js';
import { getPackageJson } from './util.js';

const help = `Usage: moaw <command> [options]

Commands:
  n, new <name>      Create a new workshop
  s, serve [<path>]  Preview workshop in target path (default: .)
    -p, --port       Port to listen on (default: 4444)
    -h, --host       Host address to bind to (default: localhost)
    -o, --open       Open in browser (default: false)

General options:
  -v, --version      Show version
  --help             Show this help
`;

export async function run(args: string[]) {
  const options = minimist(args, {
    string: ['host'],
    boolean: ['verbose', 'version', 'help', 'open'],
    alias: {
      v: 'version',
      p: 'port',
      h: 'host',
      o: 'open'
    }
  });

  if (options.version) {
    const pkg = await getPackageJson();
    console.info(pkg.version);
    return;
  }

  if (options.help) {
    console.info(help);
    return;
  }

  if (options.verbose) {
    debug.enable('*,-socket.io*,-engine*');
  }

  const [command, ...parameters] = options._;

  switch (command) {
    case 'n':
    case 'new': {
      await createNew({ name: parameters.join(' ') });
      break;
    }

    case 's':
    case 'serve': {
      await serve({
        path: parameters[0],
        port: Number(options.port),
        host: options.host as string,
        open: Boolean(options.open),
        verbose: Boolean(options.verbose)
      });
      break;
    }

    default: {
      if (command) {
        console.error(`Unknown command: ${command}`);
        process.exitCode = 1;
      }

      console.info(help);
    }
  }
}
