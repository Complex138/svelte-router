/**
 * Утилиты для создания безопасных объектов (защита от prototype pollution)
 */

/**
 * Создает безопасный объект с защитой от prototype pollution
 * @param {Object} source - Исходный объект
 * @returns {Object} Безопасный объект
 */
export function createSafeObject(source = {}) {
  const safe = Object.create(null);
  Object.assign(safe, source);
  return safe;
}

/**
 * Фильтрует опасные ключи из объекта
 * @param {Object} obj - Исходный объект
 * @returns {Object} Безопасный объект без опасных ключей
 */
export function filterDangerousKeys(obj) {
  const safe = Object.create(null);
  
  for (const [key, value] of Object.entries(obj)) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      safe[key] = value;
    }
  }
  
  return safe;
}

/**
 * Создает безопасный объект из параметров URL
 * @param {Object} params - Параметры
 * @returns {Object} Безопасный объект параметров
 */
export function createSafeParams(params = {}) {
  return filterDangerousKeys(params);
}
