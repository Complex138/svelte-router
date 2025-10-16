// Глобальные middleware списки

export const globalMiddleware = {
  before: [],
  after: [],
  error: []
};

export function registerGlobalMiddleware(type, middlewareFunction) {
  if (globalMiddleware[type]) {
    globalMiddleware[type].push(middlewareFunction);
  }
}


