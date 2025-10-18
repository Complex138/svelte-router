# RouterView - Route Rendering

## Description

Svelte component for displaying the current route. Automatically handles loading states, errors, and layout application.

## Syntax

```svelte
<RouterView
  currentComponent={currentComponentStore}
  loadingComponent={LoadingComponent}
  errorComponent={ErrorComponent}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentComponent` | Object | - | Store with current component (required) |
| `loadingComponent` | Component | null | Custom component for loading state |
| `errorComponent` | Component | null | Custom component for error display |

## CurrentComponent Structure

```javascript
{
  component: Component,     // Current route component
  props: Object,           // Props for the component
  loading: Boolean,        // Loading state
  error: String|null,      // Loading error
  layout: String|null      // Layout name
}
```

## Usage Examples

### Basic Usage

```svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<main>
  <RouterView currentComponent={$currentComponent} />
</main>
```

### With Custom Loading and Error Components

```svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorPage from './components/ErrorPage.svelte';
  import { routes } from './routes.js';

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

### Custom LoadingSpinner

```svelte
<!-- LoadingSpinner.svelte -->
<script>
  export let message = 'Loading...';
</script>

<div class="loading-spinner">
  <div class="spinner"></div>
  <p>{message}</p>
</div>

<style>
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    min-height: 200px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
```

### Custom ErrorPage

```svelte
<!-- ErrorPage.svelte -->
<script>
  export let error = 'An error occurred';
</script>

<div class="error-page">
  <h1>Error</h1>
  <p class="error-message">{error}</p>
  <button on:click={() => window.location.reload()}>
    Reload Page
  </button>
</div>

<style>
  .error-page {
    padding: 2rem;
    text-align: center;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    margin-top: 1rem;
  }
</style>
```

## Important Notes

1. **Required prop** - `currentComponent` must be provided
2. **Automatic handling** - Loading and errors are handled automatically
3. **Layouts** - Automatically applies layouts if specified
4. **Performance** - Uses preloaded components

## Related Functions

- [`createNavigation`](en/create-navigation.md) - Router creation
- [`LinkTo`](en/link-to.md) - Link component
