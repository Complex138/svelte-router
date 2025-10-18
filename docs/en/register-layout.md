# registerLayout - Layout Registration

## Description

Function for registering layout components in the router system. Layouts allow creating common templates for pages.

## Syntax

```javascript
import { registerLayout } from 'svelte-router-v5';

registerLayout(name, component);
```

## Parameters

- `name` (String) - Unique layout name (required)
- `component` (Component) - Svelte layout component (required)

## Usage Examples

### Basic Registration

```javascript
import { registerLayout } from 'svelte-router-v5';
import AppLayout from './layouts/AppLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';

// Register layouts
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);
```

### Multiple Layout Registration

```javascript
import { registerLayout } from 'svelte-router-v5';

// Import all layouts
import AppLayout from './layouts/AppLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';
import UserLayout from './layouts/UserLayout.svelte';
import AuthLayout from './layouts/AuthLayout.svelte';
import EmptyLayout from './layouts/EmptyLayout.svelte';

// Register all layouts
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);
registerLayout('user', UserLayout);
registerLayout('auth', AuthLayout);
registerLayout('empty', EmptyLayout);
```

### Creating Layout Component

```svelte
<!-- layouts/AppLayout.svelte -->
<script>
  import { LinkTo } from 'svelte-router-v5';
  // Layout receives current route component
  export let component;
</script>

<div class="app-layout">
  <header class="app-header">
    <h1>My Application</h1>
    <nav>
      <LinkTo route="/">Home</LinkTo>
      <LinkTo route="/about">About</LinkTo>
      <LinkTo route="/contact">Contact</LinkTo>
    </nav>
  </header>

  <main class="app-main">
    <!-- Current route component renders here -->
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

### Layout with Parameters

```svelte
<!-- layouts/AdminLayout.svelte -->
<script>
  import { LinkTo } from 'svelte-router-v5';
  export let component;
  export let sidebar = true;
  export let title = 'Admin Panel';
</script>

<div class="admin-layout">
  {#if sidebar}
    <aside class="admin-sidebar">
      <h2>{title}</h2>
      <nav>
        <LinkTo route="/admin">Dashboard</LinkTo>
        <LinkTo route="/admin/users">Users</LinkTo>
        <LinkTo route="/admin/settings">Settings</LinkTo>
      </nav>
    </aside>
  {/if}

  <main class="admin-content">
    <header>
      <h1>{title}</h1>
    </header>

    <div class="admin-body">
      <svelte:component this={component} />
    </div>
  </main>
</div>
```

### Usage in Routes

```javascript
// routes.js
import { registerLayout } from 'svelte-router-v5';

registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);

export const routes = {
  defaultLayout: 'app',  // Global layout

  '/': Home,  // Uses 'app'

  '/admin': {
    component: Admin,
    layout: 'admin'  // Overrides to 'admin'
  },

  group: {
    prefix: '/user',
    layout: 'user',  // Layout for group
    routes: {
      '/': UserDashboard,
      '/settings': UserSettings
    }
  },

  '/login': {
    component: Login,
    layout: null  // No layout
  }
};
```

## Best Practices

1. **Unique names** - Use descriptive layout names
2. **Consistency** - Create similar structure for all layouts
3. **Parameters** - Use parameters for layout customization
4. **Registration** - Register layouts before creating router

## Related Functions

- [`getLayout`](get-layout.md) - Get layout by name
- [`hasLayout`](has-layout.md) - Check layout existence
- [`layouts`](layouts.md) - General layout documentation