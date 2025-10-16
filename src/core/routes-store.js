// Хранилище конфигурации роутов (простая переменная-модуль)

let routes = {};

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

function flattenRoutesTree(node, accMeta, out) {
  if (!node) return;

  // Если передали массив групп/нод
  if (Array.isArray(node)) {
    for (const child of node) flattenRoutesTree(child, accMeta, out);
    return;
  }

  // Если это RouteGroup
  if (isRouteGroup(node)) {
    const nextMeta = {
      prefix: normalizePath(accMeta.prefix, node.prefix || ''),
      middleware: [...(accMeta.middleware || []), ...(node.middleware || [])],
      befores: [...(accMeta.befores || []), ...(node.beforeEnter ? [node.beforeEnter] : [])],
      afters: [...(accMeta.afters || []), ...(node.afterEnter ? [node.afterEnter] : [])]
    };
    flattenRoutesTree(node.routes, nextMeta, out);
    return;
  }

  // Иначе это объект с маршрутами
  for (const [path, value] of Object.entries(node)) {
    // Специальный ключ для вложенных групп: group или groups
    if (path === 'group' || path === 'groups') {
      flattenRoutesTree(value, accMeta, out);
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
        afters: [...(accMeta.afters || []), ...(value.afterEnter ? [value.afterEnter] : [])]
      };
      flattenRoutesTree(value.routes, nextMeta, out);
      continue;
    }

    // Обычный маршрут
    const finalPath = normalizePath(accMeta.prefix, path);
    if (isRouteConfig(value)) {
      const composedBefore = composeBeforeEnter([...(accMeta.befores || []), value.beforeEnter].filter(Boolean));
      const composedAfter = composeAfterEnter([...(accMeta.afters || []), value.afterEnter].filter(Boolean));
      const merged = {
        component: value.component,
        middleware: [...(accMeta.middleware || []), ...(value.middleware || [])],
        beforeEnter: composedBefore,
        afterEnter: composedAfter
      };
      out[finalPath] = merged;
    } else {
      // Простой компонент или лоадер
      if ((accMeta.middleware && accMeta.middleware.length) || (accMeta.befores && accMeta.befores.length) || (accMeta.afters && accMeta.afters.length)) {
        const merged = {
          component: value,
          middleware: [...(accMeta.middleware || [])],
          beforeEnter: composeBeforeEnter(accMeta.befores || []),
          afterEnter: composeAfterEnter(accMeta.afters || [])
        };
        out[finalPath] = merged;
      } else {
        out[finalPath] = value;
      }
    }
  }
}

export function setRoutes(routesConfig) {
  // Если нет групп — оставляем как было
  if (!routesConfig || typeof routesConfig !== 'object') {
    routes = routesConfig || {};
    return;
  }

  const flattened = {};
  flattenRoutesTree(routesConfig, { prefix: '', middleware: [], befores: [], afters: [] }, flattened);
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


