// Генерация ссылок с учётом параметров и query
import { isHashMode, buildHashUrl } from './hash-utils.js';

export function linkTo(routePattern, params = {}, queryParams = {}) {
  let url = routePattern;
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`:${key}(?:\\([^)]+\\))?`, 'g');
    url = url.replace(regex, value);
  }
  
  if (Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams(queryParams);
    url += '?' + searchParams.toString();
  }
  
  // Если используется hash routing, добавляем #
  if (isHashMode()) {
    return buildHashUrl(url, queryParams);
  }
  
  return url;
}


