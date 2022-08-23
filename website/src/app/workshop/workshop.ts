import { FileContents, LoaderOptions, loadFile } from '../shared/loader';

const sectionSeparator = '\n---\n';

export interface Workshop extends FileContents {
  sections: string[];
  step: number;
}

export async function loadWorkshop(repoPath: string, options?: LoaderOptions): Promise<Workshop> {
  const fileContents = await loadFile(repoPath, options);
  return {
    ...fileContents,
    sections: fileContents.markdown.split(sectionSeparator),
    step: 0
  };
}
