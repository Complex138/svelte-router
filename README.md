# Svelte Router

Simple and powerful router for Svelte 5 with automatic parameter extraction, reactive navigation, and **regular expression support** for advanced route validation.

## Features

- 🚀 **Automatic parameter extraction** from URL routes
- 🔄 **Reactive navigation** with Svelte stores
- 🎯 **Regular expression support** for advanced route validation
- 🔐 **Middleware system** for authentication, authorization, and route guards
- ⚡ **Lazy loading** (dynamic import) + helpers `lazy`, `lazyRoute`, `lazyGroup`
- 📦 **Type-safe** parameter passing
- 🧩 **Route groups** with `prefix`, shared `middleware`, `beforeEnter/afterEnter`
- ⏳ **Loading/Error UI** in `RouterView` with custom components support
- 🚀 **Automatic prefetch** strategies in `LinkTo` (hover/visible/mount/none)
- 🗃️ **Component cache** for prefetched/lazy components
- 🔗 **Clean API** with `LinkTo` component
- 📱 **SPA routing** with History API
- 🎨 **Support for complex data types** (objects, arrays, functions, components)

## Installation

```bash
npm install svelte-router-v5
```

## TypeScript Support

This package includes full TypeScript support with type definitions:

```typescript
import { createNavigation, LinkTo, getRoutParams, navigate, linkTo, type Routes, type RouteParams, type NavigateFunctionV2, type LinkToFunction } from 'svelte-router-v5';

// Typed routes
const routes: Routes = {
  '/': Home,
  '/user/:id': User,
  '/user/id/:id(\\d+)': User,
  '/user/name/:userName([a-zA-Z]+)': User,
  '/post/:id(\\d+)/:action(edit|delete)': Post,
  '/api/:version(v\\d+)/:endpoint(users|posts|comments)': Api,
  '*': NotFound
};

// Typed parameters
const { id: userId, userName, action, version, endpoint, tab }: RouteParams & { tab?: string } = $getRoutParams;

// Typed navigation functions
const navigateTyped: NavigateFunctionV2 = navigate;
const linkToTyped: LinkToFunction = linkTo;

// All three methods work with TypeScript
navigateTyped('/user/:id', {id: 123}); // Method 1
navigateTyped('/user/:id', {params: {id: 123}, queryParams: {tab: 'profile'}}); // Method 2
navigateTyped('/user/:id', {id: 123, userData: {name: 'John'}}); // Method 3

// With or without regex - same result!
navigateTyped('/user/id/:id(\\d+)', {id: 123}); // With regex
navigateTyped('/user/id/:id', {id: 123}); // Without regex (same result!)
```

## Quick Start

### 1. Create a `routes.js` file in your project root:

```javascript
// routes.js
import Home from './pages/Home.svelte';
import About from './pages/About.svelte';
import User from './pages/User.svelte';
import Post from './pages/Post.svelte';
import Api from './pages/Api.svelte';
import NotFound from './pages/NotFound.svelte';

export const routes = {
  '/': Home,
  '/about': About,
  
  // Basic routes
  '/user/:id': User,
  
  // Routes with regular expressions for validation
  '/user/id/:id(\\d+)': User,                    // Only numbers: /user/id/123 ✅, /user/id/abc ❌
  '/user/name/:userName([a-zA-Z]+)': User,       // Only letters: /user/name/john ✅, /user/name/123 ❌
  '/user/slug/:slug([a-zA-Z0-9-]+)': User,       // Letters, numbers, dashes: /user/slug/john-doe ✅
  '/post/:id(\\d+)/:action(edit|delete)': Post,  // Specific values: /post/123/edit ✅
  '/api/:version(v\\d+)/:endpoint(users|posts|comments)': Api, // API versions: /api/v1/users ✅
  
  '*': NotFound
};
```

### 2. Use the router in your main component:

**Option 1: Using RouterView component (recommended):**
```javascript
// App.svelte
<script>
  import { createNavigation, LinkTo, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<main>
  <nav>
    <LinkTo route="/" className="nav-link">Home</LinkTo>
    <LinkTo route="/user/:id" params={{id: 123}} className="nav-link">User 123</LinkTo>
    <LinkTo route="/user/id/:id(\\d+)" params={{id: 456}} className="nav-link">User ID 456 (with regex)</LinkTo>
    <LinkTo route="/user/id/:id" params={{id: 456}} className="nav-link">User ID 456 (without regex)</LinkTo>
    <LinkTo route="/user/name/:userName([a-zA-Z]+)" params={{userName: "john"}} className="nav-link">User John (with regex)</LinkTo>
    <LinkTo route="/user/name/:userName" params={{userName: "john"}} className="nav-link">User John (without regex)</LinkTo>
    <LinkTo route="/post/:id(\\d+)/:action(edit|delete)" params={{id: 789, action: "edit"}} className="nav-link">Edit Post 789 (with regex)</LinkTo>
    <LinkTo route="/post/:id/:action" params={{id: 789, action: "edit"}} className="nav-link">Edit Post 789 (without regex)</LinkTo>
  </nav>
  
  <RouterView currentComponent={$currentComponent} />
</main>
```

### 3. Get parameters in your components:

