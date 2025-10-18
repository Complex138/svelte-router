# Layout System - Page Templates

## Description

System for creating common templates (layouts) for pages. Allows wrapping route components in common structures with navigation, sidebars, and footers.

## Layout Registration

### Basic Registration

```javascript
import { registerLayout } from 'svelte-router-v5';
import AppLayout from './layouts/AppLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';

// Register layouts
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);
```

### Auto-loading Layouts

```javascript
import { loadLayouts } from 'svelte-router-v5';

// Automatically loads all layouts from folder
loadLayouts('./src/layouts');

// Or with custom settings
loadLayouts('./src/layouts', {
  prefix: 'Layout',  // LayoutApp.svelte -> 'app'
  exclude: ['BaseLayout.svelte']
});
```

## Usage in Routes

### Global Layout

```javascript
export const routes = {
  // Layout for entire application
  defaultLayout: 'app',

  '/': Home,  // Uses 'app' layout
  '/about': About,  // Uses 'app' layout

  '/admin': {
    component: Admin,
    layout: 'admin'  // Overrides to 'admin'
  }
};
```

### Layouts in Groups

```javascript
export const routes = {
  defaultLayout: 'app',

  group: {
    prefix: '/user',
    layout: 'user',  // Layout for entire group
    middleware: ['auth'],
    routes: {
      '/': UserDashboard,  // Uses 'user' layout
      '/profile': UserProfile,  // Uses 'user' layout
      '/settings': {
        component: UserSettings,
        layout: 'settings'  // Overrides group layout
      }
    }
  }
};
```

### Without Layout

```javascript
export const routes = {
  defaultLayout: 'app',

  '/login': {
    component: Login,
    layout: null  // No layout
  }
};
```

## Creating Layout Components

### Basic Application Layout

```svelte
<!-- layouts/AppLayout.svelte -->
<script>
  import { LinkTo } from 'svelte-router-v5';
  export let component;
</script>

<div class="app-layout">
  <header class="app-header">
    <h1>My App</h1>
    <nav>
      <LinkTo route="/">Home</LinkTo>
      <LinkTo route="/about">About</LinkTo>
      <LinkTo route="/contact">Contact</LinkTo>
    </nav>
  </header>

  <main class="app-main">
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

### Admin Layout with Sidebar

```svelte
<!-- layouts/AdminLayout.svelte -->
<script>
  import { LinkTo } from 'svelte-router-v5';
  export let component;
</script>

<div class="admin-layout">
  <aside class="admin-sidebar">
    <h2>Admin Panel</h2>
    <nav class="admin-nav">
      <LinkTo route="/admin">Dashboard</LinkTo>
      <LinkTo route="/admin/users">Users</LinkTo>
      <LinkTo route="/admin/settings">Settings</LinkTo>
    </nav>
  </aside>

  <main class="admin-content">
    <div class="admin-header">
      <h1>Administration</h1>
    </div>

    <div class="admin-body">
      <svelte:component this={component} />
    </div>
  </main>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f8f9fa;
  }

  .admin-sidebar {
    width: 250px;
    background: #343a40;
    color: white;
    padding: 1rem;
  }

  .admin-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .admin-body {
    flex: 1;
    padding: 2rem;
  }
</style>
```

### Layout with Parameters

```svelte
<!-- layouts/UserLayout.svelte -->
<script>
  import { LinkTo } from 'svelte-router-v5';
  export let component;
  export let sidebar = true;
  export let title = 'User Area';
</script>

<div class="user-layout">
  {#if sidebar}
    <aside class="user-sidebar">
      <nav>
        <LinkTo route="/user">Dashboard</LinkTo>
        <LinkTo route="/user/profile">Profile</LinkTo>
        <LinkTo route="/user/settings">Settings</LinkTo>
      </nav>
    </aside>
  {/if}

  <main class="user-content">
    <header>
      <h1>{title}</h1>
    </header>

    <div class="user-body">
      <svelte:component this={component} />
    </div>
  </main>
</div>
```

## Layout Priority

Layouts are applied by priority (highest to lowest):

1. **Route layout** - `layout` in specific route
2. **Group layout** - `layout` in route group
3. **Global layout** - `defaultLayout` in configuration

## Usage Examples

### Full Application

```javascript
// layouts/AppLayout.svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
  export let component;
</script>

<div class="app">
  <header>
    <nav>
      <LinkTo route="/">Home</LinkTo>
      <LinkTo route="/about">About</LinkTo>
    </nav>
  </header>
  <main>
    <svelte:component this={component} />
  </main>
  <footer>Footer</footer>
</div>
```

```javascript
// layouts/AdminLayout.svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
  export let component;
</script>

<div class="admin">
  <aside>
    <nav>
      <LinkTo route="/admin">Dashboard</LinkTo>
      <LinkTo route="/admin/users">Users</LinkTo>
    </nav>
  </aside>
  <main>
    <svelte:component this={component} />
  </main>
</div>
```

```javascript
// routes.js
import { registerLayout } from 'svelte-router-v5';

registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);

export const routes = {
  defaultLayout: 'app',

  '/': Home,
  '/about': About,

  group: {
    prefix: '/admin',
    layout: 'admin',
    middleware: ['auth', 'admin'],
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers
    }
  },

  '/login': {
    component: Login,
    layout: null  // No layout
  }
};
```

### E-commerce Store

```javascript
// layouts/StoreLayout.svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
  export let component;
  export let showCart = true;
</script>

<div class="store">
  <header>
    <nav>
      <LinkTo route="/">Store</LinkTo>
      <LinkTo route="/catalog">Catalog</LinkTo>
      {#if showCart}
        <LinkTo route="/cart">Cart</LinkTo>
      {/if}
    </nav>
  </header>
  <main>
    <svelte:component this={component} />
  </main>
</div>
```

```javascript
// routes.js
export const routes = {
  defaultLayout: 'store',

  '/': Home,
  '/catalog': Catalog,

  group: {
    prefix: '/product',
    routes: {
      '/:id': ProductDetail
    }
  },

  group: {
    prefix: '/checkout',
    layout: null,  // No layout for checkout process
    routes: {
      '/': Checkout,
      '/payment': Payment,
      '/success': OrderSuccess
    }
  }
};
```

## Important Notes

1. **Registration required** - Layouts must be registered before use
2. **Component receives props** - Layout receives current component as prop
3. **Styles** - Each layout should have unique CSS classes
4. **Performance** - Layouts are automatically cached

## Related Functions

- [`registerLayout`](register-layout.md) - Layout registration
- [`RouterView`](router-view.md) - Display component with layout support