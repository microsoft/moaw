import { EventDispatcher, EventListener } from './shared/event';

export interface Route {
  path: string;
  id: string;
  redirect?: boolean;
}

export type RouteChangeListener = EventListener<Route>;

export const Routes: Route[] = [
  { path: 'workshop/', id: 'workshop' },
  { path: 'deck/', id: 'deck' },
  { path: 'page/', id: 'page' },
  { path: '', id: 'home', redirect: true }
];

const dispatcher = new EventDispatcher<Route>();
let basePath = '';
let currentRoute: Route | undefined;

function updateRoute() {
  const path = window.location.pathname;
  currentRoute = Routes.find((r) => path.startsWith(basePath + r.path));

  if (!currentRoute || (currentRoute.redirect && path.substring(1) !== currentRoute.path)) {
    return navigate(currentRoute?.path ?? '');
  }

  dispatcher.dispatch(currentRoute);
}

export function setupRouter() {
  // GitHub Pages workaround for SPA support
  const redirect = sessionStorage['redirect'];
  sessionStorage.removeItem('redirect');
  if (redirect && redirect !== location.href) {
    history.replaceState(null, redirect, redirect);
  }

  basePath = new URL(document.baseURI).pathname;
  // Once we know the base path, remove the <base> tag so that anchor links work
  document.querySelector('base')?.remove();

  window.onpopstate = () => updateRoute();
  updateRoute();
}

export function getCurrentRoute() {
  return currentRoute;
}

export function navigate(path: string) {
  if (path.startsWith('#')) {
    setHash(path);
    return;
  }

  if (path.startsWith('http')) {
    window.history.pushState({}, path, path);
  } else {
    window.history.pushState({}, path, window.location.origin + basePath + path);
  }
  updateRoute();
}

export function setQueryParams(params: Record<string, any>, replace = false) {
  const url = new URL(window.location.href);
  if (replace) {
    url.search = new URLSearchParams(params).toString();
  } else {
    Object.entries(params).forEach((entry) => url.searchParams.set(...entry));
  }
  window.history.pushState({}, url.pathname, url);
  updateRoute();
}

export function getQueryParams(): Record<string, string> {
  const url = new URL(window.location.href);
  return Object.fromEntries(url.searchParams.entries());
}

export function setHash(hash?: string) {
  const url = new URL(window.location.href);
  url.hash = hash ?? '';
  window.history.replaceState({}, url.pathname, url);
}

export function getHash(): string {
  return window.location.hash;
}

export function addRouteChangeListener(listener: RouteChangeListener) {
  dispatcher.addListener(listener);
  if (currentRoute) {
    dispatcher.dispatch(currentRoute);
  }
}

export function removeRouteChangeListener(listener: RouteChangeListener) {
  dispatcher.removeListener(listener);
}
