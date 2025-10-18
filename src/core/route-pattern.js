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

/**
 * Вычисляет приоритет роута для правильного ранжирования
 * Более специфичные роуты должны иметь более высокий приоритет
 * @param {string} routePattern - Паттерн роута
 * @returns {number} Приоритет (чем больше, тем выше приоритет)
 */
export function calculateRoutePriority(routePattern) {
  let priority = 0;
  
  // Базовый приоритет по длине пути (более длинные пути = более специфичные)
  const pathLength = routePattern.split('/').filter(part => part !== '').length;
  priority += pathLength * 100;
  
  // Бонус за статичные части пути
  const staticParts = routePattern.split('/').filter(part => 
    part !== '' && !part.startsWith(':')
  ).length;
  priority += staticParts * 50;
  
  // Бонус за отсутствие параметров (полностью статичные роуты)
  if (!routePattern.includes(':')) {
    priority += 1000;
  }
  
  // Штраф за wildcard роуты
  if (routePattern === '*') {
    priority = -1000;
  }
  
  return priority;
}

/**
 * Находит лучший роут из списка кандидатов
 * @param {Array} candidates - Массив объектов {pattern, route}
 * @param {string} actualPath - Фактический путь
 * @returns {Object|null} Лучший роут или null
 */
export function findBestRoute(candidates, actualPath) {
  // Фильтруем только подходящие роуты
  const matchingRoutes = candidates.filter(({ pattern }) => 
    matchRoute(pattern, actualPath)
  );
  
  if (matchingRoutes.length === 0) {
    return null;
  }
  
  // Сортируем по приоритету (от большего к меньшему)
  matchingRoutes.sort((a, b) => 
    calculateRoutePriority(b.pattern) - calculateRoutePriority(a.pattern)
  );
  
  return matchingRoutes[0];
}


