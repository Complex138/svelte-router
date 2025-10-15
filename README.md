# Svelte Router

Simple and powerful router for Svelte 5 with automatic parameter extraction and reactive navigation.

## Features

- 🚀 **Automatic parameter extraction** from URL routes
- 🔄 **Reactive navigation** with Svelte stores
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
  '*': NotFound
};

// Typed parameters
const { id: userId, tab }: RouteParams & { tab?: string } = $getRoutParams;
```

## Quick Start

### 1. Create a `routes.js` file in your project root:

```javascript
// routes.js
import Home from './pages/Home.svelte';
import User from './pages/User.svelte';
import Product from './pages/Product.svelte';
import NotFound from './pages/NotFound.svelte';

export const routes = {
  '/': Home,
  '/about': About,
  '/user/:id': User,
  '/user/:id/edit': User,
  '/user/:id/delete/:postId': User,
  '/product/:category/:id': Product,
  '*': NotFound
};
```

### 2. Use the router in your main component:

```javascript
// App.svelte
<script>
  import { createNavigation, LinkTo } from 'svelte-router-v5';
  
  const currentComponent = createNavigation();
</script>

<main>
  <nav>
    <LinkTo route="/" className="nav-link">Home</LinkTo>
    <LinkTo route="/user/:id" params={{id: 123}} className="nav-link">User 123</LinkTo>
  </nav>
  
  <svelte:component this={$currentComponent.component} {...$currentComponent.props} />
</main>
```

### 3. Get parameters in your components:

```javascript
// User.svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // All parameters are automatically available
  $: ({ id: userId, postId, userData, settings } = $getRoutParams);
</script>

<h1>User: {userId}</h1>
{#if postId}
  <p>Post ID: {postId}</p>
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

### Programmatic Navigation

```javascript
// Generate URLs programmatically
import { linkTo } from 'svelte-router';

// Simple URL generation
const userUrl = linkTo('/user/:id', {id: 123});
// Result: '/user/123'

// With query parameters
const profileUrl = linkTo('/user/:id', {id: 123}, {tab: 'profile', edit: 'true'});
// Result: '/user/123?tab=profile&edit=true'

// Use in functions
function navigateToUser(userId, tab = 'profile') {
  const url = linkTo('/user/:id', {id: userId}, {tab});
  window.location.href = url;
}
```

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
  import { getRoutParams } from 'svelte-router';
  
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
  import { LinkTo } from 'svelte-router';
  
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
  import { getRoutParams } from 'svelte-router';
  
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

### `createNavigation()`
Creates a router instance. Automatically loads routes from `/routes.js`.

**Returns:** Svelte store with current component and props.

### `LinkTo` Component
Navigation component with the following props:

- `route` (string) - Route pattern (e.g., "/user/:id")
- `params` (object) - Route parameters object
- `queryParams` (object) - GET parameters object  
- `props` (object) - Additional props to pass to component
- `className` (string) - CSS classes for the link

### `getRoutParams`
Reactive store containing all route parameters, query parameters, and additional props.

**Usage:**
```javascript
$: ({ id, userData, settings } = $getRoutParams);
```

### `linkTo(route, params, queryParams)`
Function to generate URLs programmatically.

**Parameters:**
- `route` (string) - Route pattern
- `params` (object) - Route parameters
- `queryParams` (object) - GET parameters

**Returns:** Generated URL string

### `routeExists(path)`
Check if a route exists for the given path.

### `getRouteComponent(path)`
Get the component for a given path.

## Best Practices

1. **Keep routes.js simple** - Only define route patterns and components
2. **Use descriptive parameter names** - `:userId` instead of `:id` when context matters
3. **Pass complex data via props** - Don't serialize objects in URLs
4. **Use TypeScript** - For better type safety and IDE support
5. **Handle 404s gracefully** - Always include a catch-all route

## License

MIT
