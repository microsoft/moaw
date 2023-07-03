import { EventDispatcher, EventListener } from './shared/event';
import { environment } from 'src/environments/environment';

export interface Route {
  path: string;
  id: string;
  redirect?: boolean;
  disabled?: boolean;
}

export type RouteChangeListener = EventListener<Route>;

export const Routes: Route[] = [
  { path: 'workshop/', id: 'workshop' },
  { path: 'deck/', id: 'deck' },
  { path: 'page/', id: 'page' },
  { path: 'catalog/', id: 'catalog' },
  { path: 'search/', id: 'search', disabled: environment.searchUrl === '' },
  { path: '', id: 'home', redirect: true }
];

const dispatcher = new EventDispatcher<Route>();
let basePath = '';
let currentRoute: Route | undefined;

function updateRoute() {
  const path = window.location.pathname;
  currentRoute = Routes.filter((r) => !r.disabled).find((r) => path.startsWith(basePath + r.path));

  if (!currentRoute || (currentRoute.redirect && path !== basePath + currentRoute.path)) {
    return navigate(currentRoute?.path ?? '', true);
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

  window.onpopstate = () => updateRoute();
  updateRoute();
}

export function getCurrentRoute() {
  return currentRoute;
}

export function getBasePath() {
  return basePath;
}

export function getCurrentUrlWithoutHash() {
  return location.href.split('#')[0];
}

export function navigate(path: string, replace = false) {
  if (path.startsWith('#')) {
    setHash(path);
    return;
  }

  const pushState = replace ? window.history.replaceState.bind(history) : window.history.pushState.bind(history);

  if (path.startsWith('http')) {
    pushState({}, path, path);
  } else {
    pushState({}, path, window.location.origin + basePath + path);
  }

  trackPageView();
  updateRoute();
}

export function setQueryParams(params: Record<string, any>, replace = false, addToHistory = true) {
  const url = new URL(window.location.href);
  if (replace) {
    url.search = new URLSearchParams(params).toString();
  } else {
    Object.entries(params).forEach(([name, value]) =>
      value == undefined ? url.searchParams.delete(name) : url.searchParams.set(name, value)
    );
  }
  if (addToHistory) {
    window.history.pushState({}, url.pathname, url);
  } else {
    window.history.replaceState({}, url.pathname, url);
  }
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

export function getPathAfterRoute() {
  const currentPath = decodeURIComponent(window.location.pathname);
  return currentPath.replace(basePath, '').split('/').slice(1).join('/');
}

export function redirectRoutePath(routePath: string, cleanUrl = false) {
  const url = new URL(cleanUrl ? window.location.origin : window.location.href);
  url.pathname = basePath + routePath + getPathAfterRoute();
  window.location.href = url.href;
}

export function trackPageView() {
  const gtag = (window as any).gtag || function () {};
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: location.href,
    page_path: location.pathname
  });
}