```javascript
// User.svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // All parameters are automatically available
  $: ({ id: userId, userName, slug, postId, action, version, endpoint, userData, settings } = $getRoutParams);
</script>

<h1>User: {userId || userName || slug}</h1>
{#if postId}
  <p>Post ID: {postId}</p>
{/if}
{#if action}
  <p>Action: {action}</p>
{/if}
{#if version && endpoint}
  <p>API: {version}/{endpoint}</p>
{/if}
```

## Advanced Examples

### Navigation with Parameters

```javascript
// Simple route parameters
<LinkTo route="/user/:id" params={{id: 123}}>User 123</LinkTo>

// Multiple parameters
<LinkTo route="/user/:id/delete/:postId" params={{id: 456, postId: 789}}>
  Delete Post
</LinkTo>

// With GET parameters
<LinkTo 
  route="/user/:id" 
  params={{id: 123}} 
  queryParams={{tab: "profile", theme: "dark"}}
>
  User Profile
</LinkTo>
```

**Usage in component:**
```javascript
// User.svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Get all parameters with one function
  $: ({ id: userId, postId, tab, theme } = $getRoutParams);
</script>

<h1>User: {userId}</h1>
{#if postId}
  <p>Post ID: {postId}</p>
{/if}
{#if tab}
  <p>Active tab: {tab}</p>
{/if}
{#if theme}
  <p>Theme: {theme}</p>
{/if}
```

### Passing Complex Data

```javascript
// Pass objects and arrays
<LinkTo 
  route="/user/:id" 
  params={{id: 123}}
  props={{
    userData: {
      name: "John Doe",
      email: "john@example.com",
      preferences: {
        theme: "dark",
        notifications: true
      }
    },
    permissions: ["read", "write", "admin"],
    onSave: (data) => console.log("Saving:", data)
  }}
>
  User with Data
</LinkTo>
```

**Usage in component:**
```javascript
// User.svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Get all data including objects and functions
  $: ({ id: userId, userData, permissions, onSave } = $getRoutParams);
  
  function handleSave() {
    if (onSave) {
      onSave({ userId, userData });
    }
  }
</script>

<h1>User: {userId}</h1>

{#if userData}
  <div class="user-info">
    <p>Name: {userData.name}</p>
    <p>Email: {userData.email}</p>
    <p>Theme: {userData.preferences.theme}</p>
    <p>Notifications: {userData.preferences.notifications ? 'enabled' : 'disabled'}</p>
  </div>
{/if}

{#if permissions}
  <div class="permissions">
    <h3>Permissions:</h3>
    <ul>
      {#each permissions as permission}
        <li>{permission}</li>
      {/each}
    </ul>
  </div>
{/if}

<button on:click={handleSave}>Save</button>
```

### Passing Components

```javascript
// Pass Svelte components
import CustomWidget from './components/CustomWidget.svelte';

<LinkTo 
  route="/dashboard" 
  props={{
    widgets: [CustomWidget, AnotherWidget],
    layout: "grid"
  }}
>
  Dashboard
</LinkTo>
```

**Usage in component:**
```javascript
// Dashboard.svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Get components and settings
  $: ({ widgets, layout } = $getRoutParams);
</script>

<div class="dashboard layout-{layout}">
  <h1>Dashboard</h1>
  
  {#if widgets}
    <div class="widgets-grid">
      {#each widgets as Widget}
        <div class="widget">
          <svelte:component this={Widget} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .layout-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
</style>
```

### Programmatic Navigation

```javascript
// Automatic navigation with navigate() function
import { navigate } from 'svelte-router-v5';

// Method 1: Old format (positional parameters)
navigate('/user/:id', {id: 123});
// Navigates to: '/user/123'

navigate('/user/:id', {id: 123}, {tab: 'profile', edit: 'true'});
// Navigates to: '/user/123?tab=profile&edit=true'

navigate('/user/:id', {id: 123}, {}, {
  userData: { name: 'John', email: 'john@example.com' },
  onSave: (data) => console.log('Saving:', data)
});

// Method 2: New format with keys (recommended)
navigate('/user/:id', {
  params: {id: 123},
  queryParams: {tab: 'profile', edit: 'true'},
  props: {
    userData: { name: 'John', email: 'john@example.com' },
    onSave: (data) => console.log('Saving:', data)
  }
});

// Method 3: Automatic detection (smart mode)
navigate('/user/:id', {
  id: 123,                    // Automatically goes to params (matches :id)
  userData: { name: 'John' }, // Automatically goes to props
  settings: { theme: 'dark' } // Automatically goes to props
});
// Result: id=123 -> params, everything else -> props

// Regular expression routes with all methods
navigate('/user/id/:id(\\d+)', {id: 123}); // Method 1 - with regex
navigate('/user/id/:id', {id: 123}); // Method 1 - without regex (same result!)

navigate('/user/name/:userName([a-zA-Z]+)', {
  params: {userName: 'john'},
  props: {userData: {name: 'John'}}
}); // Method 2 - with regex
navigate('/user/name/:userName', {
  params: {userName: 'john'},
  props: {userData: {name: 'John'}}
}); // Method 2 - without regex (same result!)

navigate('/post/:id(\\d+)/:action(edit|delete)', {
  id: 789,                    // Goes to params
  action: 'edit',             // Goes to params
  postData: {title: 'Test'}   // Goes to props
}); // Method 3 - with regex
navigate('/post/:id/:action', {
  id: 789,                    // Goes to params
  action: 'edit',             // Goes to params
  postData: {title: 'Test'}   // Goes to props
}); // Method 3 - without regex (same result!)

// Use in functions
function goToUser(userId, tab = 'profile') {
  navigate('/user/:id', {id: userId}, {tab});
}

function goToUserWithData(userId, userData) {
  navigate('/user/:id', {
    params: {id: userId},
    props: {userData}
  });
}
```

