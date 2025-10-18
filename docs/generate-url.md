# linkTo - Генерация URL

## Описание

Функция для генерации URL без навигации. Полезна для создания ссылок, логирования или передачи URL другим системам.

## Синтаксис

```javascript
import { linkTo } from 'svelte-router-v5';

const url = linkTo(route, params, queryParams);
```

## Параметры

- `route` (String) - Паттерн роута (обязательный)
- `params` (Object) - Параметры для динамических сегментов
- `queryParams` (Object) - GET параметры

## Возвращает

String - Сгенерированный URL

## Примеры использования

### Базовая генерация URL

```javascript
import { linkTo } from 'svelte-router-v5';

// Простой роут
const homeUrl = linkTo('/');
console.log(homeUrl); // '/'

// Роут с параметром
const userUrl = linkTo('/user/:id', {id: 123});
console.log(userUrl); // '/user/123'

// Статический роут
const aboutUrl = linkTo('/about');
console.log(aboutUrl); // '/about'
```

### С query параметрами

```javascript
import { linkTo } from 'svelte-router-v5';

// Только query параметры
const searchUrl = linkTo('/search', {}, {query: 'svelte', category: 'docs'});
console.log(searchUrl); // '/search?query=svelte&category=docs'

// С параметрами и query
const filteredUrl = linkTo('/users/:role', {role: 'admin'}, {page: 1, sort: 'name'});
console.log(filteredUrl); // '/users/admin?page=1&sort=name'
```

## Практические примеры

### Создание ссылок в компонентах

```javascript
<script>
  import { linkTo } from 'svelte-router-v5';

  export let userId;
  export let postId;

  // Генерируем URL для ссылок
  $: userProfileUrl = linkTo('/user/:id', {id: userId});
  $: postUrl = linkTo('/post/:id', {id: postId});
</script>

<div class="actions">
  <a href={userProfileUrl}>Профиль пользователя</a>
  <a href={postUrl}>Посмотреть пост</a>
</div>
```

### Генерация канонических URL

```javascript
<script>
  import { linkTo } from 'svelte-router-v5';

  export let product = {
    id: 123,
    category: 'electronics',
    name: 'Smartphone'
  };

  // Генерируем канонический URL для SEO
  $: canonicalUrl = linkTo('/product/:id',
    {id: product.id},
    {category: product.category});
</script>

<head>
  <link rel="canonical" href={canonicalUrl}>
</head>
```

## Важные замечания

1. **Только генерация URL** - Не выполняет навигацию
2. **Кодирование** - Специальные символы автоматически кодируются
3. **Относительные URL** - Всегда генерирует абсолютные пути

## Связанные функции

- [`navigate`](navigate.md) - Программная навигация
- [`LinkTo`](link-to.md) - Компонент для декларативной навигации
