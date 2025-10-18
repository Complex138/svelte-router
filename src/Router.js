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
  // Используем Object.create(null) для защиты от prototype pollution
  const params = Object.create(null);
  Object.assign(params, getRouteParams(path), getQueryParams());
  return params;
}

export function navigate(routePattern, paramsOrConfig = {}, queryParams = {}, additionalProps = {}) {
  let params, query, props;
  if (paramsOrConfig && typeof paramsOrConfig === 'object' && (paramsOrConfig.params || paramsOrConfig.queryParams || paramsOrConfig.props)) {
    params = paramsOrConfig.params || {};
    query = paramsOrConfig.queryParams || {};
    props = paramsOrConfig.props || {};
  } else if (paramsOrConfig && typeof paramsOrConfig === 'object' && !paramsOrConfig.params && !paramsOrConfig.queryParams && !paramsOrConfig.props) {
    // Auto-detection: пытаемся угадать что params а что props
    const routeParams = extractRouteParams(routePattern);
    params = {};
    props = {};
    
    for (const [key, value] of Object.entries(paramsOrConfig)) {
      if (routeParams.includes(key)) {
        // Это параметр роута
        params[key] = value;
      } 
      // Если нет явного указания на query параметры, то они считаются props и не ебем мозги!
      // else if (typeof value === 'string' && value.startsWith('http')) {
      //   // Только URL - скорее всего query параметры
      //   query[key] = value;
      // } 
      else {
        // Остальное - дополнительные props
        props[key] = value;
      }
    }
    
    // Добавляем query параметры если они переданы отдельно
    if (queryParams) {
      Object.assign(query, queryParams);
    }
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
    // Убираем dispatchEvent - navigate() сам обновляет роутер
  } else {
    console.warn(`Route ${pathOnly} not found`);
  }
}

