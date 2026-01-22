# MOAW Database Generator

Generates a JSON database aggregating workshop metadata/content for the website.

## Overview

- Package location: `packages/database/`
- Main output file: `packages/website/src/public/workshops.json`
- Sources (from `packages/database/README.md`):
  - Workshops in `workshops/` marked with `published: true` in front matter
  - External workshops listed in `packages/database/external.yml`

## Key Technologies and Frameworks

- TypeScript executed via `ts-node` (ESM loader)
- Uses `fast-glob`, `marked`, `yaml`, and `node-fetch`

## Development Workflow

From repo root:

- Generate database:

```bash
npm run create:db
```

From this package directory:

```bash
npm run create:db
```

## Formatting

- Prettier formatting:

```bash
npm run format --workspace=database
```

## Notes

- CI passes `GITHUB_REPO_URL` when running `npm run create:db` in the pull request and deploy workflows.
