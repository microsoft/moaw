export type RouteChangeListener = (route: Route) => void;
export interface Route {
  path: string;
  id: string;
  redirect?: boolean;
}

export const Routes: Route[] = [
  { path: '/workshop/', id: 'workshop' },
  { path: '/slide/', id: 'slide' },
  { path: '/page/', id: 'page' },
  { path: '/', id: 'home', redirect: true }
];

let currentRoute: Route|undefined;
let routeChangeListener: (route: Route) => void = () => {};

function updateRoute() {
  const path = window.location.pathname;
  currentRoute = Routes.find(r => path.startsWith(r.path));

  if (!currentRoute || (currentRoute.redirect && path !== currentRoute.path)) {
    return navigate(currentRoute?.path ?? '/');
  }
  routeChangeListener(currentRoute);
}

export function setupRouter(listener?: (route: Route) => void) {
  routeChangeListener = listener || (() => {});
  window.onpopstate = () => updateRoute();
  updateRoute();
}

export function getCurrentRoute() {
  return currentRoute;
}

export function navigate(path: string) {
  window.history.pushState({}, path, window.location.origin + path);
  updateRoute();
}

export function setQueryParams(params: Record<string, string>) {
  const url = new URL(window.location.href);
  url.search = new URLSearchParams(params).toString();
  window.history.pushState({}, window.location.pathname, url);
  updateRoute();
}

export function getQueryParams(): Record<string, string> {
  const url = new URL(window.location.href);
  return Object.fromEntries(url.searchParams.entries());
}
