// Парсинг GET параметров из строки поиска

export function parseQueryParams(search) {
  const params = {};
  if (search) {
    const urlParams = new URLSearchParams(search);
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
  }
  return params;
}