**URL Generation (without navigation):**
```javascript
// Generate URLs programmatically (without navigation)
import { linkTo } from 'svelte-router-v5';

// Simple URL generation
const userUrl = linkTo('/user/:id', {id: 123});
// Result: '/user/123'

// With query parameters
const profileUrl = linkTo('/user/:id', {id: 123}, {tab: 'profile', edit: 'true'});
// Result: '/user/123?tab=profile&edit=true'
```

**Usage in component:**
```javascript
// Navigation.svelte
<script>
  import { navigate } from 'svelte-router-v5';
  
  let users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' }
  ];
  
  function goToUser(userId) {
    navigate('/user/:id', { id: userId });
  }
  
  function goToUserProfile(userId, tab = 'profile') {
    navigate('/user/:id', { id: userId }, { tab });
  }
  
  function goToUserWithData(userId) {
    navigate('/user/:id', { id: userId }, {}, {
      userData: { name: 'John Doe', email: 'john@example.com' },
      onSave: (data) => console.log('Saving:', data)
    });
  }
</script>

<div class="user-list">
  <h2>User List</h2>
  
  {#each users as user}
    <div class="user-item">
      <span>{user.name}</span>
      <button on:click={() => goToUser(user.id)}>
        Go to User
      </button>
      <button on:click={() => goToUserProfile(user.id, 'settings')}>
        Settings
      </button>
      <button on:click={() => goToUserWithData(user.id)}>
        With Data
      </button>
    </div>
  {/each}
</div>
```

**Getting data in target component (same as LinkTo):**
```javascript
// User.svelte - receives data the same way as LinkTo
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Get parameters from programmatic navigation
  $: ({ id: userId, tab, userData, onSave } = $getRoutParams);
  
  function handleSave() {
    if (onSave) {
      onSave({ userId, userData });
    }
  }
</script>

<h1>User: {userId}</h1>
{#if tab}
  <p>Active tab: {tab}</p>
{/if}

{#if userData}
  <div class="user-info">
    <p>Name: {userData.name}</p>
    <p>Email: {userData.email}</p>
  </div>
{/if}

<button on:click={handleSave}>Save</button>
```

**Note:** The `navigate()` function automatically handles URL generation, navigation, and data passing. Data is received the same way regardless of navigation method (LinkTo or navigate). The `$getRoutParams` store contains all route parameters, query parameters, and additional props.

### Complex Route Patterns

```javascript
// routes.js
export const routes = {
  '/': Home,
  '/blog': Blog,
  '/blog/:category': BlogCategory,
  '/blog/:category/:slug': BlogPost,
  '/user/:id': User,
  '/user/:id/settings': UserSettings,
  '/user/:id/settings/:section': UserSettings,
  '/admin': Admin,
  '/admin/:module': AdminModule,
  '/admin/:module/:action': AdminAction,
  '*': NotFound
};
```

### Component Examples

#### User Profile Component

```javascript
// User.svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ 
    id: userId, 
    userData, 
    settings, 
    CustomComponent,
    onSave 
  } = $getRoutParams);
  
  function handleSave() {
    if (onSave) {
      onSave({ userId, userData });
    }
  }
</script>

<div class="user-profile">
  <h1>User: {userId}</h1>
  
  {#if userData}
    <div class="user-info">
      <p>Name: {userData.name}</p>
      <p>Email: {userData.email}</p>
    </div>
  {/if}
  
  {#if settings}
    <div class="settings">
      <p>Theme: {settings.theme}</p>
      <p>Notifications: {settings.notifications ? 'On' : 'Off'}</p>
    </div>
  {/if}
  
  {#if CustomComponent}
    <svelte:component this={CustomComponent} />
  {/if}
  
  <button on:click={handleSave}>Save</button>
</div>
```

#### Navigation Component

```javascript
// Navigation.svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
  
  const menuItems = [
    { route: '/', label: 'Home' },
    { route: '/about', label: 'About' },
    { route: '/blog', label: 'Blog' }
  ];
  
  const userMenuItems = [
    { route: '/user/:id', params: {id: 123}, label: 'Profile' },
    { route: '/user/:id/settings', params: {id: 123}, label: 'Settings' }
  ];
</script>

<nav class="main-nav">
  {#each menuItems as item}
    <LinkTo route={item.route} className="nav-link">
      {item.label}
    </LinkTo>
  {/each}
  
  <div class="user-menu">
    {#each userMenuItems as item}
      <LinkTo 
        route={item.route} 
        params={item.params} 
        className="user-link"
      >
        {item.label}
      </LinkTo>
    {/each}
  </div>
</nav>
```

### Error Handling

