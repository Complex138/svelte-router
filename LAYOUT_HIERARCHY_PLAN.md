# Иерархия слоев с глобальным базовым слоем 🎯

## Идея

Создать иерархию слоев, где каждый уровень может переопределить слой выше:

```
Глобальный слой (базовый)
    ↓
Группа роутов слой
    ↓  
Роут слой
```

## Как это будет работать

### 1. Глобальный базовый слой
```javascript
// В массиве роутов указываем глобальные настройки
export const routes = {
  defaultLayout: 'app',  // ← Глобальный слой для всех роутов
  
  '/': {
    component: Home
    // Использует глобальный слой 'app'
  },
  
  '/admin': {
    component: Admin,
    layout: 'admin'  // Переопределяет на 'admin'
  }
};
```

### 2. Иерархия слоев
```javascript
export const routes = {
  '/': {
    component: Home
    // Использует глобальный слой 'app'
  },
  
  '/admin': {
    component: Admin,
    layout: 'admin'  // ← Переопределяет глобальный слой
  },
  
  group: {
    prefix: '/user',
    layout: 'user',  // ← Слой для всей группы
    middleware: ['auth'],
    routes: {
      '/': {
        component: UserDashboard
        // Использует слой группы 'user'
      },
      
      '/profile': {
        component: UserProfile,
        layout: 'profile'  // ← Переопределяет слой группы
      }
    }
  }
};
```

## Приоритет слоев (от высшего к низшему)

1. **Роут слой** - `layout` в конкретном роуте
2. **Группа слой** - `layout` в группе роутов  
3. **Глобальный слой** - `defaultLayout` при создании роутинга

## Примеры использования

### 1. Базовый пример
```javascript
// routes.js
export const routes = {
  defaultLayout: 'app',  // ← Глобальный слой для всех роутов
  
  '/': {
    component: Home
    // Использует глобальный слой 'app'
  },
  
  '/admin': {
    component: Admin,
    layout: 'admin'  // Переопределяет на 'admin'
  }
};

// App.svelte
<script>
  import { createNavigation } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<RouterView currentComponent={$currentComponent} />
```

### 2. Роуты с разными слоями
```javascript
export const routes = {
  defaultLayout: 'app',  // ← Глобальный слой
  
  '/': {
    component: Home
    // Использует глобальный слой 'app'
  },
  
  '/admin': {
    component: Admin,
    layout: 'admin'  // Переопределяет на 'admin'
  },
  
  '/login': {
    component: Login,
    layout: 'auth'   // Переопределяет на 'auth'
  }
};
```

### 3. Группы с слоями
```javascript
export const routes = {
  defaultLayout: 'app',  // ← Глобальный слой
  
  '/': Home,  // Использует глобальный слой 'app'
  
  group: {
    prefix: '/user',
    layout: 'user',  // Слой для всей группы
    middleware: ['auth'],
    routes: {
      '/': {
        component: UserDashboard
        // Использует слой группы 'user'
      },
      
      '/profile': {
        component: UserProfile,
        layout: 'profile'  // Переопределяет слой группы
      },
      
      '/settings': {
        component: UserSettings
        // Использует слой группы 'user'
      }
    }
  }
};
```

### 4. Вложенные группы
```javascript
export const routes = {
  defaultLayout: 'app',  // ← Глобальный слой
  
  group: {
    prefix: '/app',
    layout: 'app',  // Слой для всей группы
    middleware: ['auth'],
    routes: {
      '/': Dashboard,  // Использует слой 'app'
      
      group: {
        prefix: '/admin',
        layout: 'admin',  // Переопределяет слой 'app'
        middleware: ['admin'],
        routes: {
          '/': AdminDashboard,  // Использует слой 'admin'
          '/users': AdminUsers  // Использует слой 'admin'
        }
      }
    }
  }
};
```

## Layout компоненты

### 1. Глобальный слой
```javascript
// layouts/AppLayout.svelte
<script>
  export let component;
</script>

<div class="app-layout">
  <header>My App</header>
  <main>
    <svelte:component this={component} />
  </main>
  <footer>Footer</footer>
</div>
```

### 2. Слой группы
```javascript
// layouts/UserLayout.svelte
<script>
  export let component;
</script>

<div class="user-layout">
  <nav class="user-sidebar">User Menu</nav>
  <main class="user-content">
    <svelte:component this={component} />
  </main>
</div>
```

### 3. Слой роута
```javascript
// layouts/ProfileLayout.svelte
<script>
  export let component;
</script>

<div class="profile-layout">
  <div class="profile-header">Profile Settings</div>
  <div class="profile-content">
    <svelte:component this={component} />
  </div>
</div>
```

## Регистрация слоев

```javascript
import { registerLayout } from 'svelte-router-v5';
import AppLayout from './layouts/AppLayout.svelte';
import UserLayout from './layouts/UserLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';
import ProfileLayout from './layouts/ProfileLayout.svelte';

// Регистрируем все слои
registerLayout('app', AppLayout);
registerLayout('user', UserLayout);
registerLayout('admin', AdminLayout);
registerLayout('profile', ProfileLayout);
```

## Как это работает внутри

### 1. RouterView определяет слой
```javascript
// RouterView.svelte
<script>
  export let currentComponent;
  
  // Определяем слой по приоритету
  const layout = currentComponent.layout || 
                 currentComponent.groupLayout || 
                 currentComponent.defaultLayout;
  
  const component = currentComponent.component;
</script>

{#if layout}
  <svelte:component this={layout} {component} />
{:else}
  <svelte:component this={component} />
{/if}
```

### 2. Navigation.js передает информацию о слоях
```javascript
// Navigation.js
currentComponent.set({
  component,
  layout: routeLayout,           // Слой роута
  groupLayout: groupLayout,     // Слой группы
  defaultLayout: defaultLayout, // Глобальный слой
  props: { ... }
});
```

## Преимущества

1. **Гибкость** - каждый уровень может переопределить слой
2. **Простота** - не нужно дублировать слои
3. **Иерархия** - понятная структура слоев
4. **Обратная совместимость** - старые роуты работают без слоев
5. **Переиспользование** - один слой для многих роутов

## Что нужно реализовать

1. **defaultLayout** в createNavigation()
2. **Поддержка layout в группах** - layout для групп роутов
3. **Приоритет слоев** - роут > группа > глобальный
4. **RouterView** - обновить для поддержки иерархии
5. **Navigation.js** - передавать информацию о слоях

## Заключение

Теперь у нас есть полная иерархия слоев:
- **Глобальный слой** - для всех роутов
- **Группа слой** - для группы роутов
- **Роут слой** - для конкретного роута

Каждый уровень может переопределить слой выше! 🎯
