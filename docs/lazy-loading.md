# Lazy Loading - Ленивая загрузка

## Описание

Система для ленивой загрузки компонентов роутов. Позволяет загружать компоненты только когда они нужны, улучшая производительность приложения.

## Синтаксис

### Простая ленивая загрузка

```javascript
import { lazy } from 'svelte-router-v5';

export const routes = {
  '/': () => import('./pages/Home.svelte'),
  '/about': () => import('./pages/About.svelte'),
  '/user/:id': () => import('./pages/User.svelte')
};
```

### С middleware

```javascript
import { lazyRoute } from 'svelte-router-v5';

export const routes = {
  '/profile': lazyRoute(() => import('./pages/Profile.svelte'), {
    middleware: ['auth'],
    beforeEnter: (context) => {
      console.log('Загрузка профиля');
      return true;
    }
  })
};
```

### Группы роутов

```javascript
import { lazyGroup } from 'svelte-router-v5';

const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/admin/Dashboard.svelte'),
  '/admin/users': () => import('./pages/admin/Users.svelte'),
  '/admin/settings': () => import('./pages/admin/Settings.svelte')
}, {
  middleware: ['auth', 'admin']
});

export const routes = {
  '/': () => import('./pages/Home.svelte'),
  ...adminRoutes
};
```

## Функции

### lazy(importFn)

Создает лениво загружаемый компонент.

**Параметры:**
- `importFn` (Function) - Функция динамического импорта

**Возвращает:** Функция, возвращающая Promise с компонентом

### lazyRoute(importFn, config)

Создает лениво загружаемый роут с дополнительной конфигурацией.

**Параметры:**
- `importFn` (Function) - Функция динамического импорта
- `config` (Object) - Конфигурация роута (middleware, beforeEnter, etc.)

**Возвращает:** Объект конфигурации роута

### lazyGroup(routes, sharedConfig)

Создает группу лениво загружаемых роутов с общей конфигурацией.

**Параметры:**
- `routes` (Object) - Объект с роутами
- `sharedConfig` (Object) - Общая конфигурация для всех роутов

**Возвращает:** Объект с настроенными роутами

## Примеры использования

### Базовая ленивая загрузка

```javascript
// routes.js
import { lazy } from 'svelte-router-v5';

export const routes = {
  '/': () => import('./pages/Home.svelte'),
  '/about': () => import('./pages/About.svelte'),
  '/contact': () => import('./pages/Contact.svelte'),
  '/blog/:id': () => import('./pages/BlogPost.svelte'),
  '/user/:id': () => import('./pages/UserProfile.svelte'),
  '*': () => import('./pages/NotFound.svelte')
};

// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<RouterView currentComponent={$currentComponent} />
```

### Смешанная загрузка

```javascript
// routes.js
import Home from './pages/Home.svelte'; // Загружаем сразу
import { lazy, lazyRoute } from 'svelte-router-v5';

export const routes = {
  '/': Home, // Критически важная страница - загружаем сразу

  '/about': lazy(() => import('./pages/About.svelte')), // Второстепенная

  '/dashboard': lazyRoute(() => import('./pages/Dashboard.svelte'), {
    middleware: ['auth']
  }),

  '/admin': lazyRoute(() => import('./pages/Admin.svelte'), {
    middleware: ['auth', 'admin']
  }),

  '/settings': lazy(() => import('./pages/Settings.svelte'))
};
```

### Группы роутов с lazy loading