```javascript
// 404 Page
// NotFound.svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ pathname } = $getRoutParams);
</script>

<div class="error-page">
  <h1>404 - Page Not Found</h1>
  <p>The page "{pathname}" could not be found.</p>
  <LinkTo route="/" className="btn btn-primary">Go Home</LinkTo>
</div>
```

### Dynamic Routes

```javascript
// Dynamic route generation
function generateUserRoutes(users) {
  return users.map(user => ({
    route: `/user/${user.id}`,
    params: { id: user.id },
    label: user.name
  }));
}

// Usage
const userRoutes = generateUserRoutes([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
]);
```

## API Reference

### `createNavigation(routesConfig)`
Creates a router instance with the provided routes configuration.

**Parameters:**
- `routesConfig` (object) - Routes configuration object

**Returns:** Svelte store with current component and props.

### `LinkTo` Component
Navigation component with the following props:

- `route` (string) - Route pattern (e.g., "/user/:id")
- `params` (object) - Route parameters object
- `queryParams` (object) - GET parameters object  
- `props` (object) - Additional props to pass to component
- `className` (string) - CSS classes for the link

### `RouterView` Component
Component for rendering the current route. Automatically handles component and props.

**Props:**
- `currentComponent` (object) - Current component store from `createNavigation()`

**Usage:**
```javascript
<RouterView currentComponent={$currentComponent} />
```

### `getRoutParams`
Reactive store containing all route parameters, query parameters, and additional props.

**Usage:**
```javascript
$: ({ id, userData, settings } = $getRoutParams);
```

### `navigate(route, paramsOrConfig, queryParams?, additionalProps?)`
Function for automatic programmatic navigation with multiple formats.

**Parameters:**
- `route` (string) - Route pattern (supports regular expressions)
- `paramsOrConfig` (object) - Route parameters or configuration object
- `queryParams` (object, optional) - GET parameters (old format only)
- `additionalProps` (object, optional) - Additional props (old format only)

**Usage:**

**Method 1: Old format (positional parameters)**
```javascript
navigate('/user/:id', {id: 123}); // Navigate to /user/123
navigate('/user/:id', {id: 123}, {tab: 'profile'}); // With query params
navigate('/user/:id', {id: 123}, {}, {userData: {...}}); // With props

// Regular expression routes (with or without regex in navigate - same result!)
navigate('/user/id/:id(\\d+)', {id: 123}); // With regex
navigate('/user/id/:id', {id: 123}); // Without regex (same result!)
navigate('/post/:id(\\d+)/:action(edit|delete)', {id: 789, action: 'edit'}); // With regex
navigate('/post/:id/:action', {id: 789, action: 'edit'}); // Without regex (same result!)
```

**Method 2: New format with keys (recommended)**
```javascript
navigate('/user/:id', {
  params: {id: 123},
  queryParams: {tab: 'profile'},
  props: {userData: {...}}
});

// Regular expression routes (with or without regex in navigate - same result!)
navigate('/user/name/:userName([a-zA-Z]+)', {
  params: {userName: 'john'},
  props: {userData: {name: 'John'}}
}); // With regex
navigate('/user/name/:userName', {
  params: {userName: 'john'},
  props: {userData: {name: 'John'}}
}); // Without regex (same result!)
```

**Method 3: Automatic detection (smart mode)**
```javascript
navigate('/user/:id', {
  id: 123,                    // Automatically goes to params (matches :id)
  userData: { name: 'John' }, // Automatically goes to props
  settings: { theme: 'dark' } // Automatically goes to props
});

// Regular expression routes (with or without regex in navigate - same result!)
navigate('/post/:id(\\d+)/:action(edit|delete)', {
  id: 789,                    // Goes to params
  action: 'edit',             // Goes to params
  postData: {title: 'Test'}   // Goes to props
}); // With regex
navigate('/post/:id/:action', {
  id: 789,                    // Goes to params
  action: 'edit',             // Goes to params
  postData: {title: 'Test'}   // Goes to props
}); // Without regex (same result!)
```

### `linkTo(route, params, queryParams)`
Function to generate URLs programmatically (without navigation).

**Parameters:**
- `route` (string) - Route pattern
- `params` (object) - Route parameters
- `queryParams` (object) - GET parameters

**Returns:** Generated URL string

### `routeExists(path)`
Check if a route exists for the given path.

### `getRouteComponent(path)`
Get the component for a given path.

### `getRouteParams(path)`
Get route parameters for a given path.

### `getQueryParams()`
Get query parameters from the current URL.

### `getAllParams(path)`
Get all parameters (route + query) for a given path.

### `updateUrlStore()`
Update the internal URL store (used internally).

### `updateAdditionalProps(props)`
Update additional props store (used internally).

### `setRoutes(routesConfig)`
Set routes configuration (used internally).

## Best Practices

1. **Keep routes.js simple** - Only define route patterns and components
2. **Use descriptive parameter names** - `:userId` instead of `:id` when context matters
3. **Pass complex data via props** - Don't serialize objects in URLs
4. **Use TypeScript** - For better type safety and IDE support
5. **Handle 404s gracefully** - Always include a catch-all route

## Regular Expression Support

The router supports regular expressions in route patterns for advanced validation:

