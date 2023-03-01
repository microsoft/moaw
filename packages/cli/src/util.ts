import { createInterface } from 'node:readline';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import fs from 'node:fs/promises';

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
  const file = await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8');
  const pkg = JSON.parse(file) as Record<string, any>;
  return pkg;
}

export async function pathExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
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
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(dest, entry.name);
        return entry.isDirectory() ? recursiveCopy(sourcePath, destPath) : fs.copyFile(sourcePath, destPath);
      })
    );
  } else {
    await fs.copyFile(source, path.join(dest, path.basename(source)));
  }
}
