// Утилита для ленивой загрузки компонентов

/**
 * Создает lazy-загружаемый компонент для роутера
 * @param {Function} importFn - Функция динамического импорта (например, () => import('./Component.svelte'))
 * @returns {Function} Функция, возвращающая Promise с компонентом
 *
 * @example
 * // В routes.js
 * import { lazy } from 'svelte-router-v5/utils/lazy';
 *
 * export const routes = {
 *   '/': lazy(() => import('./pages/Home.svelte')),
 *   '/about': lazy(() => import('./pages/About.svelte')),
 *   '/user/:id': lazy(() => import('./pages/User.svelte'))
 * };
 */
export function lazy(importFn) {
  return importFn;
}

/**
 * Создает lazy-загружаемый роут с middleware
 * @param {Function} importFn - Функция динамического импорта
 * @param {Object} config - Дополнительная конфигурация роута (middleware, beforeEnter, afterEnter)
 * @returns {Object} Объект конфигурации роута с lazy компонентом
 *
 * @example
 * import { lazyRoute } from 'svelte-router-v5/utils/lazy';
 *
 * export const routes = {
 *   '/profile': lazyRoute(() => import('./pages/Profile.svelte'), {
 *     middleware: ['auth'],
 *     beforeEnter: (context) => {
 *       console.log('Entering profile page');
 *       return true;
 *     }
 *   })
 * };
 */
export function lazyRoute(importFn, config = {}) {
  return {
    component: importFn,
    ...config
  };
}

/**
 * Предзагружает компонент для будущей навигации
 * @param {Function} importFn - Функция динамического импорта
 * @returns {Promise} Promise с загруженным компонентом
 *
 * @example
 * import { preload } from 'svelte-router-v5/utils/lazy';
 *
 * // Предзагрузка при наведении на ссылку
 * function handleMouseEnter() {
 *   preload(() => import('./pages/User.svelte'));
 * }
 */
export async function preload(importFn) {
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.error('Preload failed:', error);
    throw error;
  }
}

/**
 * Создает группу lazy-загружаемых роутов с общей конфигурацией
 * @param {Object} routes - Объект с роутами
 * @param {Object} sharedConfig - Общая конфигурация для всех роутов
 * @returns {Object} Объект с настроенными роутами
 *
 * @example
 * import { lazyGroup } from 'svelte-router-v5/utils/lazy';
 *
 * const adminRoutes = lazyGroup({
 *   '/admin': () => import('./pages/admin/Dashboard.svelte'),
 *   '/admin/users': () => import('./pages/admin/Users.svelte'),
 *   '/admin/settings': () => import('./pages/admin/Settings.svelte')
 * }, {
 *   middleware: ['auth', 'admin']
 * });
 */
export function lazyGroup(routes, sharedConfig = {}) {
  const result = {};
  for (const [path, importFn] of Object.entries(routes)) {
    result[path] = {
      component: importFn,
      ...sharedConfig
    };
  }
  return result;
}
