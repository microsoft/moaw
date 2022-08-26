export type RouteChangeListener = (route: Route) => void;
export interface Route {
  path: string;
  id: string;
  redirect?: boolean;
}

export const Routes: Route[] = [
  { path: 'workshop/', id: 'workshop' },
  { path: 'deck/', id: 'deck' },
  { path: 'page/', id: 'page' },
  { path: '', id: 'home', redirect: true }
];

let basePath = '';
let currentRoute: Route | undefined;
let routeChangeListener: (route: Route) => void = () => {};

function updateRoute() {
  const path = window.location.pathname;
  currentRoute = Routes.find((r) => path.startsWith(basePath + r.path));

  if (!currentRoute || (currentRoute.redirect && path !== currentRoute.path)) {
    return navigate(currentRoute?.path ?? '');
  }
  routeChangeListener(currentRoute);
}

export function setupRouter(listener?: (route: Route) => void) {
  basePath = new URL(document.baseURI).pathname;
  routeChangeListener = listener || (() => {});
  window.onpopstate = () => updateRoute();
  updateRoute();
}

export function getCurrentRoute() {
  return currentRoute;
}

export function navigate(path: string) {
  window.history.pushState({}, path, window.location.origin + basePath + path);
  updateRoute();
}

export function setQueryParams(params: Record<string, any>, replace = false) {
  const url = new URL(window.location.href);
  if (replace) {
    url.search = new URLSearchParams(params).toString();
  } else {
    Object.entries(params).forEach((entry) => url.searchParams.set(...entry));
  }
  window.history.pushState({}, window.location.pathname, url);
  updateRoute();
}

export function getQueryParams(): Record<string, string> {
  const url = new URL(window.location.href);
  return Object.fromEntries(url.searchParams.entries());
}
