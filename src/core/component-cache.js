// Кеш загруженных компонентов для предотвращения повторной загрузки

const componentCache = new Map();
const MAX_CACHE_SIZE = 50; // Лимит на размер кеша для предотвращения утечек памяти

/**
 * Получить компонент из кеша
 * @param {string} routePath - Путь роута
 * @returns {Component|null} Кешированный компонент или null
 */
export function getCachedComponent(routePath) {
  return componentCache.get(routePath) || null;
}

/**
 * Сохранить компонент в кеш
 * @param {string} routePath - Путь роута
 * @param {Component} component - Загруженный компонент
 */
export function setCachedComponent(routePath, component) {
  // LRU: если кеш переполнен, удаляем самый старый элемент
  if (componentCache.size >= MAX_CACHE_SIZE) {
    const firstKey = componentCache.keys().next().value;
    componentCache.delete(firstKey);
  }
  componentCache.set(routePath, component);
}

/**
 * Проверить, есть ли компонент в кеше
 * @param {string} routePath - Путь роута
 * @returns {boolean}
 */
export function hasCachedComponent(routePath) {
  return componentCache.has(routePath);
}

/**
 * Очистить весь кеш компонентов
 */
export function clearComponentCache() {
  componentCache.clear();
}

/**
 * Удалить конкретный компонент из кеша
 * @param {string} routePath - Путь роута
 */
export function removeCachedComponent(routePath) {
  componentCache.delete(routePath);
}

/**
 * Получить размер кеша
 * @returns {number}
 */
export function getCacheSize() {
  return componentCache.size;
}

/**
 * Получить все закешированные пути
 * @returns {string[]}
 */
export function getCachedPaths() {
  return Array.from(componentCache.keys());
}
