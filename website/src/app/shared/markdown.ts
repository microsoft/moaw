import { marked, Renderer } from 'marked';
import * as octicons from '@primer/octicons';

const slugger = new marked.Slugger();

export interface MarkdownHeading {
  text: string;
  level: number;
  url: string;
}

export const slugify = (text: string) => slugger.slug(text);

export function markedOptionsFactory() {
  const renderer = new Renderer();

  // renderer.blockquote = (text: string) => {
  //   return '<blockquote class="blockquote"><p>' + text + '</p></blockquote>';
  // };

  renderer.heading = (text, level, raw, slugger) => {
    const slug = slugger.slug(raw);
    const anchorLink = `<a class="heading-anchor" href="#${slug}" aria-hidden="true">#</a>`;
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
    renderer: renderer,
    smartLists: true
  };
}

export function getHeadings(markdown: string): MarkdownHeading[] {
  const parser = new marked.Parser(markedOptionsFactory());
  const domParser = new DOMParser();
  return marked
    .lexer(markdown)
    .filter((token: marked.Token): token is marked.Tokens.Heading => token.type === 'heading')
    .map((token) => {
      const html = parser.parseInline(token.tokens, parser.textRenderer as any);
      const text = domParser.parseFromString(html, 'text/html').body.textContent || '';
      return { text, level: token.depth, url: '#' + slugify(text) };
    });
}
