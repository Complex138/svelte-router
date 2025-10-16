// Генерация ссылок с учётом параметров и query

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
  return url;
}


