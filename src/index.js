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

// Lazy loading utilities
export {
  isLazyComponent,
  loadLazyComponent
} from './core/resolve.js';
export {
  lazy,
  lazyRoute,
  preload,
  lazyGroup
} from './utils/lazy.js';

// Prefetch utilities
export {
  prefetchRoute,
  prefetchAll,
  prefetchOnIdle,
  prefetchWithDelay,
  createHoverPrefetch,
  createVisibilityPrefetch,
  prefetchRelated,
  createSmartPrefetch,
  prefetchWithNetworkAware
} from './core/prefetch.js';

// Component cache utilities
export {
  getCachedComponent,
  setCachedComponent,
  hasCachedComponent,
  clearComponentCache,
  removeCachedComponent,
  getCacheSize,
  getCachedPaths
} from './core/component-cache.js';

// Layout utilities
export {
  registerLayout,
  getLayout,
  hasLayout,
  getAllLayouts,
  clearLayouts,
  getLayoutNames,
  debugLayouts
} from './core/layout-registry.js';

export {
  resolveLayout,
  getLayoutComponent,
  needsLayout,
  extractGlobalSettings,
  createRouteWithLayout
} from './core/layout-utils.js';

// Экспорт типов для TypeScript
export * from './types.d.ts';
