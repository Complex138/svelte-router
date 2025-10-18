# Route Groups

## Description

System for grouping routes with common prefixes, middleware, and hooks. Allows organizing code and avoiding configuration duplication.

## Syntax

### Basic Group

```javascript
export const routes = {
  '/': Home,

  group: {
    prefix: '/admin',           // Prefix for all routes in group
    middleware: ['auth'],       // Common middleware
    beforeEnter: (ctx) => {...}, // Common beforeEnter hook
    afterEnter: (ctx) => {...},  // Common afterEnter hook
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers,
      '/settings': AdminSettings
    }
  }
};
```

### Nested Groups

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

### With Lazy Loading

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

// Or with lazyGroup
const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/Admin.svelte'),
  '/admin/users': () => import('./pages/AdminUsers.svelte')
}, {
  middleware: ['auth', 'admin']
});
```

## Group Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `prefix` | String | Prefix for all routes in group |
| `middleware` | Array | Array of middleware for all routes |
| `beforeEnter` | Function | Hook before entering any group route |
| `afterEnter` | Function | Hook after leaving any group route |
| `routes` | Object | Object with group routes |

## Usage Examples

### Admin Panel

```javascript
// routes.js
import { lazy } from 'svelte-router-v5';

export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),

  group: {
    prefix: '/admin',
    middleware: ['auth', 'admin'],
    beforeEnter: async (context) => {
      console.log(`Entering admin from ${context.from}`);
      return true;
    },
    afterEnter: async (context) => {
      console.log(`Leaving admin to ${context.to}`);
      return true;
    },
    routes: {
      '/': lazy(() => import('./pages/admin/Dashboard.svelte')),
      '/users': lazy(() => import('./pages/admin/Users.svelte')),
      '/settings': {
        component: lazy(() => import('./pages/admin/Settings.svelte')),
        middleware: ['audit'] // Additional middleware
      },
      '/reports': lazy(() => import('./pages/admin/Reports.svelte'))
    }
  },

  '/login': lazy(() => import('./pages/Login.svelte')),
  '*': lazy(() => import('./pages/NotFound.svelte'))
};

// Result after processing:
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

### User Routes

```javascript
// routes.js
export const routes = {
  '/': Home,

  group: {
    prefix: '/user',
    layout: 'user',  // Layout for entire group
    middleware: ['auth'],
    routes: {
      '/': {
        component: UserDashboard,
        beforeEnter: async (context) => {
          // Load user data
          const userData = await fetchUserData();
          context.props.userData = userData;
          return true;
        }
      },
      '/profile': UserProfile,
      '/settings': {
        component: UserSettings,
        layout: 'settings'  // Overrides group layout
      },
      '/orders': UserOrders
    }
  }
};
```

### API Routes

```javascript
// routes.js
export const routes = {
  group: {
    prefix: '/api',
    beforeEnter: async (context) => {
      // Common checks for API routes
      const apiKey = context.query.apiKey;
      if (!apiKey) {
        return false; // Block access
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

### Nested Groups

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

// Result:
// /app/dashboard - middleware: ['auth']
// /app/admin - middleware: ['auth', 'admin']
// /app/admin/users - middleware: ['auth', 'admin']
// /app/admin/advanced - middleware: ['auth', 'admin', 'super-admin']
// /app/admin/advanced/system - middleware: ['auth', 'admin', 'super-admin']
// /app/profile - middleware: ['auth']
```

## Practical Examples

### E-commerce Application

```javascript
// routes.js
import { lazyGroup } from 'svelte-router-v5';

const catalogRoutes = lazyGroup({
  '/catalog': () => import('./pages/catalog/Index.svelte'),
  '/catalog/:category': () => import('./pages/catalog/Category.svelte'),
  '/product/:id': () => import('./pages/catalog/Product.svelte')
}, {
  beforeEnter: async (context) => {
    // Load product categories
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

### Social Network

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

## Important Notes

1. **Prefix required** - Each group must have a prefix
2. **Inheritance** - Child groups inherit parent settings
3. **Middleware merging** - Group middleware merges with route middleware
4. **Hooks** - beforeEnter and afterEnter hooks are chained together

## Related Functions

- [`lazyGroup`](lazy-loading.md) - Lazy loading for groups
- [`middleware`](middleware.md) - Middleware system