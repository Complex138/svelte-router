# Lazy Loading

## Description

System for lazy loading route components. Allows loading components only when needed, improving application performance.

## Syntax

### Simple Lazy Loading

```javascript
import { lazy } from 'svelte-router-v5';

export const routes = {
  '/': () => import('./pages/Home.svelte'),
  '/about': () => import('./pages/About.svelte'),
  '/user/:id': () => import('./pages/User.svelte')
};
```

### With Middleware

```javascript
import { lazyRoute } from 'svelte-router-v5';

export const routes = {
  '/profile': lazyRoute(() => import('./pages/Profile.svelte'), {
    middleware: ['auth'],
    beforeEnter: (context) => {
      console.log('Loading profile');
      return true;
    }
  })
};
```

### Lazy Groups

```javascript
import { lazyGroup } from 'svelte-router-v5';

const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/admin/Dashboard.svelte'),
  '/admin/users': () => import('./pages/admin/Users.svelte'),
  '/admin/settings': () => import('./pages/admin/Settings.svelte')
}, {
  middleware: ['auth', 'admin'],
  beforeEnter: (context) => {
    console.log('Entering admin area');
    return true;
  }
});

export const routes = {
  '/': () => import('./pages/Home.svelte'),
  ...adminRoutes
};
```

## Helper Functions

### `lazy(importFunction)`

Creates a lazy-loaded component.

```javascript
import { lazy } from 'svelte-router-v5';

const LazyComponent = lazy(() => import('./pages/HeavyComponent.svelte'));

export const routes = {
  '/heavy': LazyComponent
};
```

### `lazyRoute(importFunction, config)`

Creates a lazy route with configuration.

```javascript
import { lazyRoute } from 'svelte-router-v5';

export const routes = {
  '/dashboard': lazyRoute(() => import('./pages/Dashboard.svelte'), {
    middleware: ['auth'],
    beforeEnter: async (context) => {
      const user = await fetchUser();
      context.props.user = user;
      return true;
    }
  })
};
```

### `lazyGroup(routes, config)`

Creates a group of lazy routes.

```javascript
import { lazyGroup } from 'svelte-router-v5';

const userRoutes = lazyGroup({
  '/profile': () => import('./pages/Profile.svelte'),
  '/settings': () => import('./pages/Settings.svelte'),
  '/orders': () => import('./pages/Orders.svelte')
}, {
  middleware: ['auth'],
  layout: 'user'
});

export const routes = {
  '/': () => import('./pages/Home.svelte'),
  ...userRoutes
};
```

## Usage Examples

### Basic Application

```javascript
// routes.js
import { lazy } from 'svelte-router-v5';

export const routes = {
  '/': () => import('./pages/Home.svelte'),
  '/about': () => import('./pages/About.svelte'),
  '/contact': () => import('./pages/Contact.svelte'),
  '/products': () => import('./pages/Products.svelte'),
  '/product/:id': () => import('./pages/Product.svelte'),
  '/cart': () => import('./pages/Cart.svelte'),
  '/checkout': () => import('./pages/Checkout.svelte'),
  '/login': () => import('./pages/auth/Login.svelte'),
  '/register': () => import('./pages/auth/Register.svelte'),
  '*': () => import('./pages/NotFound.svelte')
};
```

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
  '/': () => import('./pages/Home.svelte'),
  ...catalogRoutes,
  ...cartRoutes,
  ...adminRoutes,
  '/login': () => import('./pages/auth/Login.svelte'),
  '*': () => import('./pages/NotFound.svelte')
};
```

### Social Network

```javascript
// routes.js
import { lazyGroup } from 'svelte-router-v5';

const userRoutes = lazyGroup({
  '/profile': () => import('./pages/user/Profile.svelte'),
  '/settings': () => import('./pages/user/Settings.svelte'),
  '/friends': () => import('./pages/user/Friends.svelte'),
  '/messages': () => import('./pages/user/Messages.svelte')
}, {
  middleware: ['auth'],
  layout: 'user'
});

const groupRoutes = lazyGroup({
  '/groups': () => import('./pages/groups/Index.svelte'),
  '/groups/:id': () => import('./pages/groups/Group.svelte'),
  '/groups/:id/management': () => import('./pages/groups/Management.svelte')
}, {
  middleware: ['auth']
});

export const routes = {
  '/': () => import('./pages/Home.svelte'),
  ...userRoutes,
  ...groupRoutes,
  '/login': () => import('./pages/auth/Login.svelte'),
  '*': () => import('./pages/NotFound.svelte')
};
```

## Performance Benefits

### Bundle Splitting

Lazy loading automatically splits your bundle:

```javascript
// Before: All components in main bundle
export const routes = {
  '/': Home,
  '/about': About,
  '/contact': Contact
};

// After: Components loaded on demand
export const routes = {
  '/': () => import('./pages/Home.svelte'),
  '/about': () => import('./pages/About.svelte'),
  '/contact': () => import('./pages/Contact.svelte')
};
```

### Loading States

RouterView automatically handles loading states:

```svelte
<!-- App.svelte -->
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<RouterView 
  currentComponent={$currentComponent}
  loadingComponent={LoadingSpinner}
  errorComponent={ErrorPage}
/>
```

### Preloading

Components can be preloaded:

```javascript
import { preload } from 'svelte-router-v5';

// Preload component
preload(() => import('./pages/HeavyComponent.svelte'));

// Preload on user interaction
document.addEventListener('mouseover', (e) => {
  if (e.target.matches('[data-route="/heavy"]')) {
    preload(() => import('./pages/HeavyComponent.svelte'));
  }
});
```

## Best Practices

1. **Route-based splitting** - Split by routes, not by components
2. **Group related routes** - Use lazyGroup for related functionality
3. **Preload important routes** - Preload critical user paths
4. **Handle loading states** - Provide loading feedback
5. **Error boundaries** - Handle loading errors gracefully

## Related Functions

- [`preload`](prefetch.md) - Component preloading
- [`lazyGroup`](route-groups.md) - Route grouping with lazy loading