import { marked, Renderer, Tokens } from 'marked';
import GithubSlugger from 'github-slugger';
import * as octicons from '@primer/octicons';

export interface MarkdownHeading {
  text: string;
  level: number;
  url: string;
}

export function markedOptionsFactory() {
  const renderer = new Renderer();
  const slugger = new GithubSlugger();

  renderer.heading = (text, level, raw) => {
    const slug = slugger.slug(raw);
    const label = raw.replace(/"/g, '&quot;');
    const anchorLink = `<a class="heading-anchor" href="javascript:void(0)" onclick="window.location.hash = '${slug}'" aria-hidden="true" aria-label="${label}">#</a>`;
    return `<h${level} id="${slug}" class="heading">${text} ${anchorLink}</h${level}>`;
  };

  const originalLinkRender = renderer.link;
  renderer.link = (href, title, text) => {
    const link = originalLinkRender.bind(renderer)(href, title, text);
    if (href?.startsWith('http')) {
      const svg = octicons['link-external'].toSVG({ width: 14, class: 'external-link' });
      return link.replace(/^<a /, `<a target="_blank" `) + svg.replace(/<\/a>/, `${svg}</a>`);
    }
    return link;
  };

  return {
    hooks: {
      preprocess: (markdown: string) => {
        slugger.reset();
        return markdown;
      },
      postprocess: (html: string) => html
    },
    renderer: renderer
  };
}

export function getHeadings(markdown: string): MarkdownHeading[] {
  const slugger = new GithubSlugger();
  const parser = new marked.Parser(markedOptionsFactory());
  const domParser = new DOMParser();
  return marked
    .lexer(markdown)
    .filter((token): token is Tokens.Heading => token.type === 'heading')
    .map((token) => {
      const html = parser.parseInline(token.tokens, parser.textRenderer as any);
      const text = domParser.parseFromString(html, 'text/html').body.textContent || '';
      return { text, level: token.depth, url: '#' + slugger.slug(text) };
    });
}
