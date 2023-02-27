import { ContentEntry } from './content-entry';

export interface ContentFilter {
  search: string;
  tags: string[];
  language: string;
}

export function matchEntry(workshop: ContentEntry, filter: ContentFilter) {
  const searchTooShort = filter.search.length < 3;
  const matchTitle = searchTooShort || workshop.title.toLowerCase().includes(filter.search);
  const matchDescription = searchTooShort || workshop.description.toLowerCase().includes(filter.search);
  const matchTag = searchTooShort || workshop.tags.some((tag) => tag.toLowerCase().includes(filter.search));
  const matchLanguage = workshop.language === filter.language;
  const matchTags = filter.tags.length === 0 || filter.tags.every((tag) => workshop.tags.includes(tag));

  return (matchTitle || matchDescription || matchTag) && matchLanguage && matchTags;
}
