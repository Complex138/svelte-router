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
  updateUrlStore,
  updateAdditionalProps
} from './Router.js';
export { default as LinkTo } from './LinkTo.svelte';
