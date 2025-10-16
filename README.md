# Svelte Router

Simple and powerful router for Svelte 5 with automatic parameter extraction, reactive navigation, and **regular expression support** for advanced route validation.

## Features

- 🚀 **Automatic parameter extraction** from URL routes
- 🔄 **Reactive navigation** with Svelte stores
- 🎯 **Regular expression support** for advanced route validation
- 📦 **Type-safe** parameter passing
- 🎯 **Support for objects and components** in props
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
import { createNavigation, LinkTo, getRoutParams, type Routes, type RouteParams } from 'svelte-router-v5';

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
    <LinkTo route="/user/id/:id(\\d+)" params={{id: 456}} className="nav-link">User ID 456</LinkTo>
    <LinkTo route="/user/name/:userName([a-zA-Z]+)" params={{userName: "john"}} className="nav-link">User John</LinkTo>
    <LinkTo route="/post/:id(\\d+)/:action(edit|delete)" params={{id: 789, action: "edit"}} className="nav-link">Edit Post 789</LinkTo>
  </nav>
  
  <RouterView currentComponent={$currentComponent} />
</main>
```

**Option 2: Manual component rendering:**
```javascript
// App.svelte
<script>
  import { createNavigation, LinkTo } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<main>
  <nav>
    <LinkTo route="/" className="nav-link">Home</LinkTo>
    <LinkTo route="/user/:id" params={{id: 123}} className="nav-link">User 123</LinkTo>
    <LinkTo route="/user/id/:id(\\d+)" params={{id: 456}} className="nav-link">User ID 456</LinkTo>
    <LinkTo route="/user/name/:userName([a-zA-Z]+)" params={{userName: "john"}} className="nav-link">User John</LinkTo>
    <LinkTo route="/post/:id(\\d+)/:action(edit|delete)" params={{id: 789, action: "edit"}} className="nav-link">Edit Post 789</LinkTo>
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
navigate('/user/id/:id(\\d+)', {id: 123}); // Method 1
navigate('/user/name/:userName([a-zA-Z]+)', {
  params: {userName: 'john'},
  props: {userData: {name: 'John'}}
}); // Method 2
navigate('/post/:id(\\d+)/:action(edit|delete)', {
  id: 789,                    // Goes to params
  action: 'edit',             // Goes to params
  postData: {title: 'Test'}   // Goes to props
}); // Method 3

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

// Regular expression routes
navigate('/user/id/:id(\\d+)', {id: 123}); // Only numbers
navigate('/post/:id(\\d+)/:action(edit|delete)', {id: 789, action: 'edit'}); // Specific values
```

**Method 2: New format with keys (recommended)**
```javascript
navigate('/user/:id', {
  params: {id: 123},
  queryParams: {tab: 'profile'},
  props: {userData: {...}}
});

// Regular expression routes
navigate('/user/name/:userName([a-zA-Z]+)', {
  params: {userName: 'john'},
  props: {userData: {name: 'John'}}
});
```

**Method 3: Automatic detection (smart mode)**
```javascript
navigate('/user/:id', {
  id: 123,                    // Automatically goes to params (matches :id)
  userData: { name: 'John' }, // Automatically goes to props
  settings: { theme: 'dark' } // Automatically goes to props
});

// Regular expression routes
navigate('/post/:id(\\d+)/:action(edit|delete)', {
  id: 789,                    // Goes to params
  action: 'edit',             // Goes to params
  postData: {title: 'Test'}   // Goes to props
});
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

## License

MIT
