# Параметры роутов - Route Parameters

## Описание

Система для работы с параметрами роутов и query параметрами. Поддерживает автоматическое извлечение параметров из URL и реактивную подписку на их изменения.

## Синтаксис роутов с параметрами

### Динамические сегменты

```javascript
export const routes = {
  '/user/:id': User,                    // Параметр id
  '/post/:id/comments': PostComments,   // Параметр id
  '/category/:slug': CategoryPage,       // Параметр slug
  '/user/:userId/post/:postId': Post,   // Несколько параметров
};
```

### Регулярные выражения

```javascript
export const routes = {
  '/user/id/:id(\\d+)': User,                    // Только цифры
  '/user/name/:name([a-zA-Z]+)': User,           // Только буквы
  '/post/:id(\\d+)/:action(edit|delete)': Post,  // Конкретные значения
  '/api/:version(v\\d+)/:endpoint': API,         // Шаблон версии
};
```

## Доступ к параметрам

### В компонентах

```javascript
<script>
  import { getRoutParams } from 'svelte-router-v5';

  // Подписываемся на параметры
  $: ({
    id,
    name,
    tab,
    userData,
    settings
  } = $getRoutParams);
</script>

<div class="user-profile">
  <h1>Пользователь: {name || 'Неизвестный'}</h1>
  <p>ID: {id}</p>

  {#if tab === 'profile'}
    <div>Профиль пользователя</div>
  {:else if tab === 'settings'}
    <div>Настройки пользователя</div>
  {/if}

  {#if userData}
    <pre>{JSON.stringify(userData, null, 2)}</pre>
  {/if}
</div>
```

### В функциях

```javascript
import { getRouteParams, getQueryParams, getAllParams } from 'svelte-router-v5';

// Параметры роута
const routeParams = getRouteParams('/user/123');
// {id: '123'}

// Query параметры
const queryParams = getQueryParams();
// {tab: 'profile', sort: 'name'}

// Все параметры вместе
const allParams = getAllParams('/user/123?tab=profile');
// {id: '123', tab: 'profile', sort: 'name'}
```

## Передача параметров

### Через LinkTo

```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<!-- Параметры роута -->
<LinkTo route="/user/:id" params={{id: 123}}>
  Пользователь 123
</LinkTo>

<!-- С query параметрами -->
<LinkTo
  route="/search"
  params={{query: 'svelte'}}
  queryParams={{category: 'docs', page: 1}}
>
  Поиск
</LinkTo>

<!-- С дополнительными props -->
<LinkTo
  route="/user/:id"
  params={{id: 123}}
  props={{userData: {name: 'John', role: 'admin'}}}
>
  Профиль с данными
</LinkTo>
```

### Через navigate

```javascript
import { navigate } from 'svelte-router-v5';

// Способ 1: Старый формат
navigate('/user/:id', {id: 123});
navigate('/search', {query: 'svelte'}, {category: 'docs'});

// Способ 2: Новый формат
navigate('/user/:id', {
  params: {id: 123},
  queryParams: {tab: 'profile'},
  props: {userData: {...}}
});

// Способ 3: Автоматическое определение
navigate('/user/:id', {
  id: 123,                    // В params (совпадает с :id)
  userData: {name: 'John'},  // В props
  tab: 'profile'             // В query (короткое имя)
});
```

## Примеры использования

### Профиль пользователя

```svelte
<!-- UserProfile.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';

  $: ({
    id,
    tab,
    userData,
    settings
  } = $getRoutParams);

  $: currentUser = userData?.user;
  $: userSettings = settings || {};
</script>

<div class="user-profile">
  <nav class="profile-tabs">
    <LinkTo route="/user/:id" params={{id}} queryParams={{tab: 'overview'}}>
      Обзор
    </LinkTo>
    <LinkTo route="/user/:id" params={{id}} queryParams={{tab: 'posts'}}>
      Посты
    </LinkTo>
    <LinkTo route="/user/:id" params={{id}} queryParams={{tab: 'settings'}}>
      Настройки
    </LinkTo>
  </nav>

  {#if tab === 'overview'}
    <div class="overview">
      <h1>{currentUser?.name}</h1>
      <p>Email: {currentUser?.email}</p>
      <p>Роль: {currentUser?.role}</p>
    </div>
  {:else if tab === 'posts'}
    <div class="posts">
      <h2>Посты пользователя</h2>
      <!-- Список постов -->
    </div>
  {:else if tab === 'settings'}
    <div class="settings">
      <h2>Настройки</h2>
      <label>
        Тема: {userSettings.theme}
      </label>
    </div>
  {/if}
</script>
```

### Каталог товаров

```svelte
<!-- CategoryPage.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';

  $: ({ category, page, sort, filters } = $getRoutParams);
  $: currentPage = parseInt(page) || 1;
  $: sortBy = sort || 'name';
</script>

<div class="category-page">
  <header>
    <h1>Категория: {category}</h1>

    <div class="filters">
      <LinkTo
        route="/category/:category"
        params={{category}}
        queryParams={{sort: 'name', page: 1}}
      >
        По имени
      </LinkTo>

      <LinkTo
        route="/category/:category"
        params={{category}}
        queryParams={{sort: 'price', page: 1}}
      >
        По цене
      </LinkTo>

      <LinkTo
        route="/category/:category"
        params={{category}}
        queryParams={{sort: 'rating', page: 1}}
      >
        По рейтингу
      </LinkTo>
    </div>
  </header>

  <div class="products">
    <!-- Список товаров -->
    <p>Страница {currentPage}, сортировка: {sortBy}</p>
  </div>

  <nav class="pagination">
    <LinkTo
      route="/category/:category"
      params={{category}}
      queryParams={{page: currentPage - 1, sort}}
    >
      Предыдущая
    </LinkTo>

    <LinkTo
      route="/category/:category"
      params={{category}}
      queryParams={{page: currentPage + 1, sort}}
    >
      Следующая
    </LinkTo>
  </nav>
</div>
```

### Пост с комментариями

```svelte
<!-- PostPage.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';

  $: ({ id, commentId, showComments } = $getRoutParams);
</script>

<article class="post">
  <header>
    <h1>Пост #{id}</h1>
  </header>

  <div class="post-content">
    Содержание поста...
  </div>

  <nav class="post-actions">
    <LinkTo
      route="/post/:id"
      params={{id}}
      queryParams={{showComments: true}}
    >
      Показать комментарии
    </LinkTo>

    <LinkTo
      route="/post/:id/edit"
      params={{id}}
    >
      Редактировать
    </LinkTo>
  </nav>

  {#if showComments}
    <section class="comments">
      <h3>Комментарии</h3>

      {#if commentId}
        <div class="highlighted-comment">
          Комментарий #{commentId}
        </div>
      {/if}
    </section>
  {/if}
</article>
```

## Важные замечания

1. **Реактивность** - Параметры автоматически обновляются при навигации
2. **Типы данных** - Все параметры приходят как строки
3. **Кодирование** - Специальные символы автоматически кодируются/декодируются
4. **Массивы** - Для массивов используйте строку с разделителем

## Связанные функции

- [`getRoutParams`](get-route-params.md) - Реактивный store с параметрами
- [`getRouteParams`](get-route-params.md) - Получение параметров роута
- [`getQueryParams`](get-query-params.md) - Получение query параметров
