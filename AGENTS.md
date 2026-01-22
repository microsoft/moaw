# The Mother Of All Workshops (MOAW)

MOAW is a repository of workshop content plus the tooling to create, preview, and publish workshops on the MOAW website.

## Overview

- This repo contains:
  - Workshop content in `workshops/` (Markdown + assets)
  - A website (Angular) in `packages/website/`
  - A CLI (TypeScript/Node ESM) in `packages/cli/`
  - A database generator that aggregates workshops into JSON in `packages/database/`
- The website consumes a generated JSON database of workshops.

### Project structure

- `workshops/`: Workshop folders, each typically containing `workshop.md` and an `assets/` folder.
- `template/workshop/`: Workshop template.
- `packages/website/`: Angular site (build output: `packages/website/dist/website`).
- `packages/database/`: Generates `packages/website/src/public/workshops.json`.
- `packages/cli/`: CLI to create/preview/build/link/convert workshops.

## Key Technologies and Frameworks

- Node.js + npm workspaces (`package.json` workspaces: `packages/*`)
- TypeScript (CLI + database)
- Angular (website)
- Lint/format tooling:
  - CLI: XO (with Prettier integration)
  - Website + database: Prettier
- GitHub Actions for CI, Pages deploy, and CLI release

## Constraints and Requirements

- Workshop format expectations (from `CONTRIBUTING.md`):
  - A workshop is a Markdown file named `workshop.md`.
  - Sections/pages can be separated with a blank-line delimited `---` block.
  - Workshop metadata is provided via front matter.
- Translations (from `CONTRIBUTING.md`):
  - Create a `translations/` folder next to the source file.
  - Naming: `<original_name>.<country_code>.<extension>` (example: `translations/workshop.fr.md`).
  - Localized assets go in `assets/translations/` (example: `assets/translations/image.fr.png`).
  - Update relative links/URLs in localized files.

## Development Workflow

### Install

Run from the repository root:

```bash
npm ci
```

### Common commands (repo root)

- Start dev server (website):

```bash
npm start
```

- Generate workshop database (writes `packages/website/src/public/workshops.json`):

```bash
npm run create:db
```

- Build website:

```bash
npm run build:website
```

- Build CLI:

```bash
npm run build:cli
```

- Format (runs `format` in each workspace if present):

```bash
npm run format
```

### Running a workshop locally

From `CONTRIBUTING.md`:

```bash
npm install
npm start
```

Then open:

- `http://localhost:4200/workshop/?src=<workshop_folder_name>/`

## Coding Guidelines

- Prefer running commands via npm workspaces from the repo root when possible (e.g. `npm run build --workspace=website`).
- Keep changes scoped:
  - Workshop content changes in `workshops/` should preserve front matter requirements.
  - Tooling changes should respect each package’s existing formatting/linting configuration.
- CLI package uses XO for linting/testing:

```bash
npm test --workspace=@moaw/cli
# or
npm run lint --workspace=@moaw/cli
```

## Debugging and Troubleshooting

- If the website is missing workshops locally, regenerate the database:

```bash
npm run create:db
```
