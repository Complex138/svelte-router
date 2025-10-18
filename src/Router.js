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
import { createSafeObject, filterDangerousKeys } from './core/safe-object.js';

export { setRoutes, updateUrlStore, getRouteComponent, routeExists, linkTo, getRoutesWithComponents, getAllRoutes };
export { registerMiddleware, registerGlobalMiddleware, executeMiddleware, executeGlobalMiddleware, createMiddlewareContext };
export { getRouteMiddlewareByPath, getRouteBeforeEnterByPath, getRouteAfterEnterByPath, getRoutePatternByPath };
export { getRoutParams, updateAdditionalProps };

export function getRouteParams(path) {
  const pattern = getRoutePatternByPath(path);
  if (pattern && pattern !== '*') {
    const params = parseParams(pattern, path);
    return createSafeObject(params); // ✅ Защита от prototype pollution
  }
  return createSafeObject(); // ✅ Безопасный пустой объект
}

export function getQueryParams() {
  const parsed = parseQueryParams(window.location.search);
  return createSafeObject(parsed); // ✅ Дополнительная защита
}

export function getAllParams(path) {
  const params = createSafeObject(); // ✅ Безопасный объект
  Object.assign(params, getRouteParams(path), getQueryParams());
  return params;
}

// Navigation utilities (без pushState)
export function buildNavigationUrl(routePattern, params = {}, queryParams = {}) {
  return linkTo(routePattern, params, queryParams);
}

export function extractNavigationParams(routePattern, paramsOrConfig = {}, queryParams = {}, additionalProps = {}) {
  let params, query, props;
  if (paramsOrConfig && typeof paramsOrConfig === 'object' && (paramsOrConfig.params || paramsOrConfig.queryParams || paramsOrConfig.props)) {
    params = paramsOrConfig.params || {};
    query = paramsOrConfig.queryParams || {};
    props = paramsOrConfig.props || {};
  } else if (paramsOrConfig && typeof paramsOrConfig === 'object' && !paramsOrConfig.params && !paramsOrConfig.queryParams && !paramsOrConfig.props) {
    // Auto-detection
    const routeParams = extractRouteParams(routePattern);
    params = {};
    query = {}; // ✅ Инициализируем query
    props = {};
    
    for (const [key, value] of Object.entries(paramsOrConfig)) {
      if (routeParams.includes(key)) {
        params[key] = value;
      } else {
        props[key] = value;
      }
    }
    
    if (queryParams) {
      Object.assign(query, queryParams);
    }
  } else {
    params = paramsOrConfig || {};
    query = queryParams || {};
    props = additionalProps || {};
  }
  
  return { params, query, props };
}

