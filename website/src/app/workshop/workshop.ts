import { FileContents, LoaderOptions, loadFile } from '../shared/loader';
import { MarkdownHeading, getHeadings } from '../shared/markdown';

const sectionSeparator = '\n---\n';

export interface WorkshopSection {
  title: string;
  headings: MarkdownHeading[];
  markdown: string;
}

export interface Workshop extends FileContents {
  title: string;
  sections: WorkshopSection[];
  step: number;
}

export async function loadWorkshop(repoPath: string, options?: LoaderOptions): Promise<Workshop> {
  const fileContents = await loadFile(repoPath, options);
  console.log(fileContents.meta);
  const sections = fileContents.markdown
    .split(sectionSeparator)
    .map((markdown, index) => {
      const headings = getHeadings(markdown);
      const title = fileContents.meta.sections_title?.[index] ?? headings[0]?.text ?? ''
      return { title, headings, markdown };
    });
  return {
    ...fileContents,
    title: fileContents.meta.title ?? sections[0].title,
    sections,
    step: 0
  };
}
