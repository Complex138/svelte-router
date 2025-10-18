# Вспомогательные функции параметров

## Описание

Набор функций для получения параметров роутов, query параметров и всех параметров вместе. Полезны для работы вне реактивного контекста.

## Функции

### getRouteParams(path)

Получает параметры роута для указанного пути.

**Параметры:**
- `path` (String) - Путь для анализа

**Возвращает:** Object с параметрами роута

```javascript
import { getRouteParams } from 'svelte-router-v5';

// Параметры для текущего пути
const params = getRouteParams('/user/123');
// {id: '123'}

// Параметры для конкретного пути
const params = getRouteParams('/user/456');
// {id: '456'}
```

### getQueryParams()

Получает query параметры из текущего URL.

**Возвращает:** Object с query параметрами

```javascript
import { getQueryParams } from 'svelte-router-v5';

// Текущие query параметры
const query = getQueryParams();
// {tab: 'profile', sort: 'name', page: '2'}
```

### getAllParams(path)

Получает все параметры (роут + query) для указанного пути.

**Параметры:**
- `path` (String) - Путь для анализа

**Возвращает:** Object со всеми параметрами

```javascript
import { getAllParams } from 'svelte-router-v5';

// Все параметры для пути
const allParams = getAllParams('/user/123?tab=profile&sort=name');
// {id: '123', tab: 'profile', sort: 'name'}
```

## Примеры использования

### В утилитах

```javascript
// utils/urlHelpers.js
import { getRouteParams, getQueryParams, getAllParams } from 'svelte-router-v5';

export function buildUserUrl(userId, options = {}) {
  const query = getQueryParams();
  const params = { id: userId };

  return `/user/${userId}${buildQueryString({...query, ...options})}`;
}

export function getCurrentPageInfo() {
  const routeParams = getRouteParams();
  const queryParams = getQueryParams();
  const allParams = getAllParams();

  return {
    route: routeParams,
    query: queryParams,
    all: allParams,
    path: window.location.pathname
  };
}

export function isAdminRoute() {
  const params = getRouteParams();
  return params.role === 'admin' || window.location.pathname.startsWith('/admin');
}
```

### В API функциях

```javascript
// api/dataService.js
import { getRouteParams, getQueryParams } from 'svelte-router-v5';

export async function fetchUserData() {
  const { id } = getRouteParams();
  const { include } = getQueryParams();

  if (!id) {
    throw new Error('User ID is required');
  }

  const response = await fetch(`/api/users/${id}?include=${include || ''}`);
  return response.json();
}

export async function fetchPosts() {
  const { page, sort, filter } = getQueryParams();

  const params = new URLSearchParams({
    page: page || '1',
    sort: sort || 'date',
    filter: filter || 'all'
  });

  const response = await fetch(`/api/posts?${params}`);
  return response.json();
}
```

### В компонентах для логики

```svelte
<script>
  import { getRouteParams, getQueryParams } from 'svelte-router-v5';

  function handleExport() {
    const { id } = getRouteParams();
    const { format } = getQueryParams();

    // Экспорт данных для текущего пользователя
    exportUserData(id, format || 'json');
  }

  function getBreadcrumbs() {
    const params = getRouteParams();
    const breadcrumbs = [];

    if (params.category) {
      breadcrumbs.push({ label: params.category, path: `/category/${params.category}` });
    }

    if (params.id) {
      breadcrumbs.push({ label: `Элемент ${params.id}`, path: `/item/${params.id}` });
    }

    return breadcrumbs;
  }
</script>

<div class="actions">
  <button on:click={handleExport}>Экспорт</button>
</div>

<nav class="breadcrumbs">
  {#each getBreadcrumbs() as crumb}
    <LinkTo route={crumb.path}>{crumb.label}</LinkTo>
  {/each}
</nav>
```

### В middleware

```javascript
// middleware/analytics.js
import { getRouteParams, getQueryParams } from 'svelte-router-v5';

export function analyticsMiddleware(context) {
  const routeParams = getRouteParams(context.to);
  const queryParams = getQueryParams();

  // Отправляем аналитику
  analytics.track('page_view', {
    path: context.to,
    params: routeParams,
    query: queryParams,
    referrer: context.from
  });

  return true;
}
```

### В сервисах

```javascript
// services/navigationService.js
import { getAllParams } from 'svelte-router-v5';

export class NavigationService {
  static getCurrentState() {
    return {
      params: getAllParams(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };
  }

  static canAccessAdmin() {
    const params = getAllParams();
    return params.user?.role === 'admin';
  }

  static getSearchQuery() {
    const params = getAllParams();
    return params.query || '';
  }
}
```

## Важные замечания

1. **Синхронные функции** - Работают без реактивности
2. **Текущий URL** - Анализируют текущий адрес в браузере
3. **Строки** - Все параметры возвращаются как строки
4. **URL декодирование** - Автоматически декодируют специальные символы

## Связанные функции

- [`getRoutParams`](get-route-params.md) - Реактивный store с параметрами
