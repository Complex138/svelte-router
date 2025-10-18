// Кеш загруженных компонентов для предотвращения повторной загрузки

const componentCache = new Map();
const MAX_CACHE_SIZE = 50; // Лимит на размер кеша для предотвращения утечек памяти

/**
 * Получить компонент из кеша
 * @param {string} routePath - Путь роута
 * @returns {Component|null} Кешированный компонент или null
 */
export function getCachedComponent(routePath) {
  const component = componentCache.get(routePath);
  if (component) {
    // Перемещаем в конец (обновляем время использования) - настоящий LRU
    componentCache.delete(routePath);
    componentCache.set(routePath, component);
  }
  return component || null;
}

/**
 * Сохранить компонент в кеш
 * @param {string} routePath - Путь роута
 * @param {Component} component - Загруженный компонент
 */
export function setCachedComponent(routePath, component) {
  // Если уже есть, удаляем старую запись
  if (componentCache.has(routePath)) {
    componentCache.delete(routePath);
  }
  
  componentCache.set(routePath, component);
  
  // Если превысили лимит, удаляем самый старый (первый в Map)
  if (componentCache.size > MAX_CACHE_SIZE) {
    const firstKey = componentCache.keys().next().value;
    componentCache.delete(firstKey);
  }
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