```javascript
export const routes = {
  // Basic routes
  '/user/:id': User,
  
  // Routes with regular expressions
  '/user/id/:id(\\d+)': User,                    // Only numbers: /user/id/123 ✅, /user/id/abc ❌
  '/user/name/:userName([a-zA-Z]+)': User,       // Only letters: /user/name/john ✅, /user/name/123 ❌
  '/user/slug/:slug([a-zA-Z0-9-]+)': User,       // Letters, numbers, dashes: /user/slug/john-doe ✅
  '/post/:id(\\d+)/:action(edit|delete)': Post,  // Specific values: /post/123/edit ✅
  '/api/:version(v\\d+)/:endpoint(users|posts|comments)': Api, // API versions: /api/v1/users ✅
  
  '*': NotFound
};
```

### Regular Expression Examples:

- `:id(\\d+)` - Only digits (123, 456)
- `:userName([a-zA-Z]+)` - Only letters (john, alice)
- `:slug([a-zA-Z0-9-]+)` - Letters, numbers, dashes (john-doe, user123)
- `:action(edit|delete)` - Specific values (edit, delete)
- `:version(v\\d+)` - Version format (v1, v2, v10)
- `:endpoint(users|posts|comments)` - Limited options (users, posts, comments)

### Route Priority:

Routes with regular expressions are checked **before** basic routes to ensure proper validation:

1. **Specific regex routes** (e.g., `/user/id/:id(\\d+)`)
2. **General routes** (e.g., `/user/:id`)

This ensures that `/user/123` matches the regex route (if it exists) before falling back to the general route.

### Using Routes in navigate() and linkTo()

**Important:** You can use route patterns with or without regular expressions in `navigate()` and `linkTo()` - both work the same way!

```javascript
// These are equivalent - both generate the same URL: /user/id/123
navigate('/user/id/:id(\\d+)', {id: 123}); // With regex
navigate('/user/id/:id', {id: 123});       // Without regex

// These are equivalent - both generate the same URL: /user/name/john
navigate('/user/name/:userName([a-zA-Z]+)', {userName: 'john'}); // With regex
navigate('/user/name/:userName', {userName: 'john'});            // Without regex

// These are equivalent - both generate the same URL: /post/789/edit
navigate('/post/:id(\\d+)/:action(edit|delete)', {id: 789, action: 'edit'}); // With regex
navigate('/post/:id/:action', {id: 789, action: 'edit'});                    // Without regex
```

**How it works:**
- Regular expressions in routes are used for **validation only**
- `navigate()` and `linkTo()` strip regex patterns when generating URLs
- The router validates parameters against route regex patterns during navigation
- Invalid parameters (e.g., letters in `:id(\\d+)`) will prevent navigation

## Middleware System 🔐

The router includes a powerful middleware system for authentication, authorization, and route guards.

### Quick Middleware Example

```javascript
import { registerMiddleware, registerGlobalMiddleware } from 'svelte-router-v5';

// Register middleware
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    context.navigate('/login');
    return false; // Block navigation
  }
  return true; // Allow navigation
});

// Configure routes with middleware
export const routes = {
  '/': Home,
  '/profile': {
    component: Profile,
    middleware: ['auth', 'logger']
  },
  '/admin': {
    component: Admin,
    middleware: ['auth', 'admin']
  }
};
```

### Middleware Features

- ✅ **Authentication guards** - Protect routes requiring login
- ✅ **Authorization checks** - Role and permission-based access control
- ✅ **Route guards** - Custom logic before/after navigation
- ✅ **Global middleware** - Apply to all routes
- ✅ **Async support** - Handle API calls and async operations
- ✅ **Error handling** - Automatic error middleware execution
- ✅ **Context access** - Full navigation context in middleware

### Available Middleware Types

1. **Route Middleware** - Applied to specific routes
2. **Global Middleware** - Applied to all routes (before/after/error)
3. **beforeEnter/afterEnter** - Route-specific hooks

For complete middleware documentation, see [MIDDLEWARE.md](./MIDDLEWARE.md).

## Lazy Loading ⚡

The router supports lazy loading of components to improve initial load times and reduce bundle size. Components are loaded on-demand when navigating to a route.

### Why Use Lazy Loading?

- **Faster initial load** - Only load components needed for the current route
- **Smaller bundle size** - Split code into smaller chunks
- **Better performance** - Reduce memory usage and parsing time
- **Improved UX** - Users don't wait for unused components to load

### Basic Lazy Loading

**Without lazy loading (loads all components immediately):**
```javascript
// routes.js
import Home from './pages/Home.svelte';
import About from './pages/About.svelte';
import User from './pages/User.svelte';

export const routes = {
  '/': Home,
  '/about': About,
  '/user/:id': User
};
```

**With lazy loading (loads components on-demand):**
```javascript
// routes.js
export const routes = {
  '/': () => import('./pages/Home.svelte'),
  '/about': () => import('./pages/About.svelte'),
  '/user/:id': () => import('./pages/User.svelte'),
  '*': () => import('./pages/NotFound.svelte')
};
```

### Using Lazy Utilities

The router provides helper functions for cleaner lazy loading syntax:

