import { ContentEntry } from './content-entry';

export interface ContentFilter {
  search: string;
  tags: string[];
  language: string;
}

export function matchEntry(workshop: ContentEntry, filter: ContentFilter) {
  const search = filter.search.toLowerCase();
  const searchTooShort = search.length < 3;
  const matchTitle = searchTooShort || workshop.title.toLowerCase().includes(search);
  const matchDescription = searchTooShort || workshop.description.toLowerCase().includes(search);
  const matchTag = searchTooShort || workshop.tags.some((tag) => tag.toLowerCase().includes(search));
  const matchLanguage = filter.language === 'all' || workshop.language === filter.language;
  const matchTags = filter.tags.length === 0 || filter.tags.every((tag) => workshop.tags.includes(tag));

  return (matchTitle || matchDescription || matchTag) && matchLanguage && matchTags;
}
