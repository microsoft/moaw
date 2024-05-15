import { parse } from 'yaml';

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

export interface FrontMatterParseResult<ExtraProperties = {}> {
  meta: FrontMatterData & Partial<ExtraProperties>;
  markdown: string;
}

export function parseFrontMatter<E = {}>(text: string): FrontMatterParseResult<E> {
  const [, yaml, markdown] = text.match(frontMatterRegex) || [];
  if (!yaml) {
    return { meta: {}, markdown: text };
  }
  return { meta: parse(yaml), markdown };
}
