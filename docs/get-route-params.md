# getRoutParams - Реактивные параметры

## Описание

Реактивный Svelte store, содержащий все параметры роута, query параметры и дополнительные props. Автоматически обновляется при навигации.

## Синтаксис

```javascript
import { getRoutParams } from 'svelte-router-v5';

// В компоненте
$: ({
  routeParam1,
  routeParam2,
  queryParam1,
  queryParam2,
  additionalProp1
} = $getRoutParams);
```

## Структура возвращаемых данных

```javascript
{
  // Параметры роута (из динамических сегментов)
  id: '123',
  slug: 'my-post',
  category: 'tech',

  // Query параметры (из URL строки)
  page: '2',
  sort: 'name',
  filter: 'active',

  // Дополнительные props (переданные через navigate/LinkTo)
  userData: {...},
  settings: {...},
  message: 'Success'
}
```

## Примеры использования

### Базовое использование

```svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';

  // Подписываемся на все параметры
  $: params = $getRoutParams;

  // Или деструктурируем нужные
  $: ({ id, tab, userData } = $getRoutParams);
</script>

<div class="component">
  <h1>Параметры: {JSON.stringify(params)}</h1>

  {#if id}
    <p>Пользователь ID: {id}</p>
  {/if}

  {#if tab}
    <p>Активная вкладка: {tab}</p>
  {/if}

  {#if userData}
    <pre>{JSON.stringify(userData, null, 2)}</pre>
  {/if}
</div>
```

### С условным рендерингом

```svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';

  $: ({ tab, user, settings } = $getRoutParams);
</script>

<div class="user-dashboard">
  <nav class="tabs">
    <LinkTo route="/dashboard" queryParams={{tab: 'overview'}}>
      Обзор
    </LinkTo>
    <LinkTo route="/dashboard" queryParams={{tab: 'projects'}}>
      Проекты
    </LinkTo>
    <LinkTo route="/dashboard" queryParams={{tab: 'settings'}}>
      Настройки
    </LinkTo>
  </nav>

  {#if tab === 'overview'}
    <div class="overview">
      <h2>Добро пожаловать, {user?.name}!</h2>
      <p>Сегодня: {new Date().toLocaleDateString()}</p>
    </div>
  {:else if tab === 'projects'}
    <div class="projects">
      <h2>Ваши проекты</h2>
      <!-- Список проектов -->
    </div>
  {:else if tab === 'settings'}
    <div class="settings">
      <h2>Настройки</h2>
      <p>Тема: {settings?.theme || 'light'}</p>
      <p>Язык: {settings?.language || 'ru'}</p>
    </div>
  {/if}
</script>
```

### С вычисляемыми значениями

```svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';

  $: ({ page, sort, filter, itemsPerPage } = $getRoutParams);

  // Вычисляемые значения
  $: currentPage = parseInt(page) || 1;
  $: sortBy = sort || 'name';
  $: filterBy = filter || 'all';
  $: perPage = parseInt(itemsPerPage) || 10;
  $: offset = (currentPage - 1) * perPage;

  // Загружаем данные когда параметры меняются
  $: if (currentPage && sortBy) {
    loadData({ page: currentPage, sort: sortBy, filter: filterBy });
  }
</script>

<div class="data-table">
  <nav class="pagination">
    <LinkTo route="/data" queryParams={{page: currentPage - 1, sort}}>
      Предыдущая
    </LinkTo>

    <span>Страница {currentPage}</span>

    <LinkTo route="/data" queryParams={{page: currentPage + 1, sort}}>
      Следующая
    </LinkTo>
  </nav>

  <div class="sort-options">
    <LinkTo route="/data" queryParams={{sort: 'name', page: 1}}>
      По имени
    </LinkTo>
    <LinkTo route="/data" queryParams={{sort: 'date', page: 1}}>
      По дате
    </LinkTo>
    <LinkTo route="/data" queryParams={{sort: 'size', page: 1}}>
      По размеру
    </LinkTo>
  </div>

  <p>Отображаем элементы {offset + 1}-{offset + perPage}</p>
</div>
```

### С состоянием загрузки

```svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';

  let loading = false;
  let data = null;

  $: ({ category, page } = $getRoutParams);

  // Загружаем данные при изменении параметров
  $: if (category && page) {
    loadCategoryData(category, page);
  }

  async function loadCategoryData(category, page) {
    loading = true;
    try {
      data = await fetch(`/api/categories/${category}?page=${page}`);
    } catch (error) {
      console.error('Failed to load category data:', error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="category-page">
  <h1>Категория: {category}</h1>
  <p>Страница: {page}</p>

  {#if loading}
    <div class="loading">Загрузка...</div>
  {:else if data}
    <div class="data">
      <!-- Отображение данных -->
    </div>
  {/if}
</div>
```

## Лучшие практики

1. **Деструктуризация** - Используйте деструктуризацию для нужных параметров
2. **Условная логика** - Проверяйте наличие параметров перед использованием
3. **Типы данных** - Все параметры приходят как строки, конвертируйте если нужно
4. **Зависимости** - Используйте параметры как зависимости для реактивных statements

## Важные замечания

1. **Автообновление** - Store автоматически обновляется при навигации
2. **Инициализация** - При первом рендере параметры могут быть пустыми
3. **Строки** - Все параметры приходят как строки
4. **Массивы** - Для массивов используйте JSON.parse/stringify или разделители

## Связанные функции

- [`getRouteParams`](get-route-params.md) - Получение параметров роута
- [`getQueryParams`](get-query-params.md) - Получение query параметров
- [`getAllParams`](get-all-params.md) - Получение всех параметров
