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

General options:
  -v, --version      Show version
  --help             Show this help
```
