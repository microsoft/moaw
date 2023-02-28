import { FileContents, LoaderOptions, loadFile } from '../shared/loader';

export interface Deck extends FileContents {
  slide: number;
}

export async function loadDeck(repoPath: string, options?: LoaderOptions): Promise<Deck> {
  const fileContents = await loadFile(repoPath, options);
  return {
    ...fileContents,
    slide: 0
  };
}
