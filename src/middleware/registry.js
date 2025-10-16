// Реестр middleware

const middlewareRegistry = {};

export function registerMiddleware(name, middlewareFunction) {
  middlewareRegistry[name] = middlewareFunction;
}

export function getMiddleware(name) {
  return middlewareRegistry[name];
}


