// Дополнительные props и derived параметры
import { writable, derived } from 'svelte/store';
import { urlStore } from './url.js';
import { parseQueryParams } from '../core/query.js';
import { getRoutes } from '../core/routes-store.js';
import { parseParams } from '../core/route-pattern.js';
import { routeExists, getRoutePatternByPath } from '../core/resolve.js';

export const additionalPropsStore = writable({});

export function updateAdditionalProps(props) {
  additionalPropsStore.set(props);
}

function getCurrentRouteParams() {
  const routes = getRoutes();
  const path = window.location.pathname;
  for (const routePattern of Object.keys(routes)) {
    if (routePattern !== '*' && routeExists(path)) {
      return parseParams(getRoutePatternByPath(path), path);
    }
  }
  return {};
}

export const getRoutParams = derived([urlStore, additionalPropsStore], ([urlData, additionalProps]) => {
  return {
    ...getCurrentRouteParams(),
    ...parseQueryParams(window.location.search),
    ...additionalProps
  };
});


