# Route Parameters

## Description

System for working with route parameters and query parameters. Supports automatic parameter extraction from URL and reactive subscription to their changes.

## Route Syntax with Parameters

### Dynamic Segments

```javascript
export const routes = {
  '/user/:id': User,                    // id parameter
  '/post/:id/comments': PostComments,   // id parameter
  '/category/:slug': CategoryPage,       // slug parameter
  '/user/:userId/post/:postId': Post,   // Multiple parameters
};
```

### Regular Expressions

```javascript
export const routes = {
  '/user/id/:id(\\d+)': User,                    // Only digits
  '/user/name/:name([a-zA-Z]+)': User,           // Only letters
  '/post/:id(\\d+)/:action(edit|delete)': Post,  // Specific values
  '/api/:version(v\\d+)/:endpoint': API,         // Version pattern
};
```

### Complex Patterns

```javascript
export const routes = {
  '/user/:id(\\d+)': User,                           // Numeric ID
  '/user/name/:name([a-zA-Z\\s]+)': User,           // Name with spaces
  '/post/:slug([a-zA-Z0-9-]+)': Post,              // URL-friendly slug
  '/api/:version(v\\d+\\.\\d+)': API,               // Version with dots
  '/file/:path(.*)': FileViewer,                    // Any path
};
```

## Parameter Access

### Using getRoutParams

```svelte
<!-- User.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Reactive parameter access
  $: ({ id, tab, userData } = $getRoutParams);
  
  // Use parameters
  $: console.log('User ID:', id);
  $: console.log('Tab:', tab);
  $: console.log('User Data:', userData);
</script>

<h1>User: {id}</h1>
{#if tab}
  <p>Current tab: {tab}</p>
{/if}
```

### Direct Parameter Access

```svelte
<!-- Post.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Get specific parameters
  $: postId = $getRoutParams.id;
  $: action = $getRoutParams.action;
  
  // Conditional rendering based on parameters
  $: isEdit = action === 'edit';
  $: isDelete = action === 'delete';
</script>

{#if isEdit}
  <h1>Edit Post {postId}</h1>
  <form>
    <!-- Edit form -->
  </form>
{:else if isDelete}
  <h1>Delete Post {postId}</h1>
  <p>Are you sure you want to delete this post?</p>
  <button>Confirm Delete</button>
{/if}
```

## Query Parameters

### Accessing Query Parameters

```svelte
<!-- Search.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Get query parameters
  $: ({ q, category, sort, page } = $getRoutParams);
  
  // Use query parameters
  $: searchQuery = q || '';
  $: selectedCategory = category || 'all';
  $: sortOrder = sort || 'relevance';
  $: currentPage = parseInt(page) || 1;
</script>

<h1>Search Results</h1>
<p>Query: {searchQuery}</p>
<p>Category: {selectedCategory}</p>
<p>Sort: {sortOrder}</p>
<p>Page: {currentPage}</p>
```

### URL Examples

```javascript
// URL: /search?q=javascript&category=programming&sort=date&page=2
// Parameters:
// - q: 'javascript'
// - category: 'programming'
// - sort: 'date'
// - page: '2'
```

## Parameter Helpers

### getRouteParams()

Get current route parameters.

```javascript
import { getRouteParams } from 'svelte-router-v5';

const params = getRouteParams();
console.log(params); // { id: '123', tab: 'profile' }
```

### getQueryParams()

Get current query parameters.

```javascript
import { getQueryParams } from 'svelte-router-v5';

const query = getQueryParams();
console.log(query); // { q: 'search', category: 'tech' }
```

### getAllParams()

Get all parameters (route + query).

```javascript
import { getAllParams } from 'svelte-router-v5';

const allParams = getAllParams();
console.log(allParams); // { id: '123', tab: 'profile', q: 'search' }
```

## Advanced Usage

### Parameter Validation

```svelte
<!-- User.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ id } = $getRoutParams);
  
  // Validate ID
  $: isValidId = /^\d+$/.test(id);
  $: userId = isValidId ? parseInt(id) : null;
  
  // Load user data
  $: if (userId) {
    loadUser(userId);
  }
</script>

{#if !isValidId}
  <div class="error">
    <h1>Invalid User ID</h1>
    <p>User ID must be a number.</p>
  </div>
{:else if userId}
  <h1>User {userId}</h1>
  <!-- User content -->
{/if}
```