```javascript
// routes.js
import { lazy, lazyRoute, lazyGroup } from 'svelte-router-v5';

// Method 1: Using lazy() helper (recommended for simple routes)
export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),
  '/about': lazy(() => import('./pages/About.svelte')),
  '/user/:id': lazy(() => import('./pages/User.svelte'))
};

// Method 2: Using lazyRoute() with middleware
export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),
  '/profile': lazyRoute(() => import('./pages/Profile.svelte'), {
    middleware: ['auth'],
    beforeEnter: (context) => {
      console.log('Entering profile');
      return true;
    }
  }),
  '/admin': lazyRoute(() => import('./pages/Admin.svelte'), {
    middleware: ['auth', 'admin']
  })
};

// Method 3: Using lazyGroup() for grouped routes
const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/admin/Dashboard.svelte'),
  '/admin/users': () => import('./pages/admin/Users.svelte'),
  '/admin/settings': () => import('./pages/admin/Settings.svelte')
}, {
  middleware: ['auth', 'admin'] // Shared middleware for all admin routes
});

export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')),
  '/about': lazy(() => import('./pages/About.svelte')),
  ...adminRoutes,
  '*': lazy(() => import('./pages/NotFound.svelte'))
};
```

### Loading and Error States

The `RouterView` component automatically handles loading and error states:

```javascript
// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<main>
  <nav>
    <!-- Your navigation links -->
  </nav>

  <!-- RouterView shows loading/error states automatically -->
  <RouterView currentComponent={$currentComponent} />
</main>
```

**Default loading and error UI:**
- Loading: Shows "Loading..." message
- Error: Shows error message in red

### Custom Loading and Error Components

You can provide custom components for loading and error states:

```javascript
// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorPage from './components/ErrorPage.svelte';

  const currentComponent = createNavigation(routes);
</script>

<main>
  <RouterView
    currentComponent={$currentComponent}
    loadingComponent={LoadingSpinner}
    errorComponent={ErrorPage}
  />
</main>
```

**LoadingSpinner.svelte:**
```svelte
<div class="loading-spinner">
  <div class="spinner"></div>
  <p>Loading page...</p>
</div>

<style>
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
```

**ErrorPage.svelte:**
```svelte
<script>
  export let error = 'An error occurred';
</script>

<div class="error-page">
  <h1>Oops! Something went wrong</h1>
  <p class="error-message">{error}</p>
  <button on:click={() => window.location.reload()}>
    Reload Page
  </button>
</div>

<style>
  .error-page {
    padding: 2rem;
    text-align: center;
  }

  .error-message {
    color: #d32f2f;
    margin: 1rem 0;
  }

  button {
    padding: 0.5rem 1rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

### Automatic Prefetching 🚀

The router includes automatic prefetching to load components before navigation for instant page transitions.

#### Prefetch Strategies

`LinkTo` component supports multiple prefetch strategies via the `prefetch` prop:

```javascript
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<!-- Prefetch on hover (default) - loads when mouse enters link -->
<LinkTo route="/user/:id" params={{id: 123}} prefetch="hover">
  User Profile
</LinkTo>

<!-- Prefetch when visible - loads when link appears in viewport -->
<LinkTo route="/admin" prefetch="visible">
  Admin Dashboard
</LinkTo>

<!-- Prefetch on mount - loads immediately when component mounts -->
<LinkTo route="/settings" prefetch="mount">
  Settings
</LinkTo>

<!-- Disable prefetch -->
<LinkTo route="/logout" prefetch="none">
  Logout
</LinkTo>

<!-- Custom hover delay (in ms) -->
<LinkTo route="/profile" prefetch="hover" prefetchDelay={100}>
  Profile
</LinkTo>
```

**Prefetch strategies:**
- `hover` (default) - Prefetch when mouse hovers over link (50ms delay)
- `visible` - Prefetch when link enters viewport (uses Intersection Observer)
- `mount` - Prefetch immediately when link component mounts
- `none` - Disable automatic prefetching

#### Manual Prefetching

You can manually prefetch routes using utility functions:

```javascript
<script>
  import { prefetchRoute, prefetchAll, prefetchOnIdle } from 'svelte-router-v5';
  import { onMount } from 'svelte';

  onMount(() => {
    // Prefetch a specific route
    prefetchRoute('/dashboard');

    // Prefetch all routes (useful after initial load)
    prefetchAll();

    // Prefetch specific routes with options
    prefetchAll({
      priority: ['/dashboard', '/profile'], // Load these first
      exclude: ['/admin', '/settings']      // Don't load these
    });

    // Prefetch when browser is idle
    prefetchOnIdle(['/reports', '/analytics'], {
      timeout: 2000 // Fallback timeout in ms
    });
  });
</script>
```

#### Advanced Prefetch Utilities

```javascript
<script>
  import {
    prefetchRoute,
    prefetchRelated,
    prefetchWithNetworkAware,
    createSmartPrefetch
  } from 'svelte-router-v5';

  // Prefetch related routes (e.g., pagination)
  function prefetchPagination(currentPage) {
    prefetchRelated([
      `/posts/page/${currentPage + 1}`,
      `/posts/page/${currentPage - 1}`
    ], {
      parallel: true,  // Load in parallel
      delay: 500       // Wait 500ms before prefetching
    });
  }

  // Network-aware prefetching (skips on slow connections)
  function handleHover() {
    prefetchWithNetworkAware('/heavy-dashboard');
  }

  // Smart prefetch - learns from navigation patterns
  const smartPrefetch = createSmartPrefetch(10); // Track last 10 navigations

  function onNavigate(from, to) {
    smartPrefetch.recordNavigation(from, to);
    // Auto-prefetch predicted next routes
    smartPrefetch.prefetchPredicted(to, 2); // Prefetch top 2 predictions
  }
