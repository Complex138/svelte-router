# createNavigation - Router Creation

## Description

The main function for creating a router instance. Takes route configuration and returns a reactive store with the current component and its props.

## Syntax

```javascript
import { createNavigation } from 'svelte-router-v5';

const currentComponent = createNavigation(routesConfig);
```

## Parameters

- `routesConfig` (Object) - Routes configuration

## Returns

Svelte store object with fields:
- `component` - Current route component
- `props` - Props for the component
- `loading` - Loading state (boolean)
- `error` - Loading error (string|null)

## Usage Examples

### Basic Example

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

### With Global Settings

```javascript
// routes.js
export const routes = {
  // Global layout for all routes
  defaultLayout: 'app',

  // Global middleware
  defaultMiddleware: ['auth'],

  // Routes
  '/': Home,
  '/dashboard': Dashboard,
  '/admin': {
    component: Admin,
    layout: 'admin' // Overrides global layout
  }
};

// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<RouterView currentComponent={$currentComponent} />
```

### With Error Handling

```javascript
// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);

  // Router error handling
  $: if ($currentComponent.error) {
    console.error('Router error:', $currentComponent.error);
  }
</script>

<RouterView
  currentComponent={$currentComponent}
  errorComponent={ErrorPage}
/>
```

## Important Notes

1. **Single instance** - Create only one router instance per application
2. **Reactivity** - Store automatically updates on navigation
3. **Middleware** - Executed automatically on each navigation
4. **Layout** - Applied according to priority hierarchy

## Related Functions

- [`RouterView`](en/router-view.md) - Component for displaying routes
- [`LinkTo`](en/link-to.md) - Component for creating links
- [`navigate`](en/navigate.md) - Programmatic navigation
