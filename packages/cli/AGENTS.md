# MOAW CLI (@moaw/cli)

Command line tool to create, preview and export workshops using the MOAW platform.

## Overview

- Package location: `packages/cli/`
- Build output: `packages/cli/lib/` (TypeScript compilation) and `packages/cli/dist/` (bundled assets copied in `postbuild`)
- Entry points:
  - Binary: `packages/cli/bin/moaw.js`
  - Exports: `packages/cli/lib/index.js`

## Key Technologies and Frameworks

- TypeScript (ESM, `moduleResolution: nodenext`)
- XO for linting (configured in `package.json`)
- `browser-sync` for local preview server
- `asciidoctor` for AsciiDoc conversion

## Development Workflow

Run from repo root (preferred):

- Build:

```bash
npm run build --workspace=@moaw/cli
```

- Watch build:

```bash
npm run build:watch --workspace=@moaw/cli
```

- Lint / tests (CLI uses XO; `test` runs `xo`):

```bash
npm test --workspace=@moaw/cli
# or
npm run lint --workspace=@moaw/cli
```

- Run the CLI locally:

```bash
npm run start --workspace=@moaw/cli
```

## Commands (user-facing)

From `packages/cli/README.md`:

- `moaw new <name>`
- `moaw serve [<path>]` (default port 4444)
- `moaw convert <file> -a <json_file>`
- `moaw build [<file>]`
- `moaw link [<file>]`
