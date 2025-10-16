// Логика навигации
import { 
  routeExists, 
  getRouteComponent, 
  getRouteParams, 
  getQueryParams, 
  getAllParams, 
  updateUrlStore, 
  updateAdditionalProps, 
  setRoutes,
  getRouteMiddlewareByPath,
  getRouteBeforeEnterByPath,
  getRouteAfterEnterByPath,
  getRoutePatternByPath,
  executeMiddleware,
  executeGlobalMiddleware,
  createMiddlewareContext
} from './Router.js';
import { setContext } from 'svelte';
import { writable } from 'svelte/store';

// Создаем объект для управления навигацией
export function createNavigation(routesConfig = {}) {
  // Устанавливаем routes
  setRoutes(routesConfig);
  let currentPath = window.location.pathname;
  
  // Создаем реактивный store с компонентом и props
  const currentComponent = writable({
    component: getRouteComponent(currentPath),
    props: {
      routeParams: getRouteParams(currentPath),
      queryParams: getQueryParams(),
      allParams: getAllParams(currentPath)
    }
  });

  // Функция навигации с поддержкой middleware
  async function navigate(fullPath, additionalProps = {}) {
    // Извлекаем только путь без query string для проверки
    const pathOnly = fullPath.split('?')[0];
    
    if (!routeExists(pathOnly)) {
      console.warn(`Route ${pathOnly} not found`);
      return;
    }

    const fromPath = currentPath;
    const toPath = pathOnly;
    const routeParams = getRouteParams(toPath);
    const queryParams = getQueryParams();
    const routePattern = getRoutePatternByPath(toPath);

    // Создаем контекст для middleware
    const middlewareContext = createMiddlewareContext(
      fromPath,
      toPath,
      routeParams,
      queryParams,
      additionalProps,
      navigate,
      routePattern
    );

    try {
      // 1. Выполняем глобальные before middleware
      const globalBeforeResult = await executeGlobalMiddleware('before', middlewareContext);
      if (!globalBeforeResult) {
        console.log('Navigation blocked by global before middleware');
        return;
      }

      // 2. Получаем middleware роута
      const routeMiddleware = getRouteMiddlewareByPath(toPath);
      const beforeEnter = getRouteBeforeEnterByPath(toPath);

      // 3. Выполняем middleware роута
      if (routeMiddleware.length > 0) {
        const routeMiddlewareResult = await executeMiddleware(routeMiddleware, middlewareContext);
        if (!routeMiddlewareResult) {
          console.log('Navigation blocked by route middleware');
          return;
        }
      }

      // 4. Выполняем beforeEnter
      if (beforeEnter) {
        const beforeEnterResult = await beforeEnter(middlewareContext);
        if (beforeEnterResult === false) {
          console.log('Navigation blocked by beforeEnter');
          return;
        }
      }

      // 5. Если все middleware прошли успешно, выполняем навигацию
      currentPath = toPath;
      window.history.pushState({}, '', fullPath);
      
      // Обновляем дополнительные props
      updateAdditionalProps(additionalProps);
      
      // Обновляем store с новыми props
      currentComponent.set({
        component: getRouteComponent(currentPath),
        props: {
          routeParams: getRouteParams(currentPath),
          queryParams: getQueryParams(),
          allParams: getAllParams(currentPath),
          ...additionalProps // Добавляем дополнительные props
        }
      });
      
      // Обновляем URL store
      updateUrlStore();

      // 6. Выполняем after middleware
      const afterEnter = getRouteAfterEnterByPath(toPath);
      if (afterEnter) {
        try {
          await afterEnter(middlewareContext);
        } catch (error) {
          console.error('Error in afterEnter:', error);
        }
      }

      // 7. Выполняем глобальные after middleware
      try {
        await executeGlobalMiddleware('after', middlewareContext);
      } catch (error) {
        console.error('Error in global after middleware:', error);
      }

    } catch (error) {
      console.error('Navigation error:', error);
      // Выполняем error middleware
      try {
        await executeGlobalMiddleware('error', middlewareContext);
      } catch (errorHandlerError) {
        console.error('Error in error middleware:', errorHandlerError);
      }
    }
  }

  // Обработка кнопок браузера с поддержкой middleware
  window.addEventListener('popstate', async () => {
    const newPath = window.location.pathname;
    
    if (!routeExists(newPath)) {
      console.warn(`Route ${newPath} not found`);
      return;
    }

    const fromPath = currentPath;
    const toPath = newPath;
    const routeParams = getRouteParams(toPath);
    const queryParams = getQueryParams();
    const routePattern = getRoutePatternByPath(toPath);

    // Создаем контекст для middleware
    const middlewareContext = createMiddlewareContext(
      fromPath,
      toPath,
      routeParams,
      queryParams,
      {},
      navigate,
      routePattern
    );

    try {
      // Выполняем middleware для popstate (только before, без after)
      const globalBeforeResult = await executeGlobalMiddleware('before', middlewareContext);
      if (!globalBeforeResult) {
        console.log('Popstate navigation blocked by global before middleware');
        return;
      }

      const routeMiddleware = getRouteMiddlewareByPath(toPath);
      const beforeEnter = getRouteBeforeEnterByPath(toPath);

      if (routeMiddleware.length > 0) {
        const routeMiddlewareResult = await executeMiddleware(routeMiddleware, middlewareContext);
        if (!routeMiddlewareResult) {
          console.log('Popstate navigation blocked by route middleware');
          return;
        }
      }

      if (beforeEnter) {
        const beforeEnterResult = await beforeEnter(middlewareContext);
        if (beforeEnterResult === false) {
          console.log('Popstate navigation blocked by beforeEnter');
          return;
        }
      }

      // Если все middleware прошли успешно, выполняем навигацию
      currentPath = toPath;
      currentComponent.set({
        component: getRouteComponent(currentPath),
        props: {
          routeParams: getRouteParams(currentPath),
          queryParams: getQueryParams(),
          allParams: getAllParams(currentPath)
        }
      });
      
      // Обновляем URL store
      updateUrlStore();

    } catch (error) {
      console.error('Popstate navigation error:', error);
      // Выполняем error middleware
      try {
        await executeGlobalMiddleware('error', middlewareContext);
      } catch (errorHandlerError) {
        console.error('Error in error middleware:', errorHandlerError);
      }
    }
  });


  // Передаем функцию navigate через контекст
  setContext('navigate', navigate);

  // Возвращаем store напрямую
  return currentComponent;
}
