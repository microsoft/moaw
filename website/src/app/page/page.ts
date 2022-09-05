import { FileContents, LoaderOptions, loadFile } from '../shared/loader';
import { MarkdownHeading, getHeadings } from '../shared/markdown';

export interface Page extends FileContents {
  title: string;
  shortTitle?: string;
  headings: MarkdownHeading[];
}

export async function loadPage(repoPath: string, options?: LoaderOptions): Promise<Page> {
  const fileContents = await loadFile(repoPath, options);
  const headings = getHeadings(fileContents.markdown);
  return {
    ...fileContents,
    title: fileContents.meta.title ?? headings[0].text,
    shortTitle: fileContents.meta.short_title,
    headings
  };
}
