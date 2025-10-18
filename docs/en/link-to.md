# LinkTo - Navigation Component

## Description

Svelte component for creating navigation links with automatic component preloading and parameter support.

## Syntax

```svelte
<LinkTo
  route="/path/:param"
  params={{param: 'value'}}
  queryParams={{tab: 'profile'}}
  props={{userData: {...}}}
  prefetch="hover"
  prefetchDelay={50}
  className="nav-link"
>
  Link Text
</LinkTo>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `route` | String | - | Route pattern (required) |
| `params` | Object | {} | Parameters for dynamic segments |
| `queryParams` | Object | {} | GET parameters |
| `props` | Object | {} | Additional props for component |
| `prefetch` | String | 'hover' | Preload strategy: 'hover', 'visible', 'mount', 'smart', 'none' |
| `prefetchDelay` | Number | 50 | Preload delay in milliseconds |
| `className` | String | '' | CSS class for the link |

## Usage Examples

### Basic Links

```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<nav>
  <LinkTo route="/">Home</LinkTo>
  <LinkTo route="/about">About</LinkTo>
  <LinkTo route="/contact">Contact</LinkTo>
</nav>
```

### With Parameters

```svelte
<script>
  import { LinkTo } from 'svelte-router-v5';
</script>

<!-- Dynamic route -->
<LinkTo route="/user/:id" params={{id: 123}}>
  User 123
</LinkTo>

<!-- With query parameters -->
<LinkTo
  route="/search"
  params={{query: 'svelte'}}
  queryParams={{category: 'tutorials'}}
>
  Search
</LinkTo>

<!-- With additional props -->
<LinkTo
  route="/user/:id"
  params={{id: 123}}
  props={{userData: {name: 'John', role: 'admin'}}}
>
  User Profile
</LinkTo>
```

## Related Functions

- [`navigate`](en/navigate.md) - Programmatic navigation
- [`prefetchRoute`](en/prefetch-route.md) - Manual preloading
