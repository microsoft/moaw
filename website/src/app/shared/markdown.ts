import { marked } from 'marked';
import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';

export interface MarkdownHeading {
  text: string;
  level: number;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  // renderer.blockquote = (text: string) => {
  //   return '<blockquote class="blockquote"><p>' + text + '</p></blockquote>';
  // };

  return {
    renderer: renderer,
    smartLists: true
  };
}

export function getHeadings(markdown: string): MarkdownHeading[] {
  return marked
    .lexer(markdown)
    .filter((token: marked.Token): token is marked.Tokens.Heading => token.type === 'heading')
    .map((token) => ({ text: token.text, level: token.depth }));
}
