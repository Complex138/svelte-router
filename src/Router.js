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

// Функция для парсинга паттерна роута с регулярными выражениями
function parseRoutePattern(routePattern) {
  const routeParts = routePattern.split('/');
  const params = [];
  let pattern = '';
  
  for (let i = 0; i < routeParts.length; i++) {
    const part = routeParts[i];
    
    if (part === '') {
      // Пустая часть (начало или конец)
      if (i === 0) {
        pattern = '/';
      }
      continue;
    }
    
    if (part.startsWith(':')) {
      // Проверяем есть ли регулярное выражение в скобках
      const match = part.match(/^:([^(]+)(?:\(([^)]+)\))?$/);
      if (match) {
        const paramName = match[1];
        const regex = match[2] || '[^/]+'; // По умолчанию любой символ кроме /
        
        params.push(paramName);
        pattern += `/(${regex})`;
      } else {
        // Fallback для старых роутов
        const paramName = part.slice(1);
        params.push(paramName);
        pattern += `/([^/]+)`;
      }
    } else {
      // Обычная часть пути
      if (pattern === '/') {
        pattern += part;
      } else {
        pattern += '/' + part;
      }
    }
  }
  
  // Убираем лишние слеши
  if (pattern === '/') {
    pattern = '^/$';
  } else {
    pattern = '^' + pattern + '$';
  }
  
  return { pattern, params };
}

// Функция для парсинга параметров из URL
function parseParams(routePattern, actualPath) {
  const { pattern, params } = parseRoutePattern(routePattern);
  const regex = new RegExp(pattern);
  const matches = actualPath.match(regex);
  
  if (!matches) {
    return {};
  }
  
  const result = {};
  params.forEach((param, index) => {
    result[param] = matches[index + 1];
  });
  
  return result;
}

// Функция для проверки соответствия маршрута
function matchRoute(routePattern, actualPath) {
  const { pattern } = parseRoutePattern(routePattern);
  const regex = new RegExp(pattern);
  return regex.test(actualPath);
}

// Функция для получения компонента по пути
export function getRouteComponent(path) {
  // Сначала проверяем точные маршруты
  if (routes[path]) {
    return getRouteComponentFromConfig(routes[path]);
  }
  
  // Получаем все роуты и сортируем их по специфичности
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  
  // Сортируем: сначала роуты с регулярками (более специфичные), потом общие
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    
    if (aHasRegex && !bHasRegex) return -1; // a идет первым
    if (!aHasRegex && bHasRegex) return 1;  // b идет первым
    return 0; // порядок не важен
  });
  
  // Проверяем роуты в отсортированном порядке
  for (const [routePattern, routeValue] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return getRouteComponentFromConfig(routeValue);
    }
  }
  
  // Fallback на 404
  return getRouteComponentFromConfig(routes['*']);
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
  
  // Заменяем параметры маршрута (учитываем регулярные выражения)
  for (const [key, value] of Object.entries(params)) {
    // Ищем параметр в формате :param или :param(regex)
    const regex = new RegExp(`:${key}(?:\\([^)]+\\))?`, 'g');
    url = url.replace(regex, value);
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

// Функция для получения middleware роута по пути
export function getRouteMiddlewareByPath(path) {
  // Сначала проверяем точные маршруты
  if (routes[path]) {
    return getRouteMiddleware(routes[path]);
  }
  
  // Получаем все роуты и сортируем их по специфичности
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  
  // Сортируем: сначала роуты с регулярками (более специфичные), потом общие
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    
    if (aHasRegex && !bHasRegex) return -1; // a идет первым
    if (!aHasRegex && bHasRegex) return 1;  // b идет первым
    return 0; // порядок не важен
  });
  
  // Проверяем роуты в отсортированном порядке
  for (const [routePattern, routeValue] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return getRouteMiddleware(routeValue);
    }
  }
  
  // Fallback на 404
  return getRouteMiddleware(routes['*']);
}

// Функция для получения beforeEnter роута по пути
export function getRouteBeforeEnterByPath(path) {
  // Сначала проверяем точные маршруты
  if (routes[path]) {
    return getRouteBeforeEnter(routes[path]);
  }
  
  // Получаем все роуты и сортируем их по специфичности
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  
  // Сортируем: сначала роуты с регулярками (более специфичные), потом общие
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    
    if (aHasRegex && !bHasRegex) return -1; // a идет первым
    if (!aHasRegex && bHasRegex) return 1;  // b идет первым
    return 0; // порядок не важен
  });
  
  // Проверяем роуты в отсортированном порядке
  for (const [routePattern, routeValue] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return getRouteBeforeEnter(routeValue);
    }
  }
  
  // Fallback на 404
  return getRouteBeforeEnter(routes['*']);
}

