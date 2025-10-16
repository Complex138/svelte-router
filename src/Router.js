// Роутер — фасад, реэкспорт функций из модулей
import { getRoutes, setRoutes, getAllRoutes, getRoutesWithComponents } from './core/routes-store.js';
import { parseRoutePattern, parseParams, extractRouteParams } from './core/route-pattern.js';
import { parseQueryParams } from './core/query.js';
import { getRouteComponent, routeExists, getRoutePatternByPath } from './core/resolve.js';
import { linkTo } from './core/link.js';
import { urlStore, updateUrlStore } from './stores/url.js';
import { additionalPropsStore, updateAdditionalProps, getRoutParams } from './stores/additional-props.js';
import { registerMiddleware } from './middleware/registry.js';
import { registerGlobalMiddleware } from './middleware/global.js';
import { executeMiddleware, executeGlobalMiddleware, createMiddlewareContext } from './middleware/exec.js';
import { getRouteMiddlewareByPath, getRouteBeforeEnterByPath, getRouteAfterEnterByPath } from './middleware/route-meta.js';

export { setRoutes, updateUrlStore, getRouteComponent, routeExists, linkTo, getRoutesWithComponents, getAllRoutes };
export { registerMiddleware, registerGlobalMiddleware, executeMiddleware, executeGlobalMiddleware, createMiddlewareContext };
export { getRouteMiddlewareByPath, getRouteBeforeEnterByPath, getRouteAfterEnterByPath, getRoutePatternByPath };
export { getRoutParams, updateAdditionalProps };

export function getRouteParams(path) {
  const pattern = getRoutePatternByPath(path);
  if (pattern && pattern !== '*') {
    return parseParams(pattern, path);
  }
  return {};
}

export function getQueryParams() {
  return parseQueryParams(window.location.search);
}

export function getAllParams(path) {
  return {
    ...getRouteParams(path),
    ...getQueryParams()
  };
}

export function navigate(routePattern, paramsOrConfig = {}, queryParams = {}, additionalProps = {}) {
  let params, query, props;
  if (paramsOrConfig && typeof paramsOrConfig === 'object' && (paramsOrConfig.params || paramsOrConfig.queryParams || paramsOrConfig.props)) {
    params = paramsOrConfig.params || {};
    query = paramsOrConfig.queryParams || {};
    props = paramsOrConfig.props || {};
  } else if (paramsOrConfig && typeof paramsOrConfig === 'object' && !paramsOrConfig.params && !paramsOrConfig.queryParams && !paramsOrConfig.props) {
    const routeParams = extractRouteParams(routePattern);
    params = {};
    props = {};
    for (const [key, value] of Object.entries(paramsOrConfig)) {
      if (routeParams.includes(key)) {
        params[key] = value;
      } else {
        props[key] = value;
      }
    }
    query = queryParams || {};
  } else {
    params = paramsOrConfig || {};
    query = queryParams || {};
    props = additionalProps || {};
  }
  const url = linkTo(routePattern, params, query);
  const pathOnly = url.split('?')[0];
  if (routeExists(pathOnly)) {
    window.history.pushState({}, '', url);
    updateAdditionalProps(props);
    updateUrlStore();
    window.dispatchEvent(new PopStateEvent('popstate'));
  } else {
    console.warn(`Route ${pathOnly} not found`);
  }
}

