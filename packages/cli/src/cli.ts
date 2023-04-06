import process from 'node:process';
import debug from 'debug';
import updateNotifier, { Package } from 'update-notifier';
import minimist from 'minimist';
import { convert, createNew, serve } from './commands/index.js';
import { getPackageJson } from './util.js';

const help = `Usage: moaw <command> [options]

Commands:
  n, new <name>      Create a new workshop
  s, serve [<path>]  Preview workshop in target path (default: .)
    -p, --port       Port to listen on (default: 4444)
    -h, --host       Host address to bind to (default: localhost)
    -o, --open       Open in browser (default: false)
  c, convert <file>  Convert asciidoc to markdown
    -a, --attr <json_file>  Attributes to use for conversion
    -d, --dest <file>       Destination file (default: workshop.md)

General options:
  -v, --version      Show version
  --help             Show this help
`;

export async function run(args: string[]) {
  const options = minimist(args, {
    string: ['host', 'attr', 'dest'],
    boolean: ['verbose', 'version', 'help', 'open'],
    alias: {
      v: 'version',
      p: 'port',
      h: 'host',
      o: 'open',
      a: 'attr',
      d: 'dest'
    }
  });

  const pkg = await getPackageJson();
  updateNotifier({ pkg: pkg as Package }).notify();

  if (options.version) {
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

    case 'c':
    case 'convert': {
      await convert({
        file: parameters[0],
        attributes: options.attr as string,
        destination: options.dest as string,
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
