// Главный файл экспорта для svelte-router
export { createNavigation } from './Navigation.js';
export { 
  getRouteComponent, 
  routeExists, 
  getRouteParams, 
  getQueryParams, 
  getAllParams, 
  getRoutParams,
  linkTo,
  navigate,
  updateUrlStore,
  updateAdditionalProps,
  setRoutes,
  // Middleware exports
  registerMiddleware,
  registerGlobalMiddleware,
  executeMiddleware,
  executeGlobalMiddleware,
  createMiddlewareContext,
  getRouteMiddlewareByPath,
  getRouteBeforeEnterByPath,
  getRouteAfterEnterByPath,
  getRoutePatternByPath
} from './Router.js';
export { default as LinkTo } from './LinkTo.svelte';
export { default as RouterView } from './RouterView.svelte';

// Экспорт типов для TypeScript
export * from './types.d.ts';
