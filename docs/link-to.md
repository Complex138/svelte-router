# LinkTo - Компонент навигации

## Описание

Svelte компонент для создания навигационных ссылок с автоматической предзагрузкой компонентов и поддержкой параметров.

## Синтаксис

```svelte
<LinkTo
  route="/path/:param"
  params={{param: 'value'}}
  queryParams={{tab: 'profile'}}
  props={{userData: {...}}}
  prefetch="hover"
  prefetchDelay={50}
  className="nav-link"
>
  Название ссылки
</LinkTo>
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `route` | String | - | Паттерн роута (обязательный) |
| `params` | Object | {} | Параметры для динамических сегментов |
| `queryParams` | Object | {} | GET параметры |
| `props` | Object | {} | Дополнительные props для компонента |
| `prefetch` | String | 'hover' | Стратегия предзагрузки: 'hover', 'visible', 'mount', 'smart', 'none' |
| `prefetchDelay` | Number | 50 | Задержка предзагрузки в миллисекундах |
| `className` | String | '' | CSS класс для ссылки |

## Примеры использования

### Базовая ссылка

```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<nav>
  <LinkTo route="/">Главная</LinkTo>
  <LinkTo route="/about">О нас</LinkTo>
  <LinkTo route="/contact">Контакты</LinkTo>
</nav>
```

### С параметрами

```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<!-- Динамический роут -->
<LinkTo route="/user/:id" params={{id: 123}}>
  Пользователь 123
</LinkTo>

<!-- С query параметрами -->
<LinkTo
  route="/search"
  params={{query: 'svelte'}}
  queryParams={{category: 'tutorials'}}
>
  Поиск
</LinkTo>

<!-- С дополнительными props -->
<LinkTo
  route="/user/:id"
  params={{id: 123}}
  props={{userData: {name: 'John', role: 'admin'}}}
>
  Профиль пользователя
</LinkTo>
```

### Разные стратегии предзагрузки

```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<!-- Предзагрузка при наведении (по умолчанию) -->
<LinkTo route="/heavy-page" prefetch="hover">
  Тяжелая страница
</LinkTo>

<!-- Предзагрузка при появлении в области видимости -->
<LinkTo route="/lazy-content" prefetch="visible">
  Контент для ленивой загрузки
</LinkTo>

<!-- Предзагрузка при монтировании компонента -->
<LinkTo route="/critical-page" prefetch="mount">
  Критически важная страница
</LinkTo>

<!-- Умная предзагрузка (учится на паттернах навигации) -->
<LinkTo route="/dashboard" prefetch="smart">
  Дашборд
</LinkTo>

<!-- Отключить предзагрузку -->
<LinkTo route="/logout" prefetch="none">
  Выход
</LinkTo>
```

### Кастомная задержка предзагрузки

```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<!-- Дольше ждать перед предзагрузкой (для меню) -->
<LinkTo
  route="/dashboard"
  prefetch="hover"
  prefetchDelay={200}
>
  Дашборд
</LinkTo>
```

### Стилизация

```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<LinkTo
  route="/profile"
  className="profile-link active"
>
  Профиль
</LinkTo>

<style>
  .profile-link {
    color: #007bff;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .profile-link:hover {
    background-color: #e9ecef;
  }

  .profile-link.active {
    background-color: #007bff;
    color: white;
  }
</style>
```

## Важные замечания

1. **Предзагрузка** - Работает только для lazy-загружаемых компонентов
2. **Параметры** - Автоматически подставляются в URL
3. **Props** - Передаются в компонент при клике
4. **Производительность** - Умная предзагрузка улучшает UX

## Связанные функции

- [`navigate`](navigate.md) - Программная навигация
- [`linkTo`](link-to.md) - Генерация URL без навигации
- [`prefetchRoute`](prefetch-route.md) - Ручная предзагрузка
