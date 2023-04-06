import { getCurrentUrlWithQueryParams, MenuLink } from '../shared/link';
import { FileContents, LoaderOptions, loadFile } from '../shared/loader';
import { MarkdownHeading, getHeadings } from '../shared/markdown';

const sectionSeparator = /(?:\n\n|\r\n\r\n)---(?:\n\n|\r\n\r\n)/;

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
  const navigationLevels = (workshop.meta as any)?.navigation_levels ?? 2;
  return workshop.sections.map((section, index) => {
    const active = index === workshop.step;
    const baseLevel = section.headings[0].level;
    const allowedLevels = baseLevel + Math.max(navigationLevels - 1, 0);
    const children = section.headings
      .slice(1)
      .filter((heading) => heading.level <= allowedLevels)
      .map((heading) => ({
        active: false,
        text: heading.text,
        url: heading.url,
        level: heading.level - baseLevel
      }));
    return {
      active,
      text: section.title,
      url: getCurrentUrlWithQueryParams({ step: index }),
      children,
      level: 0
    };
  });
}
