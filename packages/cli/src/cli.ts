import process from 'node:process';
import debug from 'debug';
import updateNotifier, { type Package } from 'update-notifier';
import minimist from 'minimist';
import { convert, createNew, link, serve, build } from './commands/index.js';
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
  b, build [<file>]  Build workshop and process file includes
    -d, --dest <file>       Destination file (default: <file>.build.md)
  l, link [<file>]   Get link to target file (default: workshop.md)
    -r, --repo       Set GitHub repo instead of fetching it from git
    -b, --branch <name>     Set branch name (default: current branch)

General options:
  -v, --version      Show version
  --help             Show this help
`;

export async function run(args: string[]) {
  const options = minimist(args, {
    string: ['host', 'attr', 'dest', 'repo', 'branch'],
    boolean: ['verbose', 'version', 'help', 'open'],
    alias: {
      v: 'version',
      p: 'port',
      h: 'host',
      o: 'open',
      a: 'attr',
      d: 'dest',
      r: 'repo',
      b: 'branch'
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

    case 'b':
    case 'build': {
      await build({
        file: parameters[0],
        destination: options.dest as string,
        verbose: Boolean(options.verbose)
      });
      break;
    }

    case 'l':
    case 'link': {
      await link({
        file: parameters[0],
        repo: options.repo as string,
        branch: options.branch as string
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
