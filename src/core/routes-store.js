// Хранилище конфигурации роутов (простая переменная-модуль)

import { createRouteWithLayout, extractGlobalSettings } from './layout-utils.js';
import { validateRoutes } from './route-validator.js';

let routes = {};
let globalSettings = {};

// Вспомогательные утилиты для групп
function isRouteConfig(value) {
  return value && typeof value === 'object' && value.component;
}

function isRouteGroup(entry) {
  return entry && typeof entry === 'object' && entry.routes && entry.prefix !== undefined;
}

function normalizePath(prefix, childPath) {
  if (childPath === '*') return '*';
  const pfx = prefix === '/' ? '' : (prefix || '');
  if (!childPath || childPath === '/') return (pfx || '/') || '/';
  const left = pfx.endsWith('/') ? pfx.slice(0, -1) : pfx;
  const right = childPath.startsWith('/') ? childPath : `/${childPath}`;
  const result = `${left}${right}`;
  return result || '/';
}

function composeBeforeEnter(handlers) {
  const fns = handlers.filter(Boolean);
  if (fns.length === 0) return undefined;
  return async (ctx) => {
    for (const fn of fns) {
      const res = await fn(ctx);
      if (res === false) return false;
    }
    return true;
  };
}

function composeAfterEnter(handlers) {
  const fns = handlers.filter(Boolean);
  if (fns.length === 0) return undefined;
  return async (ctx) => {
    for (const fn of fns) {
      try {
        await fn(ctx);
      } catch (e) {
        console.error('Error in afterEnter handler:', e);
      }
    }
  };
}

function flattenRoutesTree(node, accMeta, out, globalSettings = {}) {
  if (!node) return;

  // Если передали массив групп/нод
  if (Array.isArray(node)) {
    for (const child of node) flattenRoutesTree(child, accMeta, out, globalSettings);
    return;
  }

  // Если это RouteGroup
  if (isRouteGroup(node)) {
    const nextMeta = {
      prefix: normalizePath(accMeta.prefix, node.prefix || ''),
      middleware: [...(accMeta.middleware || []), ...(node.middleware || [])],
      befores: [...(accMeta.befores || []), ...(node.beforeEnter ? [node.beforeEnter] : [])],
      afters: [...(accMeta.afters || []), ...(node.afterEnter ? [node.afterEnter] : [])],
      layout: node.layout || accMeta.layout  // Передаем layout группы
    };
    flattenRoutesTree(node.routes, nextMeta, out, globalSettings);
    return;
  }

  // Иначе это объект с маршрутами
  for (const [path, value] of Object.entries(node)) {
    // Специальный ключ для вложенных групп: group или groups
    if (path === 'group' || path === 'groups') {
      flattenRoutesTree(value, accMeta, out, globalSettings);
      continue;
    }

    // '*' оставляем как есть, без префикса группы
    if (path === '*') {
      out['*'] = value;
      continue;
    }

    // Вложенная группа, заданная как значение с routes/prefix
    if (isRouteGroup(value)) {
      const nextMeta = {
        prefix: normalizePath(accMeta.prefix, value.prefix || ''),
        middleware: [...(accMeta.middleware || []), ...(value.middleware || [])],
        befores: [...(accMeta.befores || []), ...(value.beforeEnter ? [value.beforeEnter] : [])],
        afters: [...(accMeta.afters || []), ...(value.afterEnter ? [value.afterEnter] : [])],
        layout: value.layout || accMeta.layout  // Передаем layout группы
      };
      flattenRoutesTree(value.routes, nextMeta, out, globalSettings);
      continue;
    }

    // Обычный маршрут
    const finalPath = normalizePath(accMeta.prefix, path);
    if (isRouteConfig(value)) {
      const composedBefore = composeBeforeEnter([...(accMeta.befores || []), value.beforeEnter].filter(Boolean));
      const composedAfter = composeAfterEnter([...(accMeta.afters || []), value.afterEnter].filter(Boolean));
      
      // Создаем роут с layout информацией
      const routeWithLayout = createRouteWithLayout(value, accMeta, globalSettings);
      
      const merged = {
        ...routeWithLayout,
        middleware: [...(accMeta.middleware || []), ...(value.middleware || [])],
        beforeEnter: composedBefore,
        afterEnter: composedAfter
      };
      out[finalPath] = merged;
    } else {
      // Простой компонент или лоадер
      if ((accMeta.middleware && accMeta.middleware.length) || (accMeta.befores && accMeta.befores.length) || (accMeta.afters && accMeta.afters.length)) {
        // Создаем роут с layout информацией для простого компонента
        const routeWithLayout = createRouteWithLayout({ component: value }, accMeta, globalSettings);
        
        const merged = {
          ...routeWithLayout,
          middleware: [...(accMeta.middleware || [])],
          beforeEnter: composeBeforeEnter(accMeta.befores || []),
          afterEnter: composeAfterEnter(accMeta.afters || [])
        };
        out[finalPath] = merged;
      } else {
        // Создаем роут с layout информацией для простого компонента без middleware
        const routeWithLayout = createRouteWithLayout({ component: value }, accMeta, globalSettings);
        out[finalPath] = routeWithLayout;
      }
    }
  }
}

export function setRoutes(routesConfig, options = {}) {
  // Если нет групп — оставляем как было
  if (!routesConfig || typeof routesConfig !== 'object') {
    routes = routesConfig || {};
    return;
  }

  // Валидируем роуты перед установкой
  if (options.validate !== false) {
    const validation = validateRoutes(routesConfig, options.validator);
    
    if (!validation.isValid) {
      console.error('🚨 Route validation failed:', validation.conflicts);
      if (options.strict) {
        throw new Error(`Route validation failed: ${validation.conflicts.map(c => c.message).join(', ')}`);
      }
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Route validation warnings:', validation.warnings);
    }
    
    if (validation.conflicts.length > 0) {
      console.warn('⚠️ Route validation conflicts (non-strict mode):', validation.conflicts);
    }
  }

  // Извлекаем глобальные настройки
  globalSettings = extractGlobalSettings(routesConfig);
  
  const flattened = {};
  flattenRoutesTree(routesConfig, { 
    prefix: '', 
    middleware: [...(globalSettings.defaultMiddleware || [])], 
    befores: [...(globalSettings.defaultGuards?.beforeEnter ? [globalSettings.defaultGuards.beforeEnter] : [])], 
    afters: [...(globalSettings.defaultGuards?.afterEnter ? [globalSettings.defaultGuards.afterEnter] : [])], 
    layout: globalSettings.defaultLayout 
  }, flattened, globalSettings);
  routes = flattened;
}

export function getRoutes() {
  return routes;
}

export function getRoutesWithComponents() {
  return routes;
}

export function getAllRoutes() {
  return Object.keys(routes);
}

export function getGlobalSettings() {
  return globalSettings;
}