### Parameter Transformation

```svelte
<!-- Product.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ id, category, sort } = $getRoutParams);
  
  // Transform parameters
  $: productId = parseInt(id);
  $: categorySlug = category?.toLowerCase();
  $: sortOrder = sort || 'name';
  
  // Load product data
  $: if (productId) {
    loadProduct(productId, { category: categorySlug, sort: sortOrder });
  }
</script>

<h1>Product {productId}</h1>
{#if categorySlug}
  <p>Category: {categorySlug}</p>
{/if}
```

### Dynamic Route Matching

```javascript
// routes.js
export const routes = {
  // Numeric IDs
  '/user/:id(\\d+)': User,
  
  // Usernames
  '/user/:username([a-zA-Z0-9_]+)': User,
  
  // Email addresses
  '/user/email/:email([^/]+@[^/]+)': UserByEmail,
  
  // UUIDs
  '/user/uuid/:uuid([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})': UserByUUID,
};
```

## Navigation with Parameters

### Programmatic Navigation

```javascript
import { navigate } from 'svelte-router-v5';

// Navigate with parameters
navigate('/user/:id', {id: 123});

// Navigate with query parameters
navigate('/search', {}, {q: 'javascript', category: 'programming'});

// Navigate with both
navigate('/user/:id', {id: 123}, {tab: 'profile'});
```

### LinkTo Component

```svelte
<LinkTo 
  route="/user/:id" 
  params={{id: 123}}
  queryParams={{tab: 'profile'}}
>
  User Profile
</LinkTo>
```

## Real-World Examples

### E-commerce Product Page

```svelte
<!-- Product.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ id, variant, color, size } = $getRoutParams);
  
  // Load product data
  $: if (id) {
    loadProduct(id, { variant, color, size });
  }
</script>

{#if product}
  <h1>{product.name}</h1>
  <p>Price: ${product.price}</p>
  
  {#if variant}
    <p>Variant: {variant}</p>
  {/if}
  
  {#if color}
    <p>Color: {color}</p>
  {/if}
  
  {#if size}
    <p>Size: {size}</p>
  {/if}
{/if}
```

### Blog Article Page

```svelte
<!-- Article.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ slug, year, month } = $getRoutParams);
  
  // Load article data
  $: if (slug) {
    loadArticle(slug, { year, month });
  }
</script>

{#if article}
  <article>
    <h1>{article.title}</h1>
    <p class="meta">
      Published: {article.date}
      {#if year && month}
        (Archived: {year}/{month})
      {/if}
    </p>
    <div class="content">
      {@html article.content}
    </div>
  </article>
{/if}
```

### Admin Dashboard

```svelte
<!-- AdminDashboard.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ section, subsection, filter, sort } = $getRoutParams);
  
  // Load dashboard data
  $: loadDashboardData({ section, subsection, filter, sort });
</script>

<div class="admin-dashboard">
  <nav class="admin-nav">
    <LinkTo route="/admin" params={{section: 'overview'}}>
      Overview
    </LinkTo>
    <LinkTo route="/admin" params={{section: 'users'}}>
      Users
    </LinkTo>
    <LinkTo route="/admin" params={{section: 'settings'}}>
      Settings
    </LinkTo>
  </nav>
  
  <main class="admin-content">
    {#if section === 'overview'}
      <Overview />
    {:else if section === 'users'}
      <Users filter={filter} sort={sort} />
    {:else if section === 'settings'}
      <Settings subsection={subsection} />
    {/if}
  </main>
</div>
```

## Best Practices

1. **Validate parameters** - Always validate parameter values
2. **Use appropriate types** - Convert string parameters to appropriate types
3. **Handle missing parameters** - Provide default values for optional parameters
4. **Use descriptive names** - Use clear parameter names
5. **Test edge cases** - Test with various parameter combinations

## Related Functions

- [`getRoutParams`](get-route-params.md) - Reactive parameter access
- [`parameter-helpers`](parameter-helpers.md) - Parameter helper functions
- [`navigate`](navigate.md) - Programmatic navigation