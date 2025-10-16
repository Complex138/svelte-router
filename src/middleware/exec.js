// Выполнение middleware
import { getMiddleware } from './registry.js';
import { globalMiddleware } from './global.js';

export async function executeMiddleware(middlewareList, context) {
  for (const middlewareItem of middlewareList) {
    let middlewareFunction;
    
    if (typeof middlewareItem === 'string') {
      middlewareFunction = getMiddleware(middlewareItem);
      if (!middlewareFunction) {
        console.warn(`Middleware "${middlewareItem}" not found`);
        continue;
      }
    } else if (middlewareItem && typeof middlewareItem === 'object' && middlewareItem.name) {
      middlewareFunction = getMiddleware(middlewareItem.name);
      if (!middlewareFunction) {
        console.warn(`Middleware "${middlewareItem.name}" not found`);
        continue;
      }
      context.middlewareOptions = middlewareItem.options;
    }
    
    if (middlewareFunction) {
      try {
        const result = await middlewareFunction(context);
        if (result === false) {
          return false;
        }
      } catch (error) {
        console.error(`Error in middleware:`, error);
        for (const errorMiddleware of globalMiddleware.error) {
          try {
            await errorMiddleware(error, context);
          } catch (errorHandlerError) {
            console.error(`Error in error middleware:`, errorHandlerError);
          }
        }
        return false;
      }
    }
  }
  return true;
}

export async function executeGlobalMiddleware(type, context) {
  const middlewareList = globalMiddleware[type] || [];
  return await executeMiddleware(middlewareList, context);
}

export function createMiddlewareContext(from, to, params, query, props, navigate, route) {
  return { from, to, params, query, props, navigate, route };
}


