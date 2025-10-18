# createNavigation - Создание роутера

## Описание

Основная функция для создания экземпляра роутера. Принимает конфигурацию роутов и возвращает реактивный store с текущим компонентом и его props.

## Синтаксис

```javascript
import { createNavigation } from 'svelte-router-v5';

const currentComponent = createNavigation(routesConfig);
```

## Параметры

- `routesConfig` (Object) - Конфигурация роутов

## Возвращает

Svelte store объект с полями:
- `component` - Текущий компонент роута
- `props` - Props для компонента
- `loading` - Состояние загрузки (boolean)
- `error` - Ошибка загрузки (string|null)

## Примеры использования

### Базовый пример

```javascript
// routes.js
export const routes = {
  '/': Home,
  '/about': About,
  '/user/:id': User
};

// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<main>
  <nav>
    <a href="/">Главная</a>
    <a href="/about">О нас</a>
    <a href="/user/123">Пользователь</a>
  </nav>

  <RouterView currentComponent={$currentComponent} />
</main>
```

### С глобальными настройками

```javascript
// routes.js
export const routes = {
  // Глобальный layout для всех роутов
  defaultLayout: 'app',

  // Глобальный middleware
  defaultMiddleware: ['auth'],

  // Роуты
  '/': Home,
  '/dashboard': Dashboard,
  '/admin': {
    component: Admin,
    layout: 'admin' // Переопределяет глобальный layout
  }
};

// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<RouterView currentComponent={$currentComponent} />
```

### С обработкой ошибок

```javascript
// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);

  // Обработка ошибок роутера
  $: if ($currentComponent.error) {
    console.error('Router error:', $currentComponent.error);
  }
</script>

<RouterView
  currentComponent={$currentComponent}
  errorComponent={ErrorPage}
/>
```

## Важные замечания

1. **Единственный экземпляр** - Создавайте только один экземпляр роутера на приложение
2. **Реактивность** - Store автоматически обновляется при навигации
3. **Middleware** - Выполняются автоматически при каждой навигации
4. **Layout** - Применяются согласно иерархии приоритетов

## Связанные функции

- [`RouterView`](router-view.md) - Компонент для отображения роутов
- [`LinkTo`](link-to.md) - Компонент для создания ссылок
- [`navigate`](navigate.md) - Программная навигация
