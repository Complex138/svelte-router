// Парсинг GET параметров из строки поиска

export function parseQueryParams(search) {
  // Используем Object.create(null) для защиты от prototype pollution
  const params = Object.create(null);
  if (search) {
    const urlParams = new URLSearchParams(search);
    for (const [key, value] of urlParams) {
      // Фильтруем опасные ключи
      if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
        params[key] = value;
      }
    }
  }
  return params;
}


