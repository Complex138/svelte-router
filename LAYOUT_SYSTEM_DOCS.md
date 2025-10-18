# Система Layout'ов для svelte-router-v5 🎨

## Обзор

Система layout'ов позволяет оборачивать компоненты роутов в общие layout'ы, создавая единообразный дизайн и структуру приложения.

## Иерархия layout'ов

Система поддерживает 3 уровня layout'ов с приоритетом:

1. **Роут layout** - `layout` в конкретном роуте (высший приоритет)
2. **Группа layout** - `layout` в группе роутов
3. **Глобальный layout** - `defaultLayout` в конфигурации роутов (низший приоритет)

## Быстрый старт

### 1. Регистрация layout'ов

```javascript
import { registerLayout } from 'svelte-router-v5';
import AppLayout from './layouts/AppLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';

// Регистрируем layout'ы
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);
```

### 2. Конфигурация роутов

```javascript
export const routes = {
  // Глобальный layout для всего приложения
  defaultLayout: 'app',
  
  '/': {
    component: Home
    // Использует глобальный layout 'app'
  },
  
  '/admin': {
    component: Admin,
    layout: 'admin'  // Переопределяет на 'admin'
  }
};
```

### 3. Использование в App.svelte

```javascript
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<RouterView currentComponent={$currentComponent} />
```

## Примеры использования

### 1. Базовое использование

```javascript
export const routes = {
  defaultLayout: 'app',  // Глобальный layout
  
  '/': Home,  // Использует layout 'app'
  '/about': About,  // Использует layout 'app'
  
  '/admin': {
    component: Admin,
    layout: 'admin'  // Переопределяет на 'admin'
  }
};
```

### 2. Группы с layout'ами

```javascript
export const routes = {
  defaultLayout: 'app',
  
  group: {
    prefix: '/user',
    layout: 'user',  // Layout для всей группы
    middleware: ['auth'],
    routes: {
      '/': UserDashboard,  // Использует layout 'user'
      '/profile': UserProfile,  // Использует layout 'user'
      '/settings': {
        component: UserSettings,
        layout: 'profile'  // Переопределяет layout группы
      }
    }
  }
};
```

### 3. Роут без layout

```javascript
export const routes = {
  defaultLayout: 'app',
  
  '/login': {
    component: Login,
    layout: null  // Без layout
  }
};
```

## Создание layout компонентов

### 1. Базовый layout

```javascript
<!-- AppLayout.svelte -->
<script>
  export let component;  // Получает компонент роута
</script>

<div class="app-layout">
  <header>My App</header>
  <main>
    <svelte:component this={component} />
  </main>
  <footer>Footer</footer>
</div>
```

### 2. Layout с настройками

```javascript
<!-- AdminLayout.svelte -->
<script>
  export let component;
  export let sidebar = true;
  export let header = 'Admin Panel';
</script>

<div class="admin-layout">
  {#if sidebar}
    <aside>Admin Menu</aside>
  {/if}
  <main>
    <h1>{header}</h1>
    <svelte:component this={component} />
  </main>
</div>
```

## API Reference

### registerLayout(name, component)
Регистрирует layout компонент.

**Параметры:**
- `name` (string) - Имя layout
- `component` (Component) - Svelte компонент

### getLayout(name)
Получает layout компонент по имени.

**Параметры:**
- `name` (string) - Имя layout

**Возвращает:** Component или null

### hasLayout(name)
Проверяет, зарегистрирован ли layout.

**Параметры:**
- `name` (string) - Имя layout

**Возвращает:** boolean

### loadLayouts(layoutsPath)
Автоматически загружает layout'ы из папки.

**Параметры:**
- `layoutsPath` (string) - Путь к папке с layout'ами

**Пример:**
```javascript
import { loadLayouts } from 'svelte-router-v5';

// Автоматически загружает все .svelte файлы из папки layouts/
loadLayouts('./layouts');
```

## Конфигурация роутов

### Глобальные настройки

```javascript
export const routes = {
  // Глобальный layout для всех роутов
  defaultLayout: 'app',
  
  // Другие глобальные настройки
  defaultMiddleware: ['auth'],
  defaultGuards: {
    beforeEnter: (ctx) => console.log('Entering route')
  },
  
  // Роуты...
};
```

### Layout в роутах

```javascript
export const routes = {
  '/admin': {
    component: Admin,
    layout: 'admin'  // Layout для этого роута
  }
};
```

### Layout в группах

```javascript
export const routes = {
  group: {
    prefix: '/user',
    layout: 'user',  // Layout для всей группы
    routes: {
      '/': UserDashboard  // Использует layout 'user'
    }
  }
};
```

## Преимущества

1. **Модульность** - каждый layout в отдельном компоненте
2. **Переиспользование** - один layout для многих роутов
3. **Иерархия** - понятная структура layout'ов
4. **Гибкость** - каждый уровень может переопределить layout
5. **Простота** - не нужно менять существующий код
6. **Обратная совместимость** - старые роуты работают без layout'ов

## Обратная совместимость

Все существующие API остаются рабочими:
- Плоские роуты работают как прежде
- Группы роутов работают как прежде
- Middleware система не изменилась
- Lazy loading работает как прежде

Система layout'ов - это **дополнение**, а не замена существующей функциональности.

## Заключение

Система layout'ов предоставляет:
- 🎨 **Единообразный дизайн** для всего приложения
- 🏗️ **Модульную архитектуру** layout'ов
- 🔧 **Гибкую настройку** с иерархией приоритетов
- 📱 **Адаптивность** для разных устройств
- 🚀 **Производительность** с lazy loading

Это делает svelte-router-v5 еще более мощным для создания сложных приложений! 🎯
