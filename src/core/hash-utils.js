// Hash routing utilities

/**
 * Проверяет, используется ли hash routing
 * @returns {boolean}
 */
export function isHashMode() {
  return window.location.hash.startsWith('#/');
}

/**
 * Получает путь из hash
 * @returns {string}
 */
export function getHashPath() {
  const hash = window.location.hash.substring(1);
  // Если hash пустой или не начинается с /, возвращаем /
  if (!hash || !hash.startsWith('/')) {
    return '/';
  }
  // Убираем двойные слеши и хеши
  return hash.replace(/^#+/, '').replace(/\/+/g, '/');
}

/**
 * Устанавливает путь в hash
 * @param {string} path
 */
export function setHashPath(path) {
  // Убираем ВСЕ хеши и лишние слеши
  const cleanPath = path.replace(/^#+/, '').replace(/\/+/g, '/');
  window.location.hash = `#${cleanPath}`;
}

/**
 * Строит hash URL
 * @param {string} path
 * @param {object} queryParams
 * @returns {string}
 */
export function buildHashUrl(path, queryParams = {}) {
  // Убираем все хеши и лишние слеши
  const cleanPath = path.replace(/^#+/, '').replace(/\/+/g, '/');
  let url = cleanPath.startsWith('/') ? `#${cleanPath}` : `/#${cleanPath}`;
  if (Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams(queryParams);
    url += '?' + searchParams.toString();
  }
  return url;
}

/**
 * Парсит hash URL
 * @param {string} hash
 * @returns {object}
 */
export function parseHashUrl(hash) {
  const hashPath = hash.startsWith('#/') ? hash.substring(1) : hash;
  const [path, queryString] = hashPath.split('?');
  return { path: path || '/', queryString: queryString ? `?${queryString}` : '' };
}

/**
 * Слушает изменения hash
 * @param {function} callback
 * @returns {function} cleanup function
 */
export function listenToHashChanges(callback) {
  const handler = () => {
    callback(getHashPath());
  };
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}

/**
 * Инициализирует hash routing
 * @param {function} navigateFunction
 * @returns {function} cleanup function
 */
export function initHashRouting(navigateFunction) {
  const hashChangeHandler = () => {
    const newPath = getHashPath();
    navigateFunction(newPath);
  };
  window.addEventListener('hashchange', hashChangeHandler);
  return () => window.removeEventListener('hashchange', hashChangeHandler);
}
