import { marked } from 'marked';
import { markedOptionsFactory } from '../../../website/src/app/shared/markdown.js';

export function getFirstHeading(markdown: string): string | undefined {
  let firstHeading;
  try {
    const options = markedOptionsFactory();
    options.renderer.heading = (_text, _level, raw) => {
      firstHeading = raw;
      throw new Error(); // Quiclky exit parser
    };
    marked(markdown, options);
  } catch {}
  return firstHeading;
}
