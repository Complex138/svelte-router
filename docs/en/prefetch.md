# Prefetch System

## Description

System for automatic component preloading for instant page transitions. Supports multiple prefetch strategies and smart navigation prediction.

## Prefetch Strategies

### hover (default)

Preloads component when hovering over link.

```svelte
<LinkTo route="/heavy-page" prefetch="hover">
  Heavy Page
</LinkTo>
```

### visible

Preloads component when link appears in viewport.

```svelte
<LinkTo route="/lazy-content" prefetch="visible">
  Lazy Content
</LinkTo>
```

### mount

Preloads component when parent component mounts.

```svelte
<LinkTo route="/important-page" prefetch="mount">
  Important Page
</LinkTo>
```

### smart

Uses smart prefetch with navigation prediction.

```svelte
<LinkTo route="/dashboard" prefetch="smart">
  Dashboard
</LinkTo>
```

### none

Disables prefetching.

```svelte
<LinkTo route="/light-page" prefetch="none">
  Light Page
</LinkTo>
```

## Smart Prefetch

Smart prefetch learns from user navigation patterns and predicts likely next routes.

### Basic Usage

```svelte
<script>
  import { createNavigation, LinkTo } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<LinkTo route="/dashboard" prefetch="smart">
  Dashboard
</LinkTo>
```

### Configuration

```javascript
import { createSmartPrefetch } from 'svelte-router-v5';

// Create smart prefetch with history size
const smartPrefetch = createSmartPrefetch(10);

// Record navigation
smartPrefetch.recordNavigation('/home', '/dashboard');

// Predict next routes
const predictions = smartPrefetch.predictNext('/dashboard');
console.log(predictions); // ['/dashboard/settings', '/dashboard/profile']
```

## Prefetch Functions

### `prefetchRoute(route, params, queryParams)`

Manually prefetch a route.

```javascript
import { prefetchRoute } from 'svelte-router-v5';

// Prefetch route
prefetchRoute('/user/:id', {id: 123}, {tab: 'profile'});
```

### `prefetchAll(routes)`

Prefetch multiple routes.

```javascript
import { prefetchAll } from 'svelte-router-v5';

const routes = [
  { route: '/dashboard', params: {} },
  { route: '/profile', params: {} },
  { route: '/settings', params: {} }
];

prefetchAll(routes);
```

### `prefetchOnIdle()`

Prefetch routes when browser is idle.

```javascript
import { prefetchOnIdle } from 'svelte-router-v5';

// Prefetch important routes on idle
prefetchOnIdle([
  { route: '/dashboard', params: {} },
  { route: '/profile', params: {} }
]);
```

### `prefetchRelated(route)`

Prefetch related routes based on current route.

```javascript
import { prefetchRelated } from 'svelte-router-v5';

// Prefetch related routes
prefetchRelated('/user/123');
```

## Advanced Prefetch

### Network-Aware Prefetch

```javascript
import { prefetchWithNetworkAware } from 'svelte-router-v5';

// Prefetch only on good connection
prefetchWithNetworkAware('/heavy-page', {
  minConnectionSpeed: 1000, // 1Mbps
  maxLatency: 100 // 100ms
});
```

### Hover Prefetch

```javascript
import { createHoverPrefetch } from 'svelte-router-v5';

const hoverPrefetch = createHoverPrefetch({
  delay: 200, // 200ms delay
  timeout: 5000 // 5s timeout
});

// Use in component
hoverPrefetch.prefetch('/route');
```

### Visibility Prefetch

```javascript
import { createVisibilityPrefetch } from 'svelte-router-v5';

const visibilityPrefetch = createVisibilityPrefetch({
  threshold: 0.5, // 50% visible
  rootMargin: '100px'
});

// Use in component
visibilityPrefetch.prefetch('/route');
```

## Usage Examples

### E-commerce Site

```svelte
<!-- Product listing -->
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<div class="products">
  {#each products as product}
    <LinkTo 
      route="/product/:id" 
      params={{id: product.id}}
      prefetch="hover"
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </LinkTo>
  {/each}
</div>
```

### Admin Dashboard

```svelte
<!-- Admin navigation -->
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<nav class="admin-nav">
  <LinkTo route="/admin" prefetch="mount">
    Dashboard
  </LinkTo>
  <LinkTo route="/admin/users" prefetch="smart">
    Users
  </LinkTo>
  <LinkTo route="/admin/settings" prefetch="smart">
    Settings
  </LinkTo>
</nav>
```

### Blog Site

```svelte
<!-- Article list -->
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<div class="articles">
  {#each articles as article}
    <article>
      <LinkTo 
        route="/article/:slug" 
        params={{slug: article.slug}}
        prefetch="visible"
      >
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
      </LinkTo>
    </article>
  {/each}
</div>
```

## Performance Tips

### 1. Use Appropriate Strategies

```svelte
<!-- Critical pages - preload on mount -->
<LinkTo route="/checkout" prefetch="mount">
  Checkout
</LinkTo>

<!-- User-generated content - preload on hover -->
<LinkTo route="/user/:id" prefetch="hover">
  User Profile
</LinkTo>

<!-- Heavy pages - preload on visibility -->
<LinkTo route="/reports" prefetch="visible">
  Reports
</LinkTo>
```

### 2. Smart Prefetch for User Flows

```javascript
// routes.js
export const routes = {
  '/': Home,
  '/products': Products,
  '/product/:id': Product,
  '/cart': Cart,
  '/checkout': Checkout,
  '/order/:id': Order
};

// Smart prefetch will learn:
// / -> /products -> /product/123 -> /cart -> /checkout
```

### 3. Network-Aware Prefetching

```javascript
import { prefetchWithNetworkAware } from 'svelte-router-v5';

// Only prefetch on good connection
if (navigator.connection?.effectiveType === '4g') {
  prefetchWithNetworkAware('/heavy-dashboard');
}
```

## Best Practices

1. **Choose right strategy** - Use appropriate prefetch strategy for each route
2. **Monitor performance** - Track prefetch impact on performance
3. **Respect user data** - Use network-aware prefetching
4. **Test thoroughly** - Test prefetch behavior across devices
5. **Balance speed vs data** - Don't prefetch everything

## Related Functions

- [`LinkTo`](link-to.md) - Navigation component with prefetch
- [`lazy-loading`](lazy-loading.md) - Component lazy loading
- [`smart-prefetch`](smart-prefetch.md) - Smart prefetch system