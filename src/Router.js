// Роутер - логика навигации
import { writable, derived } from 'svelte/store';

// Routes будут переданы через createNavigation
let routes = {};

// Функция для установки routes
export function setRoutes(routesConfig) {
  routes = routesConfig;
}

// Создаем реактивный store для URL
const urlStore = writable({
  pathname: window.location.pathname,
  search: window.location.search
});

// Функция для обновления URL store
export function updateUrlStore() {
  urlStore.set({
    pathname: window.location.pathname,
    search: window.location.search
  });
}

// Функция для парсинга параметров из URL
function parseParams(routePattern, actualPath) {
  const routeParts = routePattern.split('/');
  const pathParts = actualPath.split('/');
  const params = {};
  
  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(':')) {
      const paramName = routeParts[i].slice(1);
      params[paramName] = pathParts[i];
    }
  }
  
  return params;
}

// Функция для проверки соответствия маршрута
function matchRoute(routePattern, actualPath) {
  const routeParts = routePattern.split('/');
  const pathParts = actualPath.split('/');
  
  if (routeParts.length !== pathParts.length) {
    return false;
  }
  
  for (let i = 0; i < routeParts.length; i++) {
    if (!routeParts[i].startsWith(':') && routeParts[i] !== pathParts[i]) {
      return false;
    }
  }
  
  return true;
}

// Функция для получения компонента по пути
export function getRouteComponent(path) {
  // Сначала проверяем точные маршруты
  if (routes[path]) {
    return routes[path];
  }
  
  // Затем проверяем параметризованные маршруты
  for (const [routePattern, component] of Object.entries(routes)) {
    if (routePattern !== '*' && matchRoute(routePattern, path)) {
      return component;
    }
  }
  
  // Fallback на 404
  return routes['*'];
}

// Функция для парсинга GET параметров
function parseQueryParams(search) {
  const params = {};
  if (search) {
    const urlParams = new URLSearchParams(search);
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
  }
  return params;
}

// Функция для получения параметров маршрута
export function getRouteParams(path) {
  for (const routePattern of Object.keys(routes)) {
    if (routePattern !== '*' && matchRoute(routePattern, path)) {
      return parseParams(routePattern, path);
    }
  }
  return {};
}

// Функция для получения GET параметров
export function getQueryParams() {
  return parseQueryParams(window.location.search);
}

// Функция для получения всех параметров (маршрут + GET)
export function getAllParams(path) {
  return {
    ...getRouteParams(path),
    ...getQueryParams()
  };
}

// Store для дополнительных props
const additionalPropsStore = writable({});

// Функция для обновления дополнительных props
export function updateAdditionalProps(props) {
  additionalPropsStore.set(props);
}

// Реактивная функция для получения параметров маршрута
export const getRoutParams = derived([urlStore, additionalPropsStore], ([urlData, additionalProps]) => {
  return {
    ...getRouteParams(window.location.pathname),
    ...getQueryParams(),
    ...additionalProps
  };
});


// Функция для проверки существования маршрута
export function routeExists(path) {
  // Проверяем точные маршруты
  if (routes.hasOwnProperty(path)) {
    return true;
  }
  
  // Проверяем параметризованные маршруты
  for (const routePattern of Object.keys(routes)) {
    if (routePattern !== '*' && matchRoute(routePattern, path)) {
      return true;
    }
  }
  
  // Проверяем catch-all
  return routes.hasOwnProperty('*');
}

// Получить все доступные маршруты
export function getAllRoutes() {
  return Object.keys(routes);
}

// Функция для создания ссылок с параметрами
export function linkTo(routePattern, params = {}, queryParams = {}) {
  let url = routePattern;
  
  // Заменяем параметры маршрута
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, value);
  }
  
  // Добавляем GET параметры
  if (Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams(queryParams);
    url += '?' + searchParams.toString();
  }
  
  return url;
}

// Получить маршруты с их компонентами
export function getRoutesWithComponents() {
  return routes;
}

// Функция для программной навигации
export function navigate(routePattern, paramsOrConfig = {}, queryParams = {}, additionalProps = {}) {
  let params, query, props;
  
  // Проверяем, передан ли объект с ключами (новый формат)
  if (paramsOrConfig && typeof paramsOrConfig === 'object' && 
      (paramsOrConfig.params || paramsOrConfig.queryParams || paramsOrConfig.props)) {
    // Новый формат: navigate('/user/:id', {params: {...}, queryParams: {...}, props: {...}})
    params = paramsOrConfig.params || {};
    query = paramsOrConfig.queryParams || {};
    props = paramsOrConfig.props || {};
  } else if (paramsOrConfig && typeof paramsOrConfig === 'object' && 
             !paramsOrConfig.params && !paramsOrConfig.queryParams && !paramsOrConfig.props) {
    // Автоматическое определение: navigate('/user/:id', {id: 123, userData: {...}})
    const routeParams = extractRouteParams(routePattern);
    params = {};
    props = {};
    
    // Разделяем параметры маршрута и дополнительные props
    for (const [key, value] of Object.entries(paramsOrConfig)) {
      if (routeParams.includes(key)) {
        params[key] = value;
      } else {
        props[key] = value;
      }
    }
    
    query = queryParams || {};
  } else {
    // Старый формат: navigate('/user/:id', {id: 123}, {tab: 'profile'}, {userData: {...}})
    params = paramsOrConfig || {};
    query = queryParams || {};
    props = additionalProps || {};
  }
  
  // Генерируем URL
  const url = linkTo(routePattern, params, query);
  
  // Извлекаем только путь без query string для проверки
  const pathOnly = url.split('?')[0];
  
  if (routeExists(pathOnly)) {
    // Обновляем URL в браузере
    window.history.pushState({}, '', url);
    
    // Обновляем дополнительные props
    updateAdditionalProps(props);
    
    // Обновляем URL store
    updateUrlStore();
    
    // Диспатчим событие для обновления компонентов
    window.dispatchEvent(new PopStateEvent('popstate'));
  } else {
    console.warn(`Route ${pathOnly} not found`);
  }
}

// Функция для извлечения параметров маршрута из паттерна
function extractRouteParams(routePattern) {
  const matches = routePattern.match(/:([^/]+)/g);
  return matches ? matches.map(match => match.slice(1)) : [];
}