```javascript
// routes.js
import { lazy, lazyGroup } from 'svelte-router-v5';

const publicRoutes = {
  '/': lazy(() => import('./pages/Home.svelte')),
  '/about': lazy(() => import('./pages/About.svelte')),
  '/contact': lazy(() => import('./pages/Contact.svelte'))
};

const authRoutes = lazyGroup({
  '/dashboard': () => import('./pages/Dashboard.svelte'),
  '/profile': () => import('./pages/Profile.svelte'),
  '/settings': () => import('./pages/Settings.svelte')
}, {
  middleware: ['auth']
});

const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/admin/Dashboard.svelte'),
  '/admin/users': () => import('./pages/admin/Users.svelte'),
  '/admin/reports': () => import('./pages/admin/Reports.svelte')
}, {
  middleware: ['auth', 'admin']
});

export const routes = {
  ...publicRoutes,
  ...authRoutes,
  ...adminRoutes,
  '*': lazy(() => import('./pages/NotFound.svelte'))
};
```

## Практические примеры

### Интернет-магазин

```javascript
// routes.js
import { lazy, lazyGroup } from 'svelte-router-v5';

const catalogRoutes = lazyGroup({
  '/catalog': () => import('./pages/catalog/Index.svelte'),
  '/catalog/:category': () => import('./pages/catalog/Category.svelte'),
  '/product/:id': () => import('./pages/catalog/Product.svelte')
}, {
  // Общие данные для каталога
  beforeEnter: async (context) => {
    // Предзагружаем категории товаров
    await preloadCategories();
    return true;
  }
});

const cartRoutes = lazyGroup({
  '/cart': () => import('./pages/cart/Index.svelte'),
  '/checkout': () => import('./pages/cart/Checkout.svelte'),
  '/order/:id': () => import('./pages/cart/Order.svelte')
}, {
  middleware: ['auth']
});

export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),

  ...catalogRoutes,
  ...cartRoutes,

  '/login': lazy(() => import('./pages/auth/Login.svelte')),
  '/register': lazy(() => import('./pages/auth/Register.svelte')),

  '*': lazy(() => import('./pages/NotFound.svelte'))
};
```

### Блог с комментариями

```javascript
// routes.js
import { lazy, lazyRoute } from 'svelte-router-v5';

export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),

  '/blog': lazy(() => import('./pages/blog/Index.svelte')),

  '/blog/:slug': lazyRoute(() => import('./pages/blog/Post.svelte'), {
    beforeEnter: async (context) => {
      // Предзагружаем комментарии для поста
      const comments = await fetchComments(context.params.slug);
      context.props.comments = comments;
      return true;
    }
  }),

  '/admin': lazyRoute(() => import('./pages/admin/Dashboard.svelte'), {
    middleware: ['auth', 'admin']
  })
};
```

### Dashboard с разными разделами

```javascript
// routes.js
import { lazyGroup } from 'svelte-router-v5';

const dashboardRoutes = lazyGroup({
  '/dashboard': () => import('./pages/dashboard/Index.svelte'),
  '/dashboard/analytics': () => import('./pages/dashboard/Analytics.svelte'),
  '/dashboard/reports': () => import('./pages/dashboard/Reports.svelte'),
  '/dashboard/settings': () => import('./pages/dashboard/Settings.svelte'),
  '/dashboard/users': () => import('./pages/dashboard/Users.svelte')
}, {
  middleware: ['auth'],
  beforeEnter: async (context) => {
    // Загружаем общие данные для дашборда
    const user = await fetchCurrentUser();
    context.props.user = user;
    return true;
  }
});

export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),
  '/login': lazy(() => import('./pages/auth/Login.svelte')),

  ...dashboardRoutes,

  '*': lazy(() => import('./pages/NotFound.svelte'))
};
```

## Лучшие практики

1. **Критические страницы** - Загружайте сразу (Home, Login)
2. **Большие компоненты** - Используйте lazy loading для тяжелых страниц
3. **Группировка** - Объединяйте связанные роуты в группы
4. **Общие данные** - Загружайте в beforeEnter хуках
5. **Ошибки** - Обрабатывайте ошибки загрузки

## Связанные функции

- [`prefetchRoute`](prefetch-route.md) - Предзагрузка роутов
- [`LinkTo`](link-to.md) - Компонент с автоматической предзагрузкой
