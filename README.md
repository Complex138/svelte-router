# 🚀 Svelte Router v5

**A powerful and flexible router for Svelte 5** with automatic parameter extraction, reactive navigation, regular expression support, and advanced capabilities.

[![npm version](https://badge.fury.io/js/svelte-router-v5.svg)](https://badge.fury.io/js/svelte-router-v5)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🇷🇺 **[Русская документация](docs/README.md)** | 🇺🇸 **English Documentation**

## ✨ Main Features

- 🎯 **Automatic parameter extraction** from URL routes
- 🔄 **Reactive navigation** with Svelte stores
- 🎭 **Regular expression support** for route validation
- 🛡️ **Powerful middleware system** with global settings
- ⚡ **Lazy loading** of components for optimization
- 🚀 **Smart preloading** with navigation pattern learning
- 📁 **Route groups** for code organization
- 🎨 **Layout system** with priority hierarchy
- 📝 **Full TypeScript support**
- 🔧 **Production ready**

## 🚀 Quick Start

### Installation

```bash
npm install svelte-router-v5
```

### Basic Setup

```javascript
// routes.js
export const routes = {
  '/': Home,
  '/about': About,
  '/user/:id': User
};

// App.svelte
import { createNavigation, RouterView } from 'svelte-router-v5';
import { routes } from './routes.js';

const currentComponent = createNavigation(routes);
```

```svelte
<!-- App.svelte -->
<nav>
  <LinkTo route="/">Home</LinkTo>
  <LinkTo route="/about">About</LinkTo>
  <LinkTo route="/user/123">User</LinkTo>
</nav>

<RouterView currentComponent={$currentComponent} />
```

### Working with Parameters

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

## 📚 Documentation

Complete documentation is available in multiple languages:

### 🇺🇸 **English Documentation**
- **[📂 `docs/en/`](docs/en/)** - Complete English documentation

### 🇷🇺 **Русская документация**
- **[📂 `docs/`](docs/)** - Полная русская документация

### 🏗️ Core Components
- **[`createNavigation`](docs/en/create-navigation.md)** - Router instance creation
- **[`RouterView`](docs/en/router-view.md)** - Route rendering component
- **[`LinkTo`](docs/en/link-to.md)** - Navigation link component

### 🧭 Navigation & URL
- **[`navigate`](docs/en/navigate.md)** - Programmatic navigation
- **[`generate-url`](docs/en/generate-url.md)** - URL generation without navigation

### 📊 Parameters & Data
- **[`route-parameters`](docs/en/route-parameters.md)** - Route parameters handling
- **[`get-route-params`](docs/en/get-route-params.md)** - Reactive parameters
- **[`parameter-helpers`](docs/en/parameter-helpers.md)** - Helper functions

### 🛡️ Middleware System
- **[`middleware`](docs/en/middleware.md)** - Middleware system overview
- **[`register-middleware`](docs/en/register-middleware.md)** - Middleware registration

### ⚡ Performance
- **[`lazy-loading`](docs/en/lazy-loading.md)** - Component lazy loading
- **[`prefetch`](docs/en/prefetch.md)** - Preloading system

### 📁 Code Organization
- **[`route-groups`](docs/en/route-groups.md)** - Route grouping
- **[`layouts`](docs/en/layouts.md)** - Page template system

### 🔧 Utilities
- **[`register-layout`](docs/en/register-layout.md)** - Layout registration
- **[`layout-helpers`](docs/en/layout-helpers.md)** - Layout helper functions

## 🎯 Usage Examples

### Simple Application

```javascript
// routes.js
export const routes = {
  '/': Home,
  '/about': About,
  '/contact': Contact
};

// App.svelte
<script>
  import { createNavigation, RouterView, LinkTo } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<header>
  <nav>
    <LinkTo route="/">Home</LinkTo>
    <LinkTo route="/about">About</LinkTo>
    <LinkTo route="/contact">Contact</LinkTo>
  </nav>
</header>

<main>
  <RouterView currentComponent={$currentComponent} />
</main>
```

### With Authentication and Roles

```javascript
// routes.js
import { registerMiddleware } from 'svelte-router-v5';

// Register authentication middleware
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('token');
  if (!token) {
    context.navigate('/login');
    return false;
  }
  return true;
});

registerMiddleware('admin', async (context) => {
  const user = context.props.user;
  if (user?.role !== 'admin') {
    context.navigate('/unauthorized');
    return false;
  }
  return true;
});

export const routes = {
  '/login': Login,

  // Global middleware for entire application
  defaultMiddleware: ['auth'],

  group: {
    prefix: '/admin',
    middleware: ['admin'], // Additional admin rights check
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers,
      '/settings': AdminSettings
    }
  }
};
```

### With Layouts and Preloading

```javascript
// layouts/AppLayout.svelte
<script>
  export let component;
</script>

<div class="app">
  <header>
    <nav>
      <LinkTo route="/" prefetch="smart">Home</LinkTo>
      <LinkTo route="/dashboard" prefetch="smart">Dashboard</LinkTo>
    </nav>
  </header>
  <main>
    <svelte:component this={component} />
  </main>
</div>

// routes.js
import { registerLayout } from 'svelte-router-v5';

registerLayout('app', AppLayout);

export const routes = {
  defaultLayout: 'app',  // Global layout

  '/': lazy(() => import('./pages/Home.svelte')),
  '/dashboard': lazy(() => import('./pages/Dashboard.svelte')),

  group: {
    prefix: '/admin',
    layout: 'admin',  // Layout for admin section
    routes: {
      '/': lazy(() => import('./pages/Admin.svelte'))
    }
  }
};
```

## 🎨 Advanced Features

### Regular Expressions in Routes

```javascript
export const routes = {
  '/user/id/:id(\\d+)': User,                    // Only digits
  '/user/name/:name([a-zA-Z]+)': User,           // Only letters
  '/post/:id(\\d+)/:action(edit|delete)': Post,  // Specific values
  '/api/:version(v\\d+)/:endpoint': API          // Version pattern
};
```

### Route Groups with Shared Settings

```javascript
export const routes = {
  group: {
    prefix: '/admin',
    middleware: ['auth', 'admin'],
    beforeEnter: async (ctx) => {
      console.log(`Entering admin from ${ctx.from}`);
      return true;
    },
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers,
      '/settings': {
        component: AdminSettings,
        middleware: ['audit'] // Additional middleware
      }
    }
  }
};
```

### Smart Preloading

```svelte
<!-- Automatically learns navigation patterns -->
<LinkTo route="/dashboard" prefetch="smart">
  Dashboard
</LinkTo>

<!-- Preload on hover -->
<LinkTo route="/heavy-page" prefetch="hover">
  Heavy Page
</LinkTo>

<!-- Preload when visible -->
<LinkTo route="/lazy-content" prefetch="visible">
  Content
</LinkTo>
```

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

## 🔍 Task-Based Search

| Task | Files to Study |
|------|----------------|
| Create a router | [`create-navigation`](docs/en/create-navigation.md) |
| Add navigation | [`link-to`](docs/en/link-to.md) |
| Work with parameters | [`route-parameters`](docs/en/route-parameters.md) |
| Add authentication | [`middleware`](docs/en/middleware.md) |
| Optimize loading | [`lazy-loading`](docs/en/lazy-loading.md) |
| Organize code | [`route-groups`](docs/en/route-groups.md) |
| Create templates | [`layouts`](docs/en/layouts.md) |

## 🤝 Community

- **English Documentation**: [📂 `docs/en/`](docs/en/) - Complete English documentation
- **Русская документация**: [📂 `docs/`](docs/) - Полная русская документация
- **GitHub**: https://github.com/Complex138/svelte-router
- **Issues**: https://github.com/Complex138/svelte-router/issues

## 📄 License

MIT - Free use in any projects.

---

**Made with ❤️ for the Svelte community**
