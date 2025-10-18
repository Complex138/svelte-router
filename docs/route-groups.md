# Группы роутов - Route Groups

## Описание

Система для группировки роутов с общими префиксами, middleware и хуками. Позволяет организовать код и избежать дублирования настроек.

## Синтаксис

### Базовая группа

```javascript
export const routes = {
  '/': Home,

  group: {
    prefix: '/admin',           // Префикс для всех роутов в группе
    middleware: ['auth'],       // Общий middleware
    beforeEnter: (ctx) => {...}, // Общий beforeEnter хук
    afterEnter: (ctx) => {...},  // Общий afterEnter хук
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers,
      '/settings': AdminSettings
    }
  }
};
```

### Вложенные группы

```javascript
export const routes = {
  group: {
    prefix: '/app',
    middleware: ['auth'],
    routes: {
      '/profile': Profile,

      group: {
        prefix: '/admin',
        middleware: ['admin'],
        routes: {
          '/': AdminDashboard,
          '/users': AdminUsers
        }
      }
    }
  }
};
```

### С lazy loading

```javascript
import { lazy, lazyGroup } from 'svelte-router-v5';

export const routes = {
  group: {
    prefix: '/admin',
    middleware: ['auth', 'admin'],
    routes: {
      '/': lazy(() => import('./pages/Admin.svelte')),
      '/users': lazy(() => import('./pages/AdminUsers.svelte'))
    }
  }
};

// Или с lazyGroup
const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/Admin.svelte'),
  '/admin/users': () => import('./pages/AdminUsers.svelte')
}, {
  middleware: ['auth', 'admin']
});
```

## Параметры группы

| Параметр | Тип | Описание |
|----------|-----|----------|
| `prefix` | String | Префикс для всех роутов в группе |
| `middleware` | Array | Массив middleware для всех роутов |
| `beforeEnter` | Function | Хук перед входом в любой роут группы |
| `afterEnter` | Function | Хук после выхода из любого роута группы |
| `routes` | Object | Объект с роутами группы |

## Примеры использования

### Админ панель

```javascript
// routes.js
import { lazy } from 'svelte-router-v5';

export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),

  group: {
    prefix: '/admin',
    middleware: ['auth', 'admin'],
    beforeEnter: async (context) => {
      console.log(`Вход в админку с ${context.from}`);
      return true;
    },
    afterEnter: async (context) => {
      console.log(`Выход из админки на ${context.to}`);
      return true;
    },
    routes: {
      '/': lazy(() => import('./pages/admin/Dashboard.svelte')),
      '/users': lazy(() => import('./pages/admin/Users.svelte')),
      '/settings': {
        component: lazy(() => import('./pages/admin/Settings.svelte')),
        middleware: ['audit'] // Дополнительный middleware
      },
      '/reports': lazy(() => import('./pages/admin/Reports.svelte'))
    }
  },

  '/login': lazy(() => import('./pages/Login.svelte')),
  '*': lazy(() => import('./pages/NotFound.svelte'))
};

// Результат после обработки:
// {
//   '/': Home,
//   '/admin': Dashboard (middleware: ['auth', 'admin']),
//   '/admin/users': Users (middleware: ['auth', 'admin']),
//   '/admin/settings': Settings (middleware: ['auth', 'admin', 'audit']),
//   '/admin/reports': Reports (middleware: ['auth', 'admin']),
//   '/login': Login,
//   '*': NotFound
// }
```

### Пользовательские роуты

```javascript
// routes.js
export const routes = {
  '/': Home,

  group: {
    prefix: '/user',
    layout: 'user',  // Layout для всей группы
    middleware: ['auth'],
    routes: {
      '/': {
        component: UserDashboard,
        beforeEnter: async (context) => {
          // Загружаем данные пользователя
          const userData = await fetchUserData();
          context.props.userData = userData;
          return true;
        }
      },
      '/profile': UserProfile,
      '/settings': {
        component: UserSettings,
        layout: 'settings'  // Переопределяет layout группы
      },
      '/orders': UserOrders
    }
  }
};
```

### API роуты

