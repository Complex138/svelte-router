# svelte-router-v5 Documentation Index

## Quick Function Search

### Core Components
- **[createNavigation](create-navigation.md)** - Router creation
- **[RouterView](router-view.md)** - Route rendering
- **[LinkTo](link-to.md)** - Navigation component

### Navigation & URL
- **[navigate](navigate.md)** - Programmatic navigation
- **[generate-url](generate-url.md)** - URL generation

### Parameters & Data
- **[route-parameters](route-parameters.md)** - Route parameters
- **[get-route-params](get-route-params.md)** - Reactive parameters
- **[parameter-helpers](parameter-helpers.md)** - Helper functions

### Middleware System
- **[middleware](middleware.md)** - Middleware overview
- **[register-middleware](register-middleware.md)** - Middleware registration

### Performance
- **[lazy-loading](lazy-loading.md)** - Component lazy loading
- **[prefetch](prefetch.md)** - Component preloading

### Code Organization
- **[route-groups](route-groups.md)** - Route grouping
- **[layouts](layouts.md)** - Template system

### Utilities
- **[register-layout](register-layout.md)** - Layout registration
- **[layout-helpers](layout-helpers.md)** - Layout helper functions

## Task-Based Search

### I want to...

| Task | Files to Study |
|------|----------------|
| Create a router | [`create-navigation`](create-navigation.md) |
| Add navigation links | [`link-to`](link-to.md) |
| Navigate programmatically | [`navigate`](navigate.md) |
| Work with parameters | [`route-parameters`](route-parameters.md), [`get-route-params`](get-route-params.md) |
| Add authentication | [`middleware`](middleware.md), [`register-middleware`](register-middleware.md) |
| Optimize loading | [`lazy-loading`](lazy-loading.md), [`prefetch`](prefetch.md) |
| Organize routes | [`route-groups`](route-groups.md) |
| Create templates | [`layouts`](layouts.md), [`register-layout`](register-layout.md) |
| Generate URLs | [`generate-url`](generate-url.md) |

## Feature-Based Search

### 🚀 Core Features
- **Router Creation** - [`create-navigation`](create-navigation.md)
- **Route Rendering** - [`RouterView`](router-view.md)
- **Navigation Links** - [`LinkTo`](link-to.md)
- **Programmatic Navigation** - [`navigate`](navigate.md)

### 📊 Parameters & Data
- **Route Parameters** - [`route-parameters`](route-parameters.md)
- **Reactive Parameters** - [`get-route-params`](get-route-params.md)
- **Parameter Helpers** - [`parameter-helpers`](parameter-helpers.md)
- **URL Generation** - [`generate-url`](generate-url.md)

### 🛡️ Middleware & Security
- **Middleware System** - [`middleware`](middleware.md)
- **Middleware Registration** - [`register-middleware`](register-middleware.md)
- **Authentication** - [`middleware`](middleware.md)
- **Authorization** - [`middleware`](middleware.md)

### ⚡ Performance
- **Lazy Loading** - [`lazy-loading`](lazy-loading.md)
- **Component Preloading** - [`prefetch`](prefetch.md)
- **Smart Prefetch** - [`prefetch`](prefetch.md)
- **Bundle Splitting** - [`lazy-loading`](lazy-loading.md)

### 📁 Code Organization
- **Route Groups** - [`route-groups`](route-groups.md)
- **Layout System** - [`layouts`](layouts.md)
- **Layout Registration** - [`register-layout`](register-layout.md)
- **Layout Helpers** - [`layout-helpers`](layout-helpers.md)

## Quick Start Guide

### 1. Basic Setup
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

<RouterView currentComponent={$currentComponent} />
```

### 2. Add Navigation
```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<nav>
  <LinkTo route="/">Home</LinkTo>
  <LinkTo route="/about">About</LinkTo>
  <LinkTo route="/user/:id" params={{id: 123}}>User</LinkTo>
</nav>
```

### 3. Work with Parameters
```svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ id, tab } = $getRoutParams);
</script>

<h1>User {id}</h1>
{#if tab}
  <p>Tab: {tab}</p>
{/if}
```

### 4. Add Middleware
```javascript
import { registerMiddleware } from 'svelte-router-v5';

registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('token');
  if (!token) {
    context.navigate('/login');
    return false;
  }
  return true;
});

export const routes = {
  '/': Home,
  '/profile': {
    component: Profile,
    middleware: ['auth']
  }
};
```

### 5. Add Layouts
```javascript
import { registerLayout } from 'svelte-router-v5';

registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);

export const routes = {
  defaultLayout: 'app',
  '/': Home,
  '/admin': {
    component: Admin,
    layout: 'admin'
  }
};
```

## Advanced Features

### Lazy Loading
```javascript
import { lazy } from 'svelte-router-v5';

export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),
  '/about': lazy(() => import('./pages/About.svelte'))
};
```

### Route Groups
```javascript
export const routes = {
  group: {
    prefix: '/admin',
    middleware: ['auth', 'admin'],
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers
    }
  }
};
```

### Smart Prefetch
```svelte
<LinkTo route="/dashboard" prefetch="smart">
  Dashboard
</LinkTo>
```

## API Reference

### Core Functions
- `createNavigation(routes)` - Create router
- `navigate(route, params, query)` - Navigate programmatically
- `linkTo(route, params, query)` - Generate URL

### Components
- `RouterView` - Route rendering component
- `LinkTo` - Navigation link component

### Parameters
- `getRoutParams` - Reactive parameter store
- `getRouteParams()` - Get route parameters
- `getQueryParams()` - Get query parameters
- `getAllParams()` - Get all parameters

### Middleware
- `registerMiddleware(name, fn)` - Register middleware
- `registerGlobalMiddleware(type, fn)` - Register global middleware

### Layouts
- `registerLayout(name, component)` - Register layout
- `getLayout(name)` - Get layout
- `hasLayout(name)` - Check layout exists

### Performance
- `lazy(importFn)` - Lazy load component
- `lazyRoute(importFn, config)` - Lazy route with config
- `lazyGroup(routes, config)` - Lazy route group
- `prefetchRoute(route, params, query)` - Prefetch route

## Best Practices

1. **Use lazy loading** for large components
2. **Group related routes** for better organization
3. **Add middleware** for authentication and authorization
4. **Use layouts** for common page structures
5. **Prefetch important routes** for better performance

## Community

- **GitHub**: https://github.com/Complex138/svelte-router
- **Issues**: https://github.com/Complex138/svelte-router/issues
- **Documentation**: [📂 `en/`](en/) - Detailed documentation

## License

MIT - Free use in any projects.

---

**Made with ❤️ for the Svelte community**