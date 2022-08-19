import { parse } from 'yaml';

const frontMatterRegex = /^(?:---\r?\n([\s\S]+?)\r?\n---\r?\n)?([\s\S]*?)$/;

export interface FrontMatterParseResult {
  data: Record<string, any>;
  content: string;
}

export function parseFrontMatter(text: string): FrontMatterParseResult {
  const [, yaml, content] = text.match(frontMatterRegex) || [];
  if (!yaml) {
    return { data: {}, content: text };
  }
  return { data: parse(yaml), content }
}
