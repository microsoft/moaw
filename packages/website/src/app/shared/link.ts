export interface Link {
  text: string;
  url: string;
  icon?: string;
}

export interface MenuLink extends Link {
  active: boolean;
  children?: MenuLink[];
  level: number;
}

export function createLinks(links: Record<string, string>): Link[] {
  return Object.entries(links).map(([text, url]) => ({ text, url }));
}

export function getCurrentUrlWithQueryParams(params: Record<string, any>, replace = false): string {
  const url = new URL(window.location.href);
  url.hash = '';

  if (replace) {
    url.search = new URLSearchParams(params).toString();
  } else {
    Object.entries(params).forEach((entry) => url.searchParams.set(...entry));
  }

  return url.href;
}
