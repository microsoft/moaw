import { getFileUrl, getBaseUrl, getGitHubRepoUrl } from '../github';
import { FrontMatterData, parseFrontMatter } from '../frontmatter';
import { updateTrackingCodeInText } from 'cxa-track/tracking';

const sectionSeparator = '\n---\n';
const assetsFolder = 'assets/';

export interface Workshop {
  meta: FrontMatterData;
  githubUrl: string;
  sections: string[];
  step: number;
}

export interface WorkshopOptions {
  ocid?: string;
  wtid?: string;
}

export async function loadWorkshop(repoPath: string, options?: WorkshopOptions): Promise<Workshop> {
  const gitHubFileUrl = getFileUrl(repoPath);
  const response = await fetch(gitHubFileUrl);

  if (response.status !== 200) {
    const error = `Cannot load workshop from ${gitHubFileUrl}`;
    console.error(error);
    throw new Error(error);
  }

  const text = await response.text();
  let { data: meta, content: markdown } = parseFrontMatter(text);
  markdown = updateAssetsBasePath(markdown, getBaseUrl(gitHubFileUrl));
  markdown = updateTrackingCodes(markdown, {
    wtid: meta.wt_id,
    ocid: meta?.oc_id,
    ...options,
  });
  
  return {
    meta,
    githubUrl: getGitHubRepoUrl(gitHubFileUrl),
    sections: markdown.split(sectionSeparator),
    step: 0
  };
}

function updateAssetsBasePath(markdown: string, baseUrl: string): string {
  return markdown.replace(new RegExp(assetsFolder, 'g'), `${baseUrl}/${assetsFolder}`);
}

function updateTrackingCodes(markdown: string, options?: WorkshopOptions): string {
  const { ocid, wtid } = options || {};
  if (wtid) {
    markdown = updateTrackingCodeInText(markdown, wtid, true, ocid ? { ocid } : undefined);
  }

  return markdown;
}
