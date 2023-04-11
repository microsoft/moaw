import process from 'node:process';
import { stringify, parse } from 'yaml';

// TODO: this file should be moved in a shared common package

const frontMatterRegex = /^(?:---\r?\n([\s\S]+?)\r?\n---\r?\n)?([\s\S]*?)$/;

export type FrontMatterData = Partial<{
  type: 'workshop' | 'deck' | 'page';
  deckType: 'reveal' | 'remark';
  title: string;
  short_title: string;
  sections_title: string[];
  description: string;
  authors: string | string[];
  contacts: string | string[];
  banner_url: string;
  video_url: string;
  duration_minutes: number;
  published: boolean;
  tags: string;
  links: Record<string, string>;
  wt_id: string;
  oc_id: string;
  audience: string;
  level: string;
}>;

export function createFrontmatter(metadata: FrontMatterData) {
  return `---\n${stringify(metadata, { lineWidth: 0 })}---\n`;
}

export function validateMetadata(metadata: FrontMatterData) {
  const errors: string[] = [];
  if (!metadata.title) {
    errors.push(`missing title`);
  }

  if (!metadata.description) {
    errors.push(`missing description`);
    process.exitCode = 1;
  }

  if (!metadata.level) {
    errors.push(`missing level`);
  }

  if (!metadata.duration_minutes) {
    errors.push(`missing duration_minutes`);
  }

  if (!metadata.authors || metadata.authors.length === 0) {
    errors.push(`missing authors`);
  }

  if (!metadata.contacts || metadata.contacts.length === 0) {
    errors.push(`missing contacts`);
  }

  if (metadata.contacts?.length !== metadata.authors?.length) {
    errors.push(`contacts and authors should have the same length`);
  }

  if (!metadata.tags || (Array.isArray(metadata.tags) && metadata.tags.length === 0)) {
    errors.push(`missing tags`);
  }

  return errors;
}

export type FrontMatterParseResult = {
  meta: FrontMatterData;
  markdown: string;
};

export function parseFrontMatter(text: string): FrontMatterParseResult {
  const [, yaml, markdown] = frontMatterRegex.exec(text) || [];
  if (!yaml) {
    return { meta: {}, markdown: text };
  }

  return { meta: parse(yaml) as FrontMatterData, markdown };
}
