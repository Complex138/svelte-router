# Svelte Router v5 Documentation

## Package Overview

**svelte-router-v5** - A powerful router for Svelte 5 with automatic parameter extraction, reactive navigation, regular expression support, and advanced capabilities.

## Main Features

- ✅ **Automatic parameter extraction** - URL parameters are automatically available in components
- ✅ **Regular expressions** - Route parameter validation using regex
- ✅ **Reactive navigation** - Automatic updates when URL changes
- ✅ **Middleware system** - Authentication, authorization, and navigation handling
- ✅ **Lazy loading** - Component lazy loading for better performance
- ✅ **Prefetch system** - Automatic component preloading
- ✅ **Route groups** - Organize routes with shared settings
- ✅ **Layout system** - Common templates for pages
- ✅ **TypeScript support** - Full type safety

## Quick Start

### 1. Installation

```bash
npm install svelte-router-v5
```

### 2. Basic Setup

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
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/user/123">User</a>
  </nav>

  <RouterView currentComponent={$currentComponent} />
</main>
```

### 3. Working with Parameters

```svelte
<!-- User.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';

  $: ({ id, tab, userData } = $getRoutParams);
</script>

<h1>User: {userData?.name || 'Unknown'}</h1>
<p>ID: {id}</p>
<p>Current tab: {tab}</p>
```

## Documentation Structure

Complete documentation is available in the [`en/`](en/) folder with separate files for each feature:

### 🏗️ Core Components
- **[`create-navigation`](en/create-navigation.md)** - Router instance creation
- **[`router-view`](en/router-view.md)** - Route rendering component
- **[`link-to`](en/link-to.md)** - Navigation link component

### 🧭 Navigation & URL
- **[`navigate`](en/navigate.md)** - Programmatic navigation
- **[`generate-url`](en/generate-url.md)** - URL generation without navigation

### 📊 Parameters & Data
- **[`route-parameters`](en/route-parameters.md)** - Route parameters handling
- **[`get-route-params`](en/get-route-params.md)** - Reactive parameters
- **[`parameter-helpers`](en/parameter-helpers.md)** - Helper functions

### 🛡️ Middleware System
- **[`middleware`](en/middleware.md)** - Middleware system overview
- **[`register-middleware`](en/register-middleware.md)** - Middleware registration

### ⚡ Performance
- **[`lazy-loading`](en/lazy-loading.md)** - Component lazy loading
- **[`prefetch`](en/prefetch.md)** - Preloading system

### 📁 Code Organization
- **[`route-groups`](en/route-groups.md)** - Route grouping
- **[`layouts`](en/layouts.md)** - Page template system

### 🔧 Utilities
- **[`register-layout`](en/register-layout.md)** - Layout registration
- **[`layout-helpers`](en/layout-helpers.md)** - Layout helper functions

## Task-Based Search

| Task | Files to Study |
|------|----------------|
| Create a router | [`create-navigation`](en/create-navigation.md) |
| Add navigation | [`link-to`](en/link-to.md) |
| Work with parameters | [`route-parameters`](en/route-parameters.md) |
| Add authentication | [`middleware`](en/middleware.md) |
| Optimize loading | [`lazy-loading`](en/lazy-loading.md) |
| Organize code | [`route-groups`](en/route-groups.md) |
| Create templates | [`layouts`](en/layouts.md) |

## 📖 API Reference

### Components

#### `createNavigation(routesConfig)`

Creates a router instance with route configuration.

```javascript
const currentComponent = createNavigation({
  defaultLayout: 'app',
  defaultMiddleware: ['auth'],
  '/': Home,
  '/dashboard': Dashboard
});
```

#### `RouterView`

Renders the current route with layout support and loading states.

```svelte
<RouterView
  currentComponent={$currentComponent}
  loadingComponent={LoadingSpinner}
  errorComponent={ErrorPage}
/>
```

#### `LinkTo`

Creates navigation links with preloading.

```svelte
<LinkTo
  route="/user/:id"
  params={{id: 123}}
  queryParams={{tab: 'profile'}}
  prefetch="smart"
>
  User Profile
</LinkTo>
```

### Navigation Functions

#### `navigate(route, paramsOrConfig, queryParams?, additionalProps?)`

Programmatic navigation with three parameter formats.

```javascript
// Method 1: Old format
navigate('/user/:id', {id: 123});

