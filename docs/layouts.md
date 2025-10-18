# Layout система - Шаблоны страниц

## Описание

Система для создания общих шаблонов (лейаутов) для страниц. Позволяет оборачивать компоненты роутов в общие структуры с навигацией, сайдбарами и футерами.

## Регистрация лейаутов

### Базовая регистрация

```javascript
import { registerLayout } from 'svelte-router-v5';
import AppLayout from './layouts/AppLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';

// Регистрируем лейауты
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);
```

### Автозагрузка лейаутов

```javascript
import { loadLayouts } from 'svelte-router-v5';

// Автоматически загружает все лейауты из папки
loadLayouts('./src/layouts');

// Или с кастомными настройками
loadLayouts('./src/layouts', {
  prefix: 'Layout',  // LayoutApp.svelte -> 'app'
  exclude: ['BaseLayout.svelte']
});
```

## Использование в роутах

### Глобальный лейаут

```javascript
export const routes = {
  // Лейаут для всего приложения
  defaultLayout: 'app',

  '/': Home,  // Использует лейаут 'app'
  '/about': About,  // Использует лейаут 'app'

  '/admin': {
    component: Admin,
    layout: 'admin'  // Переопределяет на 'admin'
  }
};
```

### Лейауты в группах

```javascript
export const routes = {
  defaultLayout: 'app',

  group: {
    prefix: '/user',
    layout: 'user',  // Лейаут для всей группы
    middleware: ['auth'],
    routes: {
      '/': UserDashboard,  // Использует лейаут 'user'
      '/profile': UserProfile,  // Использует лейаут 'user'
      '/settings': {
        component: UserSettings,
        layout: 'settings'  // Переопределяет лейаут группы
      }
    }
  }
};
```

### Без лейаута

```javascript
export const routes = {
  defaultLayout: 'app',

  '/login': {
    component: Login,
    layout: null  // Без лейаута
  }
};
```

## Создание лейаут компонентов

### Базовый лейаут приложения

```svelte
<!-- layouts/AppLayout.svelte -->
<script>
  export let component;
</script>

<div class="app-layout">
  <header class="app-header">
    <h1>My App</h1>
    <nav>
      <a href="/">Главная</a>
      <a href="/about">О нас</a>
      <a href="/contact">Контакты</a>
    </nav>
  </header>

  <main class="app-main">
    <svelte:component this={component} />
  </main>

  <footer class="app-footer">
    <p>&copy; 2024 My App</p>
  </footer>
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    background: #f8f9fa;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }

  .app-main {
    flex: 1;
    padding: 2rem;
  }

  .app-footer {
    background: #f8f9fa;
    padding: 1rem;
    text-align: center;
    border-top: 1px solid #dee2e6;
  }
</style>
```

### Админ лейаут с сайдбаром

```svelte
<!-- layouts/AdminLayout.svelte -->
<script>
  export let component;
</script>

<div class="admin-layout">
  <aside class="admin-sidebar">
    <h2>Admin Panel</h2>
    <nav class="admin-nav">
      <a href="/admin">Dashboard</a>
      <a href="/admin/users">Users</a>
      <a href="/admin/settings">Settings</a>
    </nav>
  </aside>

  <main class="admin-content">
    <div class="admin-header">
      <h1>Administration</h1>
    </div>

    <div class="admin-body">
      <svelte:component this={component} />
    </div>
  </main>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f8f9fa;
  }

  .admin-sidebar {
    width: 250px;
    background: #343a40;
    color: white;
    padding: 1rem;
  }

  .admin-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .admin-body {
    flex: 1;
    padding: 2rem;
  }
</style>
```

### Лейаут с параметрами

```svelte
<!-- layouts/UserLayout.svelte -->
<script>
  export let component;
  export let sidebar = true;
  export let title = 'User Area';
</script>

<div class="user-layout">
  {#if sidebar}
    <aside class="user-sidebar">
      <nav>
        <a href="/user">Dashboard</a>
        <a href="/user/profile">Profile</a>
        <a href="/user/settings">Settings</a>
      </nav>
    </aside>
  {/if}

  <main class="user-content">
    <header>
      <h1>{title}</h1>
    </header>

    <div class="user-body">
      <svelte:component this={component} />
    </div>
  </main>
</div>
```

## Приоритет лейаутов

Лейауты применяются по приоритету (от высшего к низшему):

1. **Роут лейаут** - `layout` в конкретном роуте
2. **Группа лейаут** - `layout` в группе роутов
3. **Глобальный лейаут** - `defaultLayout` в конфигурации

## Примеры использования

### Полноценное приложение

```javascript
// layouts/AppLayout.svelte
<script>
  export let component;
</script>

<div class="app">
  <header>
    <nav>
      <LinkTo route="/">Главная</LinkTo>
      <LinkTo route="/about">О нас</LinkTo>
    </nav>
  </header>
  <main>
    <svelte:component this={component} />
  </main>
  <footer>Footer</footer>
</div>
```

```javascript
// layouts/AdminLayout.svelte
<script>
  export let component;
</script>

<div class="admin">
  <aside>
    <nav>
      <LinkTo route="/admin">Dashboard</LinkTo>
      <LinkTo route="/admin/users">Users</LinkTo>
    </nav>
  </aside>
  <main>
    <svelte:component this={component} />
  </main>
</div>
```

```javascript
// routes.js
import { registerLayout } from 'svelte-router-v5';

registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);

export const routes = {
  defaultLayout: 'app',

  '/': Home,
  '/about': About,

  group: {
    prefix: '/admin',
    layout: 'admin',
    middleware: ['auth', 'admin'],
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers
    }
  },

  '/login': {
    component: Login,
    layout: null  // Без лейаута
  }
};
```

### Интернет-магазин

```javascript
// layouts/StoreLayout.svelte
<script>
  export let component;
  export let showCart = true;
</script>

<div class="store">
  <header>
    <nav>
      <LinkTo route="/">Магазин</LinkTo>
      <LinkTo route="/catalog">Каталог</LinkTo>
      {#if showCart}
        <LinkTo route="/cart">Корзина</LinkTo>
      {/if}
    </nav>
  </header>
  <main>
    <svelte:component this={component} />
  </main>
</div>
```

```javascript
// routes.js
export const routes = {
  defaultLayout: 'store',

  '/': Home,
  '/catalog': Catalog,

  group: {
    prefix: '/product',
    routes: {
      '/:id': ProductDetail
    }
  },

  group: {
    prefix: '/checkout',
    layout: null,  // Без лейаута для процесса оформления
    routes: {
      '/': Checkout,
      '/payment': Payment,
      '/success': OrderSuccess
    }
  }
};
```

## Важные замечания

1. **Регистрация обязательна** - Лейауты нужно регистрировать перед использованием
2. **Компонент получает props** - Лейаут получает текущий компонент как проп
3. **Стили** - Каждый лейаут должен иметь уникальные CSS классы
4. **Производительность** - Лейауты кешируются автоматически

## Связанные функции

- [`registerLayout`](register-layout.md) - Регистрация лейаутов
- [`RouterView`](router-view.md) - Компонент отображения с поддержкой лейаутов
