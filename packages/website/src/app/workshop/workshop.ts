import { getCurrentUrlWithQueryParams, MenuLink } from '../shared/link';
import { FileContents, LoaderOptions, loadFile } from '../shared/loader';
import { MarkdownHeading, getHeadings } from '../shared/markdown';

const sectionSeparator = '\n\n---\n\n';

export interface WorkshopSection {
  title: string;
  headings: MarkdownHeading[];
  markdown: string;
}

export interface Workshop extends FileContents {
  title: string;
  shortTitle?: string;
  sections: WorkshopSection[];
  step: number;
}

export async function loadWorkshop(repoPath: string, options?: LoaderOptions): Promise<Workshop> {
  const fileContents = await loadFile(repoPath, options);
  const sections = fileContents.markdown.split(sectionSeparator).map((markdown, index) => {
    const headings = getHeadings(markdown);
    const title = fileContents.meta.sections_title?.[index] ?? headings[0]?.text ?? '';
    return { title, headings, markdown };
  });
  return {
    ...fileContents,
    title: fileContents.meta.title ?? sections[0].title,
    shortTitle: fileContents.meta.short_title,
    sections,
    step: 0
  };
}

export function createMenuLinks(workshop: Workshop): MenuLink[] {
  return workshop.sections.map((section, index) => {
    const active = index === workshop.step;
    const children = section.headings
      .slice(1)
      .filter((heading) => heading.level === section.headings[0].level + 1)
      .map((heading) => ({
        active: false,
        text: heading.text,
        url: heading.url
      }));
    return {
      active,
      text: section.title,
      url: getCurrentUrlWithQueryParams({ step: index }),
      children
    };
  });
}
