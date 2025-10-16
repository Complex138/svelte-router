// Парсинг и сопоставление маршрутов с поддержкой регулярных выражений

// Функция для парсинга паттерна роута с регулярными выражениями
export function parseRoutePattern(routePattern) {
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

// Функция для проверки соответствия маршрута
export function matchRoute(routePattern, actualPath) {
  const { pattern } = parseRoutePattern(routePattern);
  const regex = new RegExp(pattern);
  return regex.test(actualPath);
}

// Функция для парсинга параметров из URL
export function parseParams(routePattern, actualPath) {
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

// Функция для извлечения параметров маршрута из паттерна
export function extractRouteParams(routePattern) {
  const { params } = parseRoutePattern(routePattern);
  return params;
}


