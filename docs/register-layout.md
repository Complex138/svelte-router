# registerLayout - Регистрация лейаутов

## Описание

Функция для регистрации лейаут компонентов в системе роутера. Лейауты позволяют создавать общие шаблоны для страниц.

## Синтаксис

```javascript
import { registerLayout } from 'svelte-router-v5';

registerLayout(name, component);
```

## Параметры

- `name` (String) - Уникальное имя лейаута (обязательный)
- `component` (Component) - Svelte компонент лейаута (обязательный)

## Примеры использования

### Базовая регистрация

```javascript
import { registerLayout } from 'svelte-router-v5';
import AppLayout from './layouts/AppLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';

// Регистрируем лейауты
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);
```

### Регистрация множества лейаутов

```javascript
import { registerLayout } from 'svelte-router-v5';

// Импорт всех лейаутов
import AppLayout from './layouts/AppLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';
import UserLayout from './layouts/UserLayout.svelte';
import AuthLayout from './layouts/AuthLayout.svelte';
import EmptyLayout from './layouts/EmptyLayout.svelte';

// Регистрация всех лейаутов
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);
registerLayout('user', UserLayout);
registerLayout('auth', AuthLayout);
registerLayout('empty', EmptyLayout);
```

### Создание лейаут компонента

```svelte
<!-- layouts/AppLayout.svelte -->
<script>
  // Лейаут получает текущий компонент роута
  export let component;
</script>

<div class="app-layout">
  <header class="app-header">
    <h1>My Application</h1>
    <nav>
      <LinkTo route="/">Главная</LinkTo>
      <LinkTo route="/about">О нас</LinkTo>
      <LinkTo route="/contact">Контакты</LinkTo>
    </nav>
  </header>

  <main class="app-main">
    <!-- Здесь рендерится текущий компонент роута -->
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

### Лейаут с параметрами

```svelte
<!-- layouts/AdminLayout.svelte -->
<script>
  export let component;
  export let sidebar = true;
  export let title = 'Admin Panel';
</script>

<div class="admin-layout">
  {#if sidebar}
    <aside class="admin-sidebar">
      <h2>{title}</h2>
      <nav>
        <LinkTo route="/admin">Dashboard</LinkTo>
        <LinkTo route="/admin/users">Users</LinkTo>
        <LinkTo route="/admin/settings">Settings</LinkTo>
      </nav>
    </aside>
  {/if}

  <main class="admin-content">
    <header>
      <h1>{title}</h1>
    </header>

    <div class="admin-body">
      <svelte:component this={component} />
    </div>
  </main>
</div>
```

### Использование в роутах

```javascript
// routes.js
import { registerLayout } from 'svelte-router-v5';

registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);

export const routes = {
  defaultLayout: 'app',  // Глобальный лейаут

  '/': Home,  // Использует 'app'

  '/admin': {
    component: Admin,
    layout: 'admin'  // Переопределяет на 'admin'
  },

  group: {
    prefix: '/user',
    layout: 'user',  // Лейаут для группы
    routes: {
      '/': UserDashboard,
      '/settings': UserSettings
    }
  },

  '/login': {
    component: Login,
    layout: null  // Без лейаута
  }
};
```

## Лучшие практики

1. **Уникальные имена** - Используйте описательные имена лейаутов
2. **Консистентность** - Создавайте похожую структуру для всех лейаутов
3. **Параметры** - Используйте параметры для кастомизации лейаутов
4. **Регистрация** - Регистрируйте лейауты до создания роутера

## Связанные функции

- [`getLayout`](get-layout.md) - Получение лейаута по имени
- [`hasLayout`](has-layout.md) - Проверка существования лейаута
- [`layouts`](layouts.md) - Общая документация по лейаутам
