import { updateTrackingCodeInText } from 'cxa-track/tracking';
import { getFileUrl, getBaseUrl } from './github';
import { FrontMatterParseResult, parseFrontMatter } from './frontmatter';
import { getCurrentRoute, getPathAfterRoute, redirectRoutePath } from '../router';

const cdnUrl = 'https://cdn.jsdelivr.net/npm/';
const assetsFolder = 'assets/';
const defaultWtid = 'javascript-76678-cxa';
const defaultOcid = undefined;

export interface LoaderOptions {
  ocid?: string;
  wtid?: string;
  vars?: string;
}

export interface FileContents<E = {}> extends FrontMatterParseResult<E> {
  githubUrl: string;
}

export async function loadFile<E = {}>(
  repoPath: string,
  options?: LoaderOptions,
  redirectWrongType = true
): Promise<FileContents<E>> {
  const gitHubFileUrl = getFileUrl(repoPath);
  const response = await fetch(gitHubFileUrl);

  if (response.status !== 200) {
    const error = `Cannot load file from ${gitHubFileUrl}`;
    console.error(error);
    throw new Error(error);
  }

  let text = await response.text();
  text = replaceVariables(text, options?.vars);
  let { meta, markdown, ...extraProperties } = parseFrontMatter<E>(text);

  const currentRoute = getCurrentRoute();
  if (redirectWrongType && meta.type && meta.type !== currentRoute?.id) {
    console.warn(`Wrong document type, redirecting to "${meta.type}"...`);
    redirectRoutePath(meta.type + '/');
  }

  markdown = updateAssetsBasePath(markdown, getBaseUrl(gitHubFileUrl));
  markdown = updateTrackingCodes(markdown, {
    wtid: options?.wtid || meta?.wt_id,
    ocid: options?.ocid || meta?.oc_id
  });

  return {
    meta,
    markdown,
    githubUrl: gitHubFileUrl,
    ...extraProperties
  };
}

export function updateAssetsBasePath(markdown: string, baseUrl: string): string {
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 1);
  }

  // Match all occurrences of unescaped "assets/"
  const assetsRegex = new RegExp(`(?<!\\\\|\\\\\.\/)([.]?[.]\/)?${assetsFolder}`, 'gm');
  markdown = markdown.replace(assetsRegex, (_match, root) => `${baseUrl}/${root === '../' ? root : ''}${assetsFolder}`);

  // Match all occurrences of escaped "assets/"
  const escapedAssetsRegex = new RegExp(`\\\\(?:[.]?[.]\/)?${assetsFolder}`, 'gm');
  markdown = markdown.replace(escapedAssetsRegex, (match) => match.slice(1));

  return markdown;
}

export function updateTrackingCodes(markdown: string, options?: LoaderOptions): string {
  let { ocid, wtid } = options || {};
  wtid = wtid || defaultWtid;
  ocid = ocid || defaultOcid;
  markdown = updateTrackingCodeInText(markdown, wtid, true, ocid ? { ocid } : undefined);
  return markdown;
}

export async function loadScripts(scripts: string[]): Promise<void> {
  const promises = [];
  for (const src of scripts) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = cdnUrl + src;
    document.body.appendChild(script);
    promises.push(
      new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      })
    );
  }
  return Promise.all(promises).then(() => {});
}

export async function loadStyles(styles: string[]): Promise<void> {
  const promises = [];
  for (const src of styles) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = cdnUrl + src;
    document.head.appendChild(style);
    promises.push(
      new Promise((resolve, reject) => {
        style.onload = resolve;
        style.onerror = reject;
      })
    );
  }
  return Promise.all(promises).then(() => {});
}

export function injectCode(code: string): void {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = code;
  document.body.appendChild(script);
}

export function getRepoPath(source: string): string {
  return source ?? getPathAfterRoute();
}

export function replaceVariables(text: string, vars?: string) {
  if (vars) {
    const variables = vars
      .split(',')
      .map((variable) => {
        const decodedVariable = decodeURIComponent(variable);
        const [key, ...value] = decodedVariable.trim().split(':');
        return Boolean(key) ? [key, value.join(':')] : undefined;
      })
      .filter(Boolean) as [string, string][];

    for (const [key, value] of variables) {
      // Replace $$key$$ with value (but not \$$key$$)
      console.log(`Replacing $$${key}$$ with "${value}"`);
      text = text.replaceAll(new RegExp(`(?<!\\\\)\\$\\$${key}(:[^$\n]+?)?\\$\\$`, 'gm'), value);
    }
  }

  // Replace $$key:default_value$$ with default_value (but not \$$key:default_value$$)
  text = text.replaceAll(/(?<!\\)\$\$[^$\s]+:[^$\n]+?\$\$/gm, (match) => match.split(':')[1].slice(0, -2));

  // Replace escaped \$$key$$ with $$key$$
  text = text.replaceAll(/(\\\$\$[^$\n]+\$\$)/gm, (match) => match.slice(1));

  return text;
}
