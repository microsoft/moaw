import { parse } from 'yaml';

const frontMatterRegex = /^(?:---\r?\n([\s\S]+?)\r?\n---\r?\n)?([\s\S]*?)$/;

export type FrontMatterData = Partial<{
  description: string;
  authors: string;
  banner_url: string;
  video_url: string;
  duration_minutes: string;
  published: string;
  tags: string;
  wt_id: string;
  oc_id: string;
}>;

export interface FrontMatterParseResult {
  data: FrontMatterData;
  content: string;
}

export function parseFrontMatter(text: string): FrontMatterParseResult {
  const [, yaml, content] = text.match(frontMatterRegex) || [];
  if (!yaml) {
    return { data: {}, content: text };
  }
  return { data: parse(yaml), content }
}
