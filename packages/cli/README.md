# @moaw/cli

[![NPM version](https://img.shields.io/npm/v/@moaw/cli.svg)](https://www.npmjs.com/package/@moaw/cli)
![Node version](https://img.shields.io/node/v/@moaw/cli.svg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Command line tool to create, preview and export workshops using [MOAW](https://aka.ms/moaw) platform.

## Installation

```bash
npm install -g @moaw/cli
```

### Usage

```
Usage: moaw <command> [options]

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
```

#### Asciidoc to Markdown conversion

[AsciiDoc](https://asciidoctor.org/docs/asciidoc-syntax-quick-reference/) is a markup language that can offer more advanced features than Markdown. However, it is not supported directly by MOAW. This command allows you to convert an AsciiDoc file to Markdown file that can be used with MOAW.

```bash
moaw convert my-workshop.adoc -a attributes.json
```

The `attributes.json` file is a JSON file that contains the [document attributes](https://docs.asciidoctor.org/asciidoc/latest/attributes/document-attributes/) to use for the conversion.

As MOAW requires specific [frontmatter metadata in the Markdown file](../../template/workshop/workshop.md?plain=1), you can define this metadata in the `attributes.json` file using the `meta` key. For example:

```json
{
  "meta": {
    "short_title": "My workshop",
    "description": "My workshop description",
    "tags": "tag1, tag2",
    "level": "beginner",
    "duration_minutes": 180,
    ...
  }
}
```

Note that not all AsciiDoc features are supported, and fall back to HTML generation will be used in that case. You can use the `--verbose` option to see if any unsupported feature is used.
