// Хранилище конфигурации роутов (простая переменная-модуль)

let routes = {};

export function setRoutes(routesConfig) {
  routes = routesConfig;
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


