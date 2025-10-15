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
  setRoutes
} from './Router.js';
export { default as LinkTo } from './LinkTo.svelte';

// Экспорт типов для TypeScript
export * from './types.d.ts';
