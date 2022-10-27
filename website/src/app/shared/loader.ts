import { updateTrackingCodeInText } from 'cxa-track/tracking';
import { getFileUrl, getBaseUrl } from '../shared/github';
import { FrontMatterParseResult, parseFrontMatter } from '../shared/frontmatter';
import { getCurrentRoute, getPathAfterRoute, redirectRoutePath } from '../router';

const cdnUrl = 'https://cdn.jsdelivr.net/npm/';
const assetsFolder = 'assets/';
const defaultWtid = 'javascript-76678-cxa';
const defaultOcid = 'AID3051475';

export interface LoaderOptions {
  ocid?: string;
  wtid?: string;
}

export interface FileContents extends FrontMatterParseResult {
  githubUrl: string;
}

export async function loadFile(
  repoPath: string,
  options?: LoaderOptions,
  redirectWrongType = true
): Promise<FileContents> {
  const gitHubFileUrl = getFileUrl(repoPath);
  const response = await fetch(gitHubFileUrl);

  if (response.status !== 200) {
    const error = `Cannot load file from ${gitHubFileUrl}`;
    console.error(error);
    throw new Error(error);
  }

  const text = await response.text();
  let { meta, markdown } = parseFrontMatter(text);

  const currentRoute = getCurrentRoute();
  if (redirectWrongType && meta.type && meta.type !== currentRoute?.id) {
    console.warn(`Wrong document type, redirecting to "${meta.type}"...`);
    redirectRoutePath(meta.type + '/');
  }

  markdown = updateAssetsBasePath(markdown, getBaseUrl(gitHubFileUrl));
  markdown = updateTrackingCodes(markdown, {
    wtid: meta.wt_id,
    ocid: meta?.oc_id,
    ...options
  });

  return {
    meta,
    markdown,
    githubUrl: gitHubFileUrl
  };
}

export function updateAssetsBasePath(markdown: string, baseUrl: string): string {
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 1);
  }

  // Match all occurrences of "assets/" within links and not within a code block
  const assetsRegex = new RegExp(`[()](?:\./)?${assetsFolder}(?=[^\`]*(?:\`[^\`]*\`[^\`]*)*$)`, 'g');

  return markdown.replace(assetsRegex, `(${baseUrl}/${assetsFolder}`);
}

export function updateTrackingCodes(markdown: string, options?: LoaderOptions): string {
  let { ocid, wtid } = options || {};
  wtid = wtid || defaultWtid;
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
