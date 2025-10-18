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
  createMiddlewareContext,
  linkTo,
  buildNavigationUrl,
  extractNavigationParams
} from './Router.js';
import { isLazyComponent, loadLazyComponent } from './core/resolve.js';
import { getRoutes } from './core/routes-store.js';
import { matchRoute, findBestRoute, extractRouteParams } from './core/route-pattern.js';
import { createSmartPrefetch } from './core/prefetch.js';
import { autoInitHtmlLinks } from './core/html-links.js';
import { 
  isHashMode, 
  getHashPath, 
  setHashPath, 
  buildHashUrl, 
  parseHashUrl, 
  initHashRouting 
} from './core/hash-utils.js';
import { setContext } from 'svelte';
import { writable } from 'svelte/store';

// ✅ Глобальная ссылка на правильный navigate (singleton pattern)
let globalNavigateFunction = null;

// Создаем объект для управления навигацией
export function createNavigation(routesConfig = {}, options = {}) {
  // Устанавливаем routes с валидацией
  setRoutes(routesConfig, options);
  
  // Определяем режим навигации
  const useHash = options.hash !== undefined ? options.hash : isHashMode();
  let currentPath = useHash ? getHashPath() : window.location.pathname;
  
  
  // Добавляем navigationId для предотвращения race conditions
  let navigationId = 0;

  // Создаем экземпляр умного prefetch для отслеживания навигации
  const smartPrefetch = createSmartPrefetch(10);

  // Создаем реактивный store с компонентом, props и состоянием загрузки
  const currentComponent = writable({
    component: null,
    props: {
      routeParams: getRouteParams(currentPath),
      queryParams: getQueryParams(),
      allParams: getAllParams(currentPath)
    },
    loading: true,
    error: null
  });

  // Асинхронная функция для загрузки начального компонента
  async function loadInitialComponent() {
    try {
      const routes = getRoutes();
      
      // Для hash mode используем путь из hash, для history - из pathname
      const pathToLoad = useHash ? getHashPath() : currentPath;
      
      
      // Используем route ranking для правильного выбора роута
      let routeValue = routes[pathToLoad];
      
      if (!routeValue) {
        const candidates = Object.entries(routes)
          .filter(([pattern]) => pattern !== '*')
          .map(([pattern, route]) => ({ pattern, route }));
        
        const bestRoute = findBestRoute(candidates, pathToLoad);
        routeValue = bestRoute?.route || routes['*'];
      }

      
      if (isLazyComponent(routeValue)) {
        const component = await loadLazyComponent(routeValue, pathToLoad);
        currentComponent.set({
          component,
          layout: routeValue.layout,
          props: {
            routeParams: getRouteParams(pathToLoad),
            queryParams: getQueryParams(),
            allParams: getAllParams(pathToLoad)
          },
          loading: false,
          error: null
        });
      } else {
        const component = getRouteComponent(pathToLoad);
        
        const routeParams = getRouteParams(pathToLoad);
        const queryParams = getQueryParams();
        const allParams = getAllParams(pathToLoad);
        
        
        currentComponent.set({
          component,
          layout: routeValue.layout,
          props: {
            routeParams,
            queryParams,
            allParams
          },
          loading: false,
          error: null
        });
      }
      
      // Обновляем currentPath для hash mode
      if (useHash) {
        currentPath = pathToLoad;
      }
    } catch (error) {
      console.error('Failed to load initial component:', error);
      currentComponent.set({
        component: null,
        props: {},
        loading: false,
        error: error.message || 'Failed to load component'
      });
    }
  }

  // Функция навигации с поддержкой middleware
  async function navigate(fullPath, additionalProps = {}) {
    // Извлекаем только путь без query string для проверки
    let pathOnly = fullPath.split('?')[0];
    
    // Для hash mode убираем # из пути
    if (useHash && pathOnly.startsWith('#')) {
      pathOnly = pathOnly.substring(1);
    }
    
    
    if (!routeExists(pathOnly)) {
      console.warn(`Route ${pathOnly} not found`);
      return;
    }

    // Увеличиваем navigationId для предотвращения race conditions
    const thisNavigationId = ++navigationId;
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

      // 5. Записываем навигацию для умного prefetch (до изменения URL)
      smartPrefetch.recordNavigation(fromPath, toPath);

      // 6. Устанавливаем состояние загрузки (но URL ещё НЕ меняем)
      currentComponent.update(state => ({
        ...state,
        loading: true,
        error: null
      }));

      // 7. ЗАГРУЖАЕМ КОМПОНЕНТ СНАЧАЛА
      try {
        const routes = getRoutes();
        
        // Используем route ranking для правильного выбора роута
        let routeValue = routes[toPath];
        if (!routeValue) {
          const candidates = Object.entries(routes)
            .filter(([pattern]) => pattern !== '*')
            .map(([pattern, route]) => ({ pattern, route }));
          
          const bestRoute = findBestRoute(candidates, toPath);
          routeValue = bestRoute?.route || routes['*'];
        }

        let component;
        if (isLazyComponent(routeValue)) {
          component = await loadLazyComponent(routeValue, toPath);
        } else {
          component = getRouteComponent(toPath);
        }

        // Проверяем что это всё еще актуальная навигация (предотвращаем race conditions)
        if (thisNavigationId !== navigationId) {
          console.log('Navigation cancelled - newer navigation started');
          return;
        }

        // 8. ТОЛЬКО СЕЙЧАС МЕНЯЕМ URL (когда компонент загружен)
        currentPath = toPath;
        
        if (useHash) {
          // Hash routing - используем только путь, не полный URL
          setHashPath(toPath);
        } else {
          // History API routing
          window.history.pushState({}, '', fullPath);
        }
        updateAdditionalProps(additionalProps);

        // Обновляем store с новыми props и загруженным компонентом
        currentComponent.set({
          component,
          layout: routeValue.layout,
          props: {
            routeParams: getRouteParams(currentPath),
            queryParams: getQueryParams(),
            allParams: getAllParams(currentPath),
            ...additionalProps // Добавляем дополнительные props
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to load component:', error);
        
        // ❌ Если ошибка - НЕ меняем URL!
        currentComponent.set({
          component: null,
          props: {},
          loading: false,
          error: error.message || 'Failed to load component'
        });
        
        try {
          await executeGlobalMiddleware('error', middlewareContext);
        } catch (errorHandlerError) {
          console.error('Error in error middleware:', errorHandlerError);
        }
        return;
      }

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
  const popstateHandler = async () => {
    const newPath = useHash ? getHashPath() : window.location.pathname;
    
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

      // Записываем навигацию для умного prefetch (до изменения currentPath)
      smartPrefetch.recordNavigation(fromPath, toPath);

      // Устанавливаем состояние загрузки (но currentPath ещё НЕ меняем)
      currentComponent.update(state => ({
        ...state,
        loading: true,
        error: null
      }));

      // ЗАГРУЖАЕМ КОМПОНЕНТ СНАЧАЛА
      try {
        const routes = getRoutes();
        
        // Используем route ranking для правильного выбора роута
        let routeValue = routes[toPath];
        if (!routeValue) {
          const candidates = Object.entries(routes)
            .filter(([pattern]) => pattern !== '*')
            .map(([pattern, route]) => ({ pattern, route }));
          
          const bestRoute = findBestRoute(candidates, toPath);
          routeValue = bestRoute?.route || routes['*'];
        }

        let component;
        if (isLazyComponent(routeValue)) {
          component = await loadLazyComponent(routeValue, toPath);
        } else {
          component = getRouteComponent(toPath);
        }

        // ТОЛЬКО СЕЙЧАС МЕНЯЕМ currentPath (когда компонент загружен)
        currentPath = toPath;

        currentComponent.set({
          component,
          layout: routeValue.layout,
          props: {
            routeParams: getRouteParams(currentPath),
            queryParams: getQueryParams(),
            allParams: getAllParams(currentPath)
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to load component on popstate:', error);
        
        // ❌ Если ошибка - НЕ меняем currentPath!
        currentComponent.set({
          component: null,
          props: {},
          loading: false,
          error: error.message || 'Failed to load component'
        });
        
        try {
          await executeGlobalMiddleware('error', middlewareContext);
        } catch (errorHandlerError) {
          console.error('Error in error middleware:', errorHandlerError);
        }
        return;
      }

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
  };

  // Добавляем listener для навигации
  let navigationCleanup;
  if (useHash) {
    // Hash routing
    navigationCleanup = initHashRouting(navigate);
  } else {
    // History API routing
    window.addEventListener('popstate', popstateHandler);
  }

  // ✅ Сохраняем глобальную ссылку на правильный navigate
  globalNavigateFunction = navigate;

  // Передаем функцию navigate через контекст
  setContext('navigate', navigate);
  
  // Загружаем начальный компонент ПОСЛЕ инициализации listeners
  loadInitialComponent();

  // Передаем smartPrefetch через контекст для использования в LinkTo
  setContext('smartPrefetch', smartPrefetch);

  // ✅ Автоматически инициализируем обработку HTML ссылок
  const htmlLinksCleanup = autoInitHtmlLinks({
    enabled: true,
    selector: 'a[href]',
    external: false,
    exclude: [
      'a[href^="http"]', 
      'a[href^="mailto:"]', 
      'a[href^="tel:"]', 
      'a[target="_blank"]',
      'a[download]',
      'a[href^="javascript:"]'
    ]
  });

  /**
   * Переключает режим роутинга (hash/history/auto)
   * @param {string} mode - 'hash', 'history', или 'auto'
   * @param {boolean} preserveUrl - сохранять ли текущий URL (по умолчанию true)
   */
  function switchRoutingMode(mode, preserveUrl = true) {
    let targetPath = '/';
    
    if (preserveUrl) {
      // Получаем текущий путь в зависимости от режима
      if (useHash) {
        targetPath = getHashPath();
      } else {
        targetPath = window.location.pathname;
      }
    }
    
    switch (mode) {
      case 'hash':
        if (!useHash) {
          // Переключаемся с history на hash
          window.location.href = window.location.origin + '#' + targetPath;
        }
        break;
        
      case 'history':
        if (useHash) {
          // Переключаемся с hash на history
          window.location.href = window.location.origin + targetPath;
        }
        break;
        
      case 'auto':
        // Автоматическое определение по текущему URL
        if (window.location.hash.startsWith('#/')) {
          // Уже в hash режиме, ничего не делаем
          return;
        } else {
          // Переключаемся в hash режим
          window.location.href = window.location.origin + '#' + targetPath;
        }
        break;
        
      default:
        console.warn(`Unknown routing mode: ${mode}`);
    }
  }

  // Создаем router instance
  const routerInstance = {
    ...currentComponent,
    switchRoutingMode,
    destroy: () => {
      if (useHash) {
        // Hash routing cleanup
        if (navigationCleanup) navigationCleanup();
      } else {
        // History API cleanup
        window.removeEventListener('popstate', popstateHandler);
      }
      if (htmlLinksCleanup) htmlLinksCleanup(); // ✅ Очищаем HTML ссылки
      globalNavigateFunction = null; // ✅ Очищаем глобальную ссылку
      globalRouterInstance = null; // ✅ Очищаем глобальную ссылку на router
    }
  };

  // Сохраняем глобальную ссылку на router
  globalRouterInstance = routerInstance;

  return routerInstance;
}

// ✅ ЭКСПОРТИРУЕМ navigate для использования везде!
export function navigate(routePattern, paramsOrConfig = {}, queryParams = {}, additionalProps = {}) {
  if (!globalNavigateFunction) {
    throw new Error('Router not initialized. Call createNavigation() in your root component first.');
  }
  
  // Парсим параметры (вся логика из Router.js)
  const { params, query, props } = extractNavigationParams(routePattern, paramsOrConfig, queryParams, additionalProps);
  
  // Строим URL и вызываем ПРАВИЛЬНЫЙ navigate
  const url = buildNavigationUrl(routePattern, params, query);
  globalNavigateFunction(url, props);
}

// ✅ ЭКСПОРТИРУЕМ функцию для получения навигатора
let globalRouterInstance = null;

export function getRouter() {
  if (!globalRouterInstance) {
    console.warn('Router not initialized. Call createNavigation() first.');
    return null;
  }
  return globalRouterInstance;
}