</script>
```

#### Component Caching

Prefetched components are automatically cached to avoid redundant loads:

```javascript
<script>
  import {
    getCachedComponent,
    hasCachedComponent,
    clearComponentCache,
    getCacheSize,
    getCachedPaths
  } from 'svelte-router-v5';

  // Check if component is cached
  if (hasCachedComponent('/dashboard')) {
    console.log('Dashboard already loaded!');
  }

  // Get cached component
  const dashboard = getCachedComponent('/dashboard');

  // Get all cached route paths
  console.log('Cached routes:', getCachedPaths());

  // Check cache size
  console.log('Cache size:', getCacheSize());

  // Clear entire cache (e.g., on logout)
  function logout() {
    clearComponentCache();
    navigate('/login');
  }
</script>
```

#### Prefetch Examples

**Example 1: Hover with custom delay**
```javascript
<!-- Wait 200ms before prefetching (good for menus) -->
<LinkTo route="/dashboard" prefetch="hover" prefetchDelay={200}>
  Dashboard
</LinkTo>
```

**Example 2: Visible prefetch for long pages**
```javascript
<!-- Only prefetch when user scrolls near the link -->
<footer>
  <LinkTo route="/about" prefetch="visible">About</LinkTo>
  <LinkTo route="/contact" prefetch="visible">Contact</LinkTo>
  <LinkTo route="/terms" prefetch="visible">Terms</LinkTo>
</footer>
```

**Example 3: Strategic prefetching on mount**
```javascript
<script>
  import { onMount } from 'svelte';
  import { prefetchRoute, prefetchOnIdle } from 'svelte-router-v5';

  onMount(() => {
    // Prefetch critical routes immediately
    prefetchRoute('/dashboard');

    // Prefetch less critical routes when idle
    prefetchOnIdle([
      '/settings',
      '/profile',
      '/reports'
    ]);
  });
</script>
```

**Example 4: Prefetch on user interaction**
```javascript
<script>
  import { prefetchRoute } from 'svelte-router-v5';

  let selectedTab = 'overview';

  function handleTabChange(tab) {
    selectedTab = tab;
    // Prefetch the next likely tab
    if (tab === 'overview') {
      prefetchRoute('/dashboard/analytics');
    }
  }
</script>

<div class="tabs">
  <button on:click={() => handleTabChange('overview')}>
    Overview
  </button>
  <button on:click={() => handleTabChange('analytics')}>
    Analytics
  </button>
</div>
```

**Example 5: Network-aware prefetching**
```javascript
<script>
  import { prefetchWithNetworkAware } from 'svelte-router-v5';
  import { onMount } from 'svelte';

  onMount(() => {
    // Only prefetch if network is fast enough
    // Automatically skips on 2G/slow connections or save-data mode
    prefetchWithNetworkAware('/heavy-dashboard');
    prefetchWithNetworkAware('/large-report');
  });
</script>
```

### Preloading Components

Manual preloading for advanced use cases:

```javascript
// Navigation.svelte
<script>
  import { preload } from 'svelte-router-v5';

  // Preload on hover for instant navigation
  function handleMouseEnter() {
    preload(() => import('./pages/User.svelte'));
  }
</script>

<nav>
  <a href="/user/123" on:mouseenter={handleMouseEnter}>
    User Profile
  </a>
</nav>
```

### Mixing Regular and Lazy Routes

You can mix regular imports and lazy loading in the same routes configuration:

```javascript
// routes.js
import Home from './pages/Home.svelte'; // Regular import
import { lazy } from 'svelte-router-v5';

export const routes = {
  '/': Home, // Loaded immediately (good for landing page)
  '/about': lazy(() => import('./pages/About.svelte')), // Lazy loaded
  '/user/:id': lazy(() => import('./pages/User.svelte')), // Lazy loaded
  '/settings': lazy(() => import('./pages/Settings.svelte')) // Lazy loaded
};
```

### TypeScript Support

Full TypeScript support for lazy loading:

```typescript
import { lazy, lazyRoute, type Routes, type LazyComponent } from 'svelte-router-v5';

// Typed lazy routes
const routes: Routes = {
  '/': lazy(() => import('./pages/Home.svelte')),
  '/about': lazy(() => import('./pages/About.svelte')),
  '/user/:id': lazy(() => import('./pages/User.svelte'))
};

// Typed lazy component
const lazyComponent: LazyComponent = () => import('./pages/Profile.svelte');
```

### Best Practices for Lazy Loading

1. **Lazy load heavy components** - Dashboard, admin panels, reports
2. **Keep critical pages immediate** - Home page, login page
3. **Group related routes** - Use `lazyGroup()` for related pages
4. **Preload on hover** - Use `preload()` for better UX
5. **Custom loading states** - Provide branded loading components
6. **Handle errors gracefully** - Show helpful error messages

### Performance Tips

```javascript
// ❌ BAD: Lazy loading tiny components
export const routes = {
  '/': lazy(() => import('./pages/Home.svelte')), // 2KB - too small
  '/about': lazy(() => import('./pages/About.svelte')) // 1KB - too small
};

