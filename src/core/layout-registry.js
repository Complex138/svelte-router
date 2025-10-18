// Реестр layout компонентов

const layoutRegistry = new Map();

/**
 * Регистрирует layout компонент
 * @param {string} name - Имя layout
 * @param {Component} component - Svelte компонент
 */
export function registerLayout(name, component) {
  layoutRegistry.set(name, component);
}

/**
 * Получает layout компонент по имени
 * @param {string} name - Имя layout
 * @returns {Component|null} Layout компонент или null
 */
export function getLayout(name) {
  const layout = layoutRegistry.get(name);
  
  if (!layout) {
    console.warn(`Layout "${name}" not found`);
    return null; // ✅ Явно возвращаем null
  }
  
  return layout;
}

/**
 * Проверяет, зарегистрирован ли layout
 * @param {string} name - Имя layout
 * @returns {boolean}
 */
export function hasLayout(name) {
  return layoutRegistry.has(name);
}

/**
 * Получает все зарегистрированные layout'ы
 * @returns {Map} Map с layout'ами
 */
export function getAllLayouts() {
  return new Map(layoutRegistry);
}

/**
 * Очищает реестр layout'ов
 */
export function clearLayouts() {
  layoutRegistry.clear();
}

/**
 * Получает список всех зарегистрированных layout'ов
 * @returns {string[]} Массив имен layout'ов
 */
export function getLayoutNames() {
  return Array.from(layoutRegistry.keys());
}

/**
 * Выводит информацию о зарегистрированных layout'ах
 */
export function debugLayouts() {
  console.log('📋 Registered Layouts:');
  for (const [name, component] of layoutRegistry) {
    console.log(`  - ${name}:`, component);
  }
}
