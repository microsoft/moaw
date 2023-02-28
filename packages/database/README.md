# Workshops JSON database

This directory contains the code that generates a JSON database of all workshops.

The workshop content is aggregated for these sources:
- All workshops in the `workshops` directory marked with `published: true` in their front matter
- All external workshops listed in the `packages/database/external.yml` file

## Usage

To generate the JSON database, run:

```bash
npm ci 
npm run create:db
```

The JSON database will be generated in the `packages/website/src/public/workshops.json` file.
