import { createInterface } from 'node:readline';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import fs from 'node:fs/promises';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function askForInput(question: string): Promise<string> {
  return new Promise((resolve, _reject) => {
    const read = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    read.question(question, (answer) => {
      read.close();
      resolve(answer);
    });
  });
}

export async function askForConfirmation(question: string): Promise<boolean> {
  const answer = await askForInput(`${question} [Y/n] `);
  return answer.toLowerCase() !== 'n';
}

export async function getPackageJson(): Promise<Record<string, any>> {
  return readJson(join(__dirname, '..', 'package.json'));
}

export async function isFolder(path: string) {
  try {
    const stat = await fs.lstat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function pathExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(path: string) {
  try {
    const contents = await fs.readFile(path, 'utf8');
    return JSON.parse(contents) as Record<string, any>;
  } catch {
    return {};
  }
}

export async function recursiveCopy(source: string, dest: string): Promise<void> {
  try {
    await fs.mkdir(dest, { recursive: true });
  } catch {
    // ignore if it exists
  }

  const sourceStat = await fs.lstat(source);
  if (sourceStat.isDirectory()) {
    const entries = await fs.readdir(source, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const sourcePath = join(source, entry.name);
        const destPath = join(dest, entry.name);
        return entry.isDirectory() ? recursiveCopy(sourcePath, destPath) : fs.copyFile(sourcePath, destPath);
      })
    );
  } else {
    await fs.copyFile(source, join(dest, basename(source)));
  }
}

export function escapeForHtml(unsafe?: string) {
  return (
    unsafe
      ?.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;') ?? ''
  );
}

export function unescapeHtml(html?: string) {
  return (
    html
      ?.replace(/&(amp|#38);/gi, '&')
      .replace(/&(lt|#60);/gi, '<')
      .replace(/&(gt|#62);/gi, '>')
      .replace(/&(quot|#34);/gi, '"')
      .replace(/&(apos|#39);/gi, "'")
      .replace(/&#(\d+);/gi, (_match, numberString) => {
        const number_ = Number.parseInt(numberString, 10);
        return String.fromCodePoint(number_);
      }) ?? ''
  );
}

export async function runCommand(command: string): Promise<string> {
  const result = await promisify(exec)(command);
  return result.stdout.toString();
}