// ✅ GOOD: Lazy load heavy components only
import Home from './pages/Home.svelte'; // Small, load immediately
import About from './pages/About.svelte'; // Small, load immediately

export const routes = {
  '/': Home,
  '/about': About,
  '/dashboard': lazy(() => import('./pages/Dashboard.svelte')), // 50KB - good candidate
  '/reports': lazy(() => import('./pages/Reports.svelte')), // 100KB - good candidate
  '/admin': lazy(() => import('./pages/Admin.svelte')) // 75KB - good candidate
};
```

### Example: Complete Lazy Loading Setup

```javascript
// routes.js
import { lazy, lazyRoute, lazyGroup } from 'svelte-router-v5';
import Home from './pages/Home.svelte'; // Critical page - load immediately

// Public routes
const publicRoutes = {
  '/': Home,
  '/about': lazy(() => import('./pages/About.svelte')),
  '/contact': lazy(() => import('./pages/Contact.svelte'))
};

// Protected routes with middleware
const protectedRoutes = {
  '/profile': lazyRoute(() => import('./pages/Profile.svelte'), {
    middleware: ['auth']
  }),
  '/settings': lazyRoute(() => import('./pages/Settings.svelte'), {
    middleware: ['auth']
  })
};

// Admin routes (heavy components)
const adminRoutes = lazyGroup({
  '/admin': () => import('./pages/admin/Dashboard.svelte'),
  '/admin/users': () => import('./pages/admin/Users.svelte'),
  '/admin/reports': () => import('./pages/admin/Reports.svelte'),
  '/admin/settings': () => import('./pages/admin/Settings.svelte')
}, {
  middleware: ['auth', 'admin']
});

// Combine all routes
export const routes = {
  ...publicRoutes,
  ...protectedRoutes,
  ...adminRoutes,
  '*': lazy(() => import('./pages/NotFound.svelte'))
};
```

```javascript
// App.svelte
<script>
  import { createNavigation, RouterView, LinkTo } from 'svelte-router-v5';
  import { routes } from './routes.js';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorPage from './components/ErrorPage.svelte';

  const currentComponent = createNavigation(routes);
</script>

<main>
  <nav>
    <LinkTo route="/">Home</LinkTo>
    <LinkTo route="/about">About</LinkTo>
    <LinkTo route="/profile">Profile</LinkTo>
    <LinkTo route="/admin">Admin</LinkTo>
  </nav>

  <RouterView
    currentComponent={$currentComponent}
    loadingComponent={LoadingSpinner}
    errorComponent={ErrorPage}
  />
</main>
```

## License

MIT

---

## Route Groups (prefix + shared middleware/hooks)

Groups let you define a common prefix and shared meta (middleware, beforeEnter/afterEnter) for child routes. Groups are flattened at `setRoutes` time to a plain map; runtime stays fast.

### Basic group

```js
import Home from './pages/Home.svelte';
import Admin from './pages/Admin.svelte';
import Users from './pages/Users.svelte';
import Settings from './pages/Settings.svelte';
import NotFound from './pages/NotFound.svelte';

export const routes = {
  '/': Home,

  group: {
    prefix: '/admin',
    middleware: ['auth', 'admin'],
    beforeEnter: async (ctx) => { console.log('enter admin'); return true; },
    afterEnter: async (ctx) => { console.log('leave admin'); },
    routes: {
      '/': Admin,
      '/users': Users,
      '/settings': {
        component: Settings,
        middleware: ['audit']
      }
    }
  },

  '*': NotFound
};
// Final paths: /admin, /admin/users, /admin/settings
// Effective middleware for /admin/settings: ['auth','admin','audit']
```

### Nested groups

```js
export const routes = {
  group: {
    prefix: '/app',
    middleware: ['auth'],
    routes: {
      group: {
        prefix: '/admin',
        middleware: ['admin'],
        routes: {
          '/': () => import('./pages/admin/Dashboard.svelte'),
          '/users': () => import('./pages/admin/Users.svelte')
        }
      },
      '/profile': () => import('./pages/Profile.svelte')
    }
  },
  '*': () => import('./pages/NotFound.svelte')
};
// Final: /app/admin, /app/admin/users, /app/profile
// Shared middleware resolve: ['auth','admin'] for admin routes
```

### Combining with lazy helpers

```js
import { lazy, lazyRoute } from 'svelte-router-v5';

export const routes = {
  group: {
    prefix: '/dashboard',
    middleware: ['auth'],
    routes: {
      '/': lazy(() => import('./pages/Dashboard.svelte')),
      '/reports': lazyRoute(() => import('./pages/Reports.svelte'), {
        middleware: ['reports-access']
      })
    }
  }
};
```

### Hook composition order

For a grouped route, hooks execute in this order:
- beforeEnter: group.beforeEnter → route.beforeEnter
- afterEnter: route.afterEnter → group.afterEnter

If any beforeEnter returns `false`, navigation is cancelled.

### Backward compatibility

The old flat format still works unchanged. You can mix flat routes with groups. Only if a group adds meta (middleware/hooks), leaf routes are auto-wrapped into `RouteConfig` internally; no API changes required on your side.