```javascript
// routes.js
export const routes = {
  group: {
    prefix: '/api',
    beforeEnter: async (context) => {
      // Общие проверки для API роутов
      const apiKey = context.query.apiKey;
      if (!apiKey) {
        return false; // Блокируем доступ
      }
      return true;
    },
    routes: {
      '/users': {
        component: APIUsers,
        middleware: ['rate-limit']
      },
      '/posts': {
        component: APIPosts,
        middleware: ['rate-limit', 'validate-post-data']
      }
    }
  }
};
```

### Вложенные группы

```javascript
// routes.js
export const routes = {
  '/': Home,

  group: {
    prefix: '/app',
    middleware: ['auth'],
    routes: {
      '/dashboard': Dashboard,

      group: {
        prefix: '/admin',
        middleware: ['admin'],
        routes: {
          '/': AdminDashboard,
          '/users': AdminUsers,

          group: {
            prefix: '/advanced',
            middleware: ['super-admin'],
            routes: {
              '/': SuperAdminDashboard,
              '/system': SystemSettings
            }
          }
        }
      },

      '/profile': UserProfile
    }
  }
};

// Результат:
// /app/dashboard - middleware: ['auth']
// /app/admin - middleware: ['auth', 'admin']
// /app/admin/users - middleware: ['auth', 'admin']
// /app/admin/advanced - middleware: ['auth', 'admin', 'super-admin']
// /app/admin/advanced/system - middleware: ['auth', 'admin', 'super-admin']
// /app/profile - middleware: ['auth']
```

## Практические примеры

### E-commerce приложение

```javascript
// routes.js
import { lazyGroup } from 'svelte-router-v5';

const catalogRoutes = lazyGroup({
  '/catalog': () => import('./pages/catalog/Index.svelte'),
  '/catalog/:category': () => import('./pages/catalog/Category.svelte'),
  '/product/:id': () => import('./pages/catalog/Product.svelte')
}, {
  beforeEnter: async (context) => {
    // Загружаем категории товаров
    const categories = await fetchCategories();
    context.props.categories = categories;
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

const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/admin/Dashboard.svelte'),
  '/admin/products': () => import('./pages/admin/Products.svelte'),
  '/admin/orders': () => import('./pages/admin/Orders.svelte'),
  '/admin/users': () => import('./pages/admin/Users.svelte')
}, {
  middleware: ['auth', 'admin']
});

export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),

  ...catalogRoutes,
  ...cartRoutes,
  ...adminRoutes,

  '/login': lazy(() => import('./pages/auth/Login.svelte')),
  '/register': lazy(() => import('./pages/auth/Register.svelte')),

  '*': lazy(() => import('./pages/NotFound.svelte'))
};
```

### Социальная сеть

```javascript
// routes.js
export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),

  group: {
    prefix: '/groups',
    routes: {
      '/': lazy(() => import('./pages/groups/Index.svelte')),
      '/:id': lazy(() => import('./pages/groups/Group.svelte')),

      group: {
        prefix: '/management',
        middleware: ['group-admin'],
        routes: {
          '/': lazy(() => import('./pages/groups/Management.svelte')),
          '/members': lazy(() => import('./pages/groups/Members.svelte')),
          '/settings': lazy(() => import('./pages/groups/Settings.svelte'))
        }
      }
    }
  },

  group: {
    prefix: '/events',
    routes: {
      '/': lazy(() => import('./pages/events/Index.svelte')),
      '/:id': lazy(() => import('./pages/events/Event.svelte')),
      '/create': {
        component: lazy(() => import('./pages/events/Create.svelte')),
        middleware: ['auth']
      }
    }
  },

  '/messages': {
    component: lazy(() => import('./pages/Messages.svelte')),
    middleware: ['auth']
  },

  '/profile/:id': lazy(() => import('./pages/Profile.svelte')),

  '/login': lazy(() => import('./pages/auth/Login.svelte'))
};
```

## Важные замечания

1. **Префикс обязателен** - Каждая группа должна иметь префикс
2. **Наследование** - Дочерние группы наследуют настройки родителей
3. **Слияние middleware** - Middleware группы объединяются с middleware роутов
4. **Хуки** - beforeEnter и afterEnter хуки объединяются цепочкой

## Связанные функции

- [`lazyGroup`](lazy-loading.md) - Lazy loading для групп
- [`middleware`](middleware.md) - Система middleware
