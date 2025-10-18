// Shared IntersectionObserver для оптимизации prefetch
// Вместо создания 100+ observer'ов для каждой ссылки, используем один общий

let sharedObserver = null;
const observedElements = new Map();

/**
 * Наблюдать за элементом для prefetch
 * @param {HTMLElement} element - DOM элемент
 * @param {string} route - Роут для prefetch
 * @param {Function} callback - Функция обратного вызова
 * @returns {Function} Функция для отписки
 */
export function observeForPrefetch(element, route, callback) {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const data = observedElements.get(entry.target);
            if (data && data.callback) {
              data.callback();
            }
          }
        });
      },
      { 
        rootMargin: '50px', 
        threshold: 0.01 
      }
    );
  }
  
  // Сохраняем данные для элемента
  observedElements.set(element, { route, callback });
  sharedObserver.observe(element);
  
  // Возвращаем функцию для отписки
  return () => {
    observedElements.delete(element);
    sharedObserver.unobserve(element);
  };
}

/**
 * Очистить все наблюдения
 */
export function clearAllObservations() {
  if (sharedObserver) {
    sharedObserver.disconnect();
    sharedObserver = null;
  }
  observedElements.clear();
}

/**
 * Получить количество активных наблюдений
 * @returns {number}
 */
export function getActiveObservationsCount() {
  return observedElements.size;
}
