# MOAW Website

Angular website for browsing and rendering workshops.

## Overview

- Package location: `packages/website/`
- Dev server: `http://localhost:4200/`
- Production build output: `packages/website/dist/website` (see `angular.json` outputPath)
- The build includes workshop content from `workshops/` (copied as assets by Angular build config).

## Key Technologies and Frameworks

- Angular (see dependencies in `package.json`). Only used for components, no other Angular packages are used
- SCSS styling
- Markdown rendering (`marked`, `ngx-markdown`)
- Prettier for formatting
- Rely on standard HTML and JS APIs for routing and HTTP requests (no Angular Router or HttpClient modules)

## Development Workflow

From repo root:

- Start dev server:

```bash
npm start
```

- Build:

```bash
npm run build:website
```

From this package directory:

- Start:

```bash
npm start
```

- Build:

```bash
npm run build
```

## Formatting

```bash
npm run format --workspace=website
```
