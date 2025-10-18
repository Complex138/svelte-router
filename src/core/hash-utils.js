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
  return hash;
}

/**
 * Устанавливает путь в hash
 * @param {string} path
 */
export function setHashPath(path) {
  // Убираем существующий hash если есть
  const cleanPath = path.startsWith('#') ? path.substring(1) : path;
  window.location.hash = `#${cleanPath}`;
}

/**
 * Строит hash URL
 * @param {string} path
 * @param {object} queryParams
 * @returns {string}
 */
export function buildHashUrl(path, queryParams = {}) {
  let url = path.startsWith('/') ? `#${path}` : `/#${path}`;
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