// Method 2: New format
navigate('/user/:id', {
  params: {id: 123},
  queryParams: {tab: 'profile'},
  props: {userData: {...}}
});

// Method 3: Auto-detection
navigate('/user/:id', {
  id: 123,                    // Goes to params
  userData: {...},           // Goes to props
  tab: 'profile'             // Goes to query
});
```

#### `linkTo(route, params, queryParams)`

URL generation without navigation.

```javascript
const url = linkTo('/user/:id', {id: 123}, {tab: 'profile'});
// '/user/123?tab=profile'
```

### Middleware Functions

#### `registerMiddleware(name, middlewareFunction)`

Register a middleware function.

```javascript
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('token');
  if (!token) {
    context.navigate('/login');
    return false;
  }
  return true;
});
```

#### `registerGlobalMiddleware(type, middlewareFunction)`

Register global middleware.

```javascript
registerGlobalMiddleware('before', async (context) => {
  console.log('Before navigation');
  return true;
});
```

### Layout Functions

#### `registerLayout(name, component)`

Register a layout component.

```javascript
registerLayout('admin', AdminLayout);
```

## 🔧 Route Configuration

### Global Settings

```javascript
export const routes = {
  // Global layout for all routes
  defaultLayout: 'app',

  // Global middleware for all routes
  defaultMiddleware: ['auth'],

  // Global guards
  defaultGuards: {
    beforeEnter: (ctx) => console.log('Entering route'),
    afterEnter: (ctx) => console.log('Leaving route')
  },

  // Routes
  '/': Home,
  '/dashboard': Dashboard
};
```

### Route Groups

```javascript
export const routes = {
  group: {
    prefix: '/admin',
    layout: 'admin',
    middleware: ['auth', 'admin'],
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers,
      '/settings': {
        component: AdminSettings,
        middleware: ['audit']
      }
    }
  }
};
```

### Routes with Parameters

```javascript
export const routes = {
  // Simple parameters
  '/user/:id': User,

  // With regular expressions
  '/user/id/:id(\\d+)': User,                    // Only digits
  '/user/name/:name([a-zA-Z]+)': User,           // Only letters
  '/post/:id(\\d+)/:action(edit|delete)': Post,  // Specific values

  // Multiple parameters
  '/user/:userId/post/:postId': Post,

  // With middleware
  '/profile': {
    component: Profile,
    middleware: ['auth']
  }
};
```

## 🚀 Best Practices

### Code Organization

```javascript
// routes/main.js - main routes
export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),
  '/about': lazy(() => import('./pages/About.svelte'))
};

// routes/auth.js - authentication
export const authRoutes = {
  '/login': lazy(() => import('./pages/auth/Login.svelte')),
  '/register': lazy(() => import('./pages/auth/Register.svelte'))
};

// routes/admin.js - admin panel
export const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/admin/Dashboard.svelte'),
  '/admin/users': () => import('./pages/admin/Users.svelte')
}, {
  middleware: ['auth', 'admin']
});

// Combine all
export const routes = {
  ...mainRoutes,
  ...authRoutes,
  ...adminRoutes
};
```

### Performance

```javascript
// Use lazy loading for large components
export const routes = {
  '/': Home, // Small component - load immediately
  '/dashboard': lazy(() => import('./pages/Dashboard.svelte')), // Large
  '/admin': lazy(() => import('./pages/Admin.svelte')) // Large
};

// Configure preloading
<LinkTo route="/dashboard" prefetch="smart">
  Dashboard
</LinkTo>
```

### Security

```javascript
// Authentication middleware
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('token');
  if (!token) {
    context.navigate('/login');
    return false;
  }

  // Validate token
  try {
    await validateToken(token);
    return true;
  } catch (error) {
    localStorage.removeItem('token');
    context.navigate('/login');
    return false;
  }
});

// Usage in routes
export const routes = {
  defaultMiddleware: ['auth'], // Automatically for all routes

  '/login': {
    component: Login,
    middleware: [] // Exclude authentication
  }
};
```

## Community

- **Documentation**: [📂 `en/`](en/) - Detailed documentation
- **GitHub**: https://github.com/Complex138/svelte-router
- **Issues**: https://github.com/Complex138/svelte-router/issues

## License

MIT - Free use in any projects.

---

**Made with ❤️ for the Svelte community**
