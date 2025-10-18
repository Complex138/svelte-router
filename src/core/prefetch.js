// Система prefetch для предзагрузки компонентов

import { getRoutes } from './routes-store.js';
import { isLazyComponent, loadLazyComponent } from './resolve.js';
import { getCachedComponent, setCachedComponent, hasCachedComponent } from './component-cache.js';
import { matchRoute } from './route-pattern.js';

// Отслеживание состояния prefetch для каждого роута
const prefetchingRoutes = new Set();

/**
 * Найти роут по паттерну
 * @param {string} routePattern - Паттерн роута
 * @returns {any} Значение роута из конфигурации
 */
function findRouteValue(routePattern) {
  const routes = getRoutes();

  // Прямое совпадение
  if (routes[routePattern]) {
    return routes[routePattern];
  }

  // Поиск по паттернам
  for (const [pattern, routeValue] of Object.entries(routes)) {
    if (pattern === '*') continue;
    if (matchRoute(pattern, routePattern)) {
      return routeValue;
    }
  }

  return null;
}

/**
 * Prefetch компонента для роута
 * @param {string} routePattern - Паттерн роута для prefetch
 * @param {Object} options - Опции prefetch
 * @returns {Promise<Component|null>} Загруженный компонент или null
 */
export async function prefetchRoute(routePattern, options = {}) {
  const { force = false } = options;

  // Если уже в кеше и не force, возвращаем кешированный
  if (!force && hasCachedComponent(routePattern)) {
    return getCachedComponent(routePattern);
  }

  // Если уже загружается, пропускаем
  if (prefetchingRoutes.has(routePattern)) {
    return null;
  }

  try {
    prefetchingRoutes.add(routePattern);

    const routeValue = findRouteValue(routePattern);

    if (!routeValue) {
      console.warn(`Route ${routePattern} not found for prefetch`);
      return null;
    }

    // Если это lazy компонент, загружаем его
    if (isLazyComponent(routeValue)) {
      const component = await loadLazyComponent(routeValue);
      setCachedComponent(routePattern, component);
      return component;
    }

    // Если обычный компонент, просто кешируем его
    const component = routeValue.component || routeValue;
    setCachedComponent(routePattern, component);
    return component;

  } catch (error) {
    console.error(`Failed to prefetch route ${routePattern}:`, error);
    return null;
  } finally {
    prefetchingRoutes.delete(routePattern);
  }
}

/**
 * Prefetch всех роутов
 * @param {Object} options - Опции prefetch
 * @returns {Promise<void>}
 */
export async function prefetchAll(options = {}) {
  const { priority = [], exclude = [] } = options;
  const routes = getRoutes();
  const routePaths = Object.keys(routes).filter(path => path !== '*' && !exclude.includes(path));

  // Сначала загружаем приоритетные роуты
  for (const path of priority) {
    if (routePaths.includes(path)) {
      await prefetchRoute(path);
    }
  }

  // Затем загружаем остальные роуты параллельно
  const remainingPaths = routePaths.filter(path => !priority.includes(path));
  await Promise.allSettled(remainingPaths.map(path => prefetchRoute(path)));
}

/**
 * Prefetch роутов с использованием requestIdleCallback
 * @param {string[]} routePatterns - Массив паттернов роутов
 * @param {Object} options - Опции
 */
export function prefetchOnIdle(routePatterns, options = {}) {
  const { timeout = 2000 } = options;

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(
      async (deadline) => {
        for (const pattern of routePatterns) {
          if (deadline.timeRemaining() > 0 && !hasCachedComponent(pattern)) {
            await prefetchRoute(pattern);
          }
        }
      },
      { timeout }
    );
  } else {
    // Fallback для браузеров без requestIdleCallback
    setTimeout(() => {
      routePatterns.forEach(pattern => prefetchRoute(pattern));
    }, 100);
  }
}

/**
 * Prefetch с задержкой
 * @param {string} routePattern - Паттерн роута
 * @param {number} delay - Задержка в миллисекундах
 * @returns {number} ID таймера
 */
export function prefetchWithDelay(routePattern, delay = 300) {
  return setTimeout(() => {
    prefetchRoute(routePattern);
  }, delay);
}

/**
 * Prefetch при наведении мыши (с задержкой для предотвращения случайных наведений)
 * @param {string} routePattern - Паттерн роута
 * @param {number} hoverDelay - Задержка перед началом загрузки (ms)
 * @returns {Object} Объект с методами для управления prefetch
 */
export function createHoverPrefetch(routePattern, hoverDelay = 50) {
  let timeoutId = null;

  return {
    start: () => {
      if (timeoutId) return;
      timeoutId = prefetchWithDelay(routePattern, hoverDelay);
    },
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  };
}

/**
 * Создать Intersection Observer для prefetch видимых ссылок
 * @param {Object} options - Опции наблюдателя
 * @returns {IntersectionObserver}
 */
export function createVisibilityPrefetch(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    delay = 0
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const routePattern = entry.target.getAttribute('data-prefetch-route');
          if (routePattern) {
            if (delay > 0) {
              setTimeout(() => prefetchRoute(routePattern), delay);
            } else {
              prefetchRoute(routePattern);
            }
          }
        }
      });
    },
    {
      threshold,
      rootMargin
    }
  );

  return observer;
}

/**
 * Prefetch связанных роутов (например, следующей страницы в пагинации)
 * @param {string[]} routePatterns - Массив связанных роутов
 * @param {Object} options - Опции
 */
export async function prefetchRelated(routePatterns, options = {}) {
  const { parallel = true, delay = 0 } = options;

  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  if (parallel) {
    await Promise.allSettled(routePatterns.map(pattern => prefetchRoute(pattern)));
  } else {
    for (const pattern of routePatterns) {
      await prefetchRoute(pattern);
    }
  }
}

/**
 * Умный prefetch - анализирует историю навигации и предугадывает следующий роут
 * @param {number} historyLimit - Сколько последних переходов анализировать
 * @returns {Object} Объект для управления умным prefetch
 */
export function createSmartPrefetch(historyLimit = 10) {
  const navigationHistory = [];
  const patterns = new Map(); // Хранит частоту переходов между роутами
  const MAX_PATTERNS = 100; // Лимит на количество паттернов для предотвращения утечек памяти

  return {
    recordNavigation: (fromRoute, toRoute) => {
      navigationHistory.push({ from: fromRoute, to: toRoute, timestamp: Date.now() });

      if (navigationHistory.length > historyLimit) {
        navigationHistory.shift();
      }

      // Обновляем паттерны переходов
      const key = fromRoute;
      if (!patterns.has(key)) {
        patterns.set(key, new Map());
      }
      const transitions = patterns.get(key);
      transitions.set(toRoute, (transitions.get(toRoute) || 0) + 1);

      // Предотвращаем утечку памяти - удаляем старые паттерны
      if (patterns.size > MAX_PATTERNS) {
        const oldestKey = patterns.keys().next().value;
        patterns.delete(oldestKey);
      }
    },

    predictNext: (currentRoute) => {
      if (!patterns.has(currentRoute)) {
        return [];
      }

      const transitions = patterns.get(currentRoute);
      const sorted = Array.from(transitions.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([route]) => route);

      return sorted;
    },

    prefetchPredicted: async (currentRoute, topN = 2) => {
      const predicted = this.predictNext(currentRoute).slice(0, topN);
      if (predicted.length > 0) {
        await prefetchRelated(predicted, { parallel: true });
      }
    }
  };
}

/**
 * Prefetch на основе приоритета сети (Network Information API)
 * @param {string} routePattern - Паттерн роута
 * @returns {Promise<Component|null>}
 */
export async function prefetchWithNetworkAware(routePattern) {
  // Проверяем качество сети
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    // Не делаем prefetch на медленных соединениях
    if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      console.log(`Skipping prefetch for ${routePattern} due to slow network`);
      return null;
    }
  }

  return prefetchRoute(routePattern);
}
