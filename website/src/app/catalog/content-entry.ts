export interface ContentEntry {
  title: string;
  description: string;
  tags: string[];
  url: string;
  authors: string[];
  duration: number | undefined;
  bannerUrl: string | undefined;
  lastUpdated: string;
}
