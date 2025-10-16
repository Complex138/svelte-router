// Метаданные роутов: middleware и хуки
import { getRoutes } from '../core/routes-store.js';
import { matchRoute } from '../core/route-pattern.js';

function isRouteConfig(routeValue) {
  return routeValue && typeof routeValue === 'object' && routeValue.component;
}

function getRouteMiddleware(routeValue) {
  if (isRouteConfig(routeValue)) {
    return routeValue.middleware || [];
  }
  return [];
}

function getRouteBeforeEnter(routeValue) {
  if (isRouteConfig(routeValue)) {
    return routeValue.beforeEnter;
  }
  return null;
}

function getRouteAfterEnter(routeValue) {
  if (isRouteConfig(routeValue)) {
    return routeValue.afterEnter;
  }
  return null;
}

export function getRouteMiddlewareByPath(path) {
  const routes = getRoutes();
  if (routes[path]) {
    return getRouteMiddleware(routes[path]);
  }
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    if (aHasRegex && !bHasRegex) return -1;
    if (!aHasRegex && bHasRegex) return 1;
    return 0;
  });
  for (const [routePattern, routeValue] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return getRouteMiddleware(routeValue);
    }
  }
  return getRouteMiddleware(routes['*']);
}

export function getRouteBeforeEnterByPath(path) {
  const routes = getRoutes();
  if (routes[path]) {
    return getRouteBeforeEnter(routes[path]);
  }
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    if (aHasRegex && !bHasRegex) return -1;
    if (!aHasRegex && bHasRegex) return 1;
    return 0;
  });
  for (const [routePattern, routeValue] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return getRouteBeforeEnter(routeValue);
    }
  }
  return getRouteBeforeEnter(routes['*']);
}

export function getRouteAfterEnterByPath(path) {
  const routes = getRoutes();
  if (routes[path]) {
    return getRouteAfterEnter(routes[path]);
  }
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    if (aHasRegex && !bHasRegex) return -1;
    if (!aHasRegex && bHasRegex) return 1;
    return 0;
  });
  for (const [routePattern, routeValue] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return getRouteAfterEnter(routeValue);
    }
  }
  return getRouteAfterEnter(routes['*']);
}


