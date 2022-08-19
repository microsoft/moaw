import { getFileUrl, getBaseUrl, getGitHubRepoUrl } from '../github';
import { parseFrontMatter } from '../frontmatter';

const sectionSeparator = '--sep--'; // '***'
const assetsFolder = 'assets/';

export interface Workshop {
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
  let { data, content: markdown } = parseFrontMatter(text);
  markdown = updateAssetsBasePath(markdown, getBaseUrl(gitHubFileUrl));
  markdown = updateTrackingCodes(markdown, options);
  
  return {
    githubUrl: getGitHubRepoUrl(gitHubFileUrl),
    sections: markdown.split(sectionSeparator),
    step: 0
  };
}

function updateAssetsBasePath(markdown: string, baseUrl: string): string {
  markdown = markdown.replace(new RegExp(assetsFolder, 'g'), `${baseUrl}/${assetsFolder}`);
  // TODO: remove
  markdown = markdown.replace(/media/g, `${baseUrl}/images`);

  return markdown;
}

function updateTrackingCodes(markdown: string, options?: WorkshopOptions): string {
  if (!options) {
    return markdown;
  }

  const { ocid, wtid } = options;

  // TODO: update and use cxa-track URL updating

  return markdown;
}
