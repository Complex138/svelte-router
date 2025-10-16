// Разрешение маршрутов и компонентов
import { getRoutes } from './routes-store.js';
import { matchRoute } from './route-pattern.js';

export function isRouteConfig(routeValue) {
  return routeValue && typeof routeValue === 'object' && routeValue.component;
}

export function getRouteComponentFromConfig(routeValue) {
  if (isRouteConfig(routeValue)) {
    return routeValue.component;
  }
  return routeValue;
}

// Проверяет, является ли значение lazy-загружаемым компонентом (функция, возвращающая Promise)
export function isLazyComponent(routeValue) {
  const component = isRouteConfig(routeValue) ? routeValue.component : routeValue;
  return typeof component === 'function' && !component.prototype;
}

// Асинхронная загрузка компонента
export async function loadLazyComponent(routeValue) {
  const component = isRouteConfig(routeValue) ? routeValue.component : routeValue;

  if (typeof component === 'function' && !component.prototype) {
    try {
      const module = await component();
      return module.default || module;
    } catch (error) {
      console.error('Failed to load lazy component:', error);
      throw error;
    }
  }

  return component;
}

export function getRouteComponent(path) {
  const routes = getRoutes();
  if (routes[path]) {
    return getRouteComponentFromConfig(routes[path]);
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
      return getRouteComponentFromConfig(routeValue);
    }
  }
  return getRouteComponentFromConfig(routes['*']);
}

export function routeExists(path) {
  const routes = getRoutes();
  if (routes.hasOwnProperty(path)) {
    return true;
  }
  for (const routePattern of Object.keys(routes)) {
    if (routePattern !== '*' && matchRoute(routePattern, path)) {
      return true;
    }
  }
  return routes.hasOwnProperty('*');
}

export function getRoutePatternByPath(path) {
  const routes = getRoutes();
  if (routes[path]) {
    return path;
  }
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    if (aHasRegex && !bHasRegex) return -1;
    if (!aHasRegex && bHasRegex) return 1;
    return 0;
  });
  for (const [routePattern] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return routePattern;
    }
  }
  return '*';
}


