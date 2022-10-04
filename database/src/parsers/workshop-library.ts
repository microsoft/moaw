import path from 'path';
import fetch from 'node-fetch';
import { ExternalEntry } from '../lib/external.js';
import { ExternalSourceParser } from '../lib/parser.js';

// Format of source index
// ----------------------
// | Level | Workshop Title  | Author(s)  | Duration   | What you will learn | Train-the-Trainer Video | Technologies taught, paired Microsoft Learn modules |
// 2️⃣ | [Build a Machine Learning Model using Custom Vision](./full/ml-model-custom-vision/README.md)|Christopher Harrison | 1 hour |  Use images to train a model to be able to perform inference to classify images | [🎥](https://youtu.be/YWTDxcHAfkA) | Python, Visual Studio Code, Git, [Object detection with Custom Vision](https://docs.microsoft.com/learn/modules/detect-objects-images-custom-vision/?WT.mc_id=academic-49102-chrhar), [Creating custom models with TensorFlow](https://docs.microsoft.com/learn/paths/tensorflow-fundamentals/?WT.mc_id=academic-49102-chrhar) |

const parseRegex = /^[^|\n](.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|?[^|\n]*?$/gm;
const linkRegex = /\[(.*?)\]\((.*?)\)/;
const durationRegex = /(\d+)(?:-\d+)? ?(hour|minute|min)s?/;

const indexUrl = 'https://raw.githubusercontent.com/microsoft/workshop-library/main/README.md';
const baseUrl = 'https://microsoft.github.io/workshop-library/';
const githubBaseUrl = 'https://github.com/microsoft/workshop-library/';

const parse: ExternalSourceParser = async function parse() {
  const sourceIndex = await getSourceIndex(indexUrl);
  const entries: ExternalEntry[] = [];
  let match;

  while ((match = parseRegex.exec(sourceIndex)) !== null) {
    const [, _level, workshopTitle, authors, duration, description, video, technologies] = match;
    const level = match[0].substring(0, 3); // emoji got garbled by the regex, not sure why
    const { title, url } = parseLink(workshopTitle);
    try {
      const [authorNames, authorContacts] = parseAuthors(authors);
  
      const entry: ExternalEntry = {
        type: 'workshop',
        title,
        description: description?.trim(),
        url: path.join(baseUrl, path.dirname(url)).replace('https:/,', 'https://'),
        github_url: path.join(githubBaseUrl, url).replace('https:/,', 'https://'),
        video_url: parseLinkOrUndefined(video)?.url,
        duration_minutes: parseDuration(duration),
        level: getLevel(level),
        tags: parseTags(technologies).join(','),
        authors: authorNames,
        contacts: authorContacts,
        language: 'en',
        // TODO: clone repo and get last commit date for each file!
        last_updated: '2020-01-01',
      };
  
      entries.push(entry);
  
      // TODO: find translations
    } catch (error: any) {
      console.error(`Error while parsing 'workshop-library' entry (title: ${title}): ${error?.message}`);
    }
  }

  console.log(`Found ${entries.length} workshop(s) in 'workshop-library'`);
  return entries;
};

export default parse;

async function getSourceIndex(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const text = await response.text();
    return text;
  } catch (error: any) {
    console.error(`Error while trying to fetch "${url}": ${error?.message}`);
    return '';
  }
}

function getLevel(str: string) {
  str = str.trim();
  switch (str) {
    case '2️⃣':
      return 'intermediate';
    case '3️⃣':
      return 'advanced';
    case '1️⃣':
    default:
      return 'beginner';
  }
}

function parseLink(str: string) {
  const match = str.match(linkRegex);
  if (match) {
    return { title: match[1]?.trim(), url: match[2]?.trim() };
  }
  throw new Error(`Failed to parse link from "${str}"`);
}

function parseLinkOrUndefined(str: string) {
  try {
    return parseLink(str);
  } catch (error) {
    return undefined;
  }
}

function parseDuration(str: string) {
  const match = str.match(durationRegex);
  if (match) {
    const [, amount, unit] = match;
    let duration = Number(amount);

    if (unit?.trim().startsWith('hour')) {
      duration *= 60;
    }

    return duration;
  }

  throw new Error(`Failed to parse link from "${str}"`);
}

function parseTags(str: string) {
  str = str.replace(/\[(.*?)\]\((.*?)\)/g, '');
  const tags = str.split(',').map((t) => {
    const title = parseLinkOrUndefined(t)?.title;
    return title ? /*title?.trim()*/ undefined : t?.trim();
  });
  return tags.filter((t) => Boolean(t));
}

function parseAuthors(str: string): [string[], string[]] {
  const authors = str
    .split(',')
    .flatMap((a) => a.split(' and '))
    .filter((a) => Boolean(a))
    .map((a) => {
      const link = parseLinkOrUndefined(a);
      return {
        name: link ? link.title?.trim() : a.trim(),
        url: link?.url?.trim()
      };
    });
  return [authors.map((a) => a.name), authors.map((a) => a.url || '')];
}