// Функция для получения afterEnter роута по пути
export function getRouteAfterEnterByPath(path) {
  // Сначала проверяем точные маршруты
  if (routes[path]) {
    return getRouteAfterEnter(routes[path]);
  }
  
  // Получаем все роуты и сортируем их по специфичности
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  
  // Сортируем: сначала роуты с регулярками (более специфичные), потом общие
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    
    if (aHasRegex && !bHasRegex) return -1; // a идет первым
    if (!aHasRegex && bHasRegex) return 1;  // b идет первым
    return 0; // порядок не важен
  });
  
  // Проверяем роуты в отсортированном порядке
  for (const [routePattern, routeValue] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return getRouteAfterEnter(routeValue);
    }
  }
  
  // Fallback на 404
  return getRouteAfterEnter(routes['*']);
}

// Функция для получения паттерна роута по пути
export function getRoutePatternByPath(path) {
  // Сначала проверяем точные маршруты
  if (routes[path]) {
    return path;
  }
  
  // Получаем все роуты и сортируем их по специфичности
  const routeEntries = Object.entries(routes).filter(([pattern]) => pattern !== '*');
  
  // Сортируем: сначала роуты с регулярками (более специфичные), потом общие
  routeEntries.sort(([a], [b]) => {
    const aHasRegex = a.includes('(');
    const bHasRegex = b.includes('(');
    
    if (aHasRegex && !bHasRegex) return -1; // a идет первым
    if (!aHasRegex && bHasRegex) return 1;  // b идет первым
    return 0; // порядок не важен
  });
  
  // Проверяем роуты в отсортированном порядке
  for (const [routePattern, routeValue] of routeEntries) {
    if (matchRoute(routePattern, path)) {
      return routePattern;
    }
  }
  
  // Fallback на 404
  return '*';
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
  const { params } = parseRoutePattern(routePattern);
  return params;
}

// ===== MIDDLEWARE SYSTEM =====

// Реестр middleware
const middlewareRegistry = {};

// Глобальные middleware
const globalMiddleware = {
  before: [],
  after: [],
  error: []
};

// Функция для регистрации middleware
export function registerMiddleware(name, middlewareFunction) {
  middlewareRegistry[name] = middlewareFunction;
}

// Функция для регистрации глобального middleware
export function registerGlobalMiddleware(type, middlewareFunction) {
  if (globalMiddleware[type]) {
    globalMiddleware[type].push(middlewareFunction);
  }
}

// Функция для получения middleware по имени
function getMiddleware(name) {
  return middlewareRegistry[name];
}

// Функция для проверки, является ли роут конфигурацией с middleware
function isRouteConfig(routeValue) {
  return routeValue && typeof routeValue === 'object' && routeValue.component;
}

// Функция для получения компонента из роута (поддержка старого и нового формата)
function getRouteComponentFromConfig(routeValue) {
  if (isRouteConfig(routeValue)) {
    return routeValue.component;
  }
  return routeValue;
}

// Функция для получения middleware из роута
function getRouteMiddleware(routeValue) {
  if (isRouteConfig(routeValue)) {
    return routeValue.middleware || [];
  }
  return [];
}

// Функция для получения beforeEnter из роута
function getRouteBeforeEnter(routeValue) {
  if (isRouteConfig(routeValue)) {
    return routeValue.beforeEnter;
  }
  return null;
}

// Функция для получения afterEnter из роута
function getRouteAfterEnter(routeValue) {
  if (isRouteConfig(routeValue)) {
    return routeValue.afterEnter;
  }
  return null;
}

// Функция для выполнения middleware
export async function executeMiddleware(middlewareList, context) {
  for (const middlewareItem of middlewareList) {
    let middlewareFunction;
    
    if (typeof middlewareItem === 'string') {
      // Простое имя middleware
      middlewareFunction = getMiddleware(middlewareItem);
      if (!middlewareFunction) {
        console.warn(`Middleware "${middlewareItem}" not found`);
        continue;
      }
    } else if (middlewareItem && typeof middlewareItem === 'object' && middlewareItem.name) {
      // Конфигурация middleware
      middlewareFunction = getMiddleware(middlewareItem.name);
      if (!middlewareFunction) {
        console.warn(`Middleware "${middlewareItem.name}" not found`);
        continue;
      }
      // Добавляем опции в контекст
      context.middlewareOptions = middlewareItem.options;
    }
    
    if (middlewareFunction) {
      try {
        const result = await middlewareFunction(context);
        if (result === false) {
          return false; // Блокируем переход
        }
      } catch (error) {
        console.error(`Error in middleware:`, error);
        // Выполняем error middleware
        for (const errorMiddleware of globalMiddleware.error) {
          try {
            await errorMiddleware(error, context);
          } catch (errorHandlerError) {
            console.error(`Error in error middleware:`, errorHandlerError);
          }
        }
        return false; // Блокируем переход при ошибке
      }
    }
  }
  return true; // Разрешаем переход
}

// Функция для выполнения глобальных middleware
export async function executeGlobalMiddleware(type, context) {
  const middlewareList = globalMiddleware[type] || [];
  return await executeMiddleware(middlewareList, context);
}

// Функция для создания контекста middleware
export function createMiddlewareContext(from, to, params, query, props, navigate, route) {
  return {
    from,
    to,
    params,
    query,
    props,
    navigate,
    route
  };
}

