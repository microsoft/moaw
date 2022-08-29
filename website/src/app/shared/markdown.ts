import { marked } from 'marked';
import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';

const slugger = new marked.Slugger();

export interface MarkdownHeading {
  text: string;
  level: number;
}

export const slugify = (text: string) => slugger.slug(text);

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  // renderer.blockquote = (text: string) => {
  //   return '<blockquote class="blockquote"><p>' + text + '</p></blockquote>';
  // };

  renderer.heading = (text, level, raw, slugger) => {
    console.log(text, level, raw, slugger);
    const slug = slugger.slug(raw);
    const anchorLink =`<a class="heading-anchor" href="#${slug}" aria-hidden="true">#</a>`;
    return `<h${level} id="${slug}" class="heading">${text} ${anchorLink}</h${level}>`;
  }

  return {
    renderer: renderer,
    smartLists: true,
  };
}

export function getHeadings(markdown: string): MarkdownHeading[] {
  return marked
    .lexer(markdown)
    .filter((token: marked.Token): token is marked.Tokens.Heading => token.type === 'heading')
    .map((token) => ({ text: token.text, level: token.depth }));
}
