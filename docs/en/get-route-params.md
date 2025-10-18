# getRoutParams - Reactive Parameters

## Description

Reactive Svelte store containing all route parameters, query parameters, and additional props. Automatically updates on navigation.

## Syntax

```javascript
import { getRoutParams } from 'svelte-router-v5';

// In component
$: ({
  routeParam1,
  routeParam2,
  queryParam1,
  queryParam2,
  additionalProp1
} = $getRoutParams);
```

## Return Data Structure

```javascript
{
  // Route parameters (from dynamic segments)
  id: '123',
  slug: 'my-post',
  category: 'tech',
  
  // Query parameters (from URL query string)
  tab: 'profile',
  sort: 'date',
  page: '2',
  
  // Additional props (passed via navigation)
  userData: { name: 'John', email: 'john@example.com' },
  settings: { theme: 'dark', notifications: true }
}
```

## Usage Examples

### Basic Parameter Access

```svelte
<!-- User.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Get specific parameters
  $: ({ id, tab } = $getRoutParams);
  
  // Use parameters
  $: console.log('User ID:', id);
  $: console.log('Current tab:', tab);
</script>

<h1>User {id}</h1>
{#if tab}
  <p>Current tab: {tab}</p>
{/if}
```

### All Parameters

```svelte
<!-- Product.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  // Get all parameters
  $: params = $getRoutParams;
  
  // Use parameters
  $: console.log('All parameters:', params);
</script>

<h1>Product {params.id}</h1>
<p>Category: {params.category}</p>
<p>Sort: {params.sort}</p>
```

### Parameter Transformation

```svelte
<!-- Post.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ id, action, userData } = $getRoutParams);
  
  // Transform parameters
  $: postId = parseInt(id);
  $: isEdit = action === 'edit';
  $: isDelete = action === 'delete';
  $: userName = userData?.name || 'Unknown';
</script>

<h1>Post {postId}</h1>
<p>Author: {userName}</p>

{#if isEdit}
  <form>
    <!-- Edit form -->
  </form>
{:else if isDelete}
  <p>Are you sure you want to delete this post?</p>
  <button>Confirm Delete</button>
{/if}
```

### Conditional Rendering

```svelte
<!-- Dashboard.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ section, subsection, filter } = $getRoutParams);
  
  // Conditional rendering based on parameters
  $: showOverview = section === 'overview';
  $: showUsers = section === 'users';
  $: showSettings = section === 'settings';
  $: showUserDetails = section === 'users' && subsection;
</script>

<div class="dashboard">
  {#if showOverview}
    <Overview />
  {:else if showUsers}
    {#if showUserDetails}
      <UserDetails userId={subsection} />
    {:else}
      <Users filter={filter} />
    {/if}
  {:else if showSettings}
    <Settings />
  {/if}
</div>
```

### Parameter Validation

```svelte
<!-- User.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ id, tab } = $getRoutParams);
  
  // Validate parameters
  $: isValidId = /^\d+$/.test(id);
  $: validTabs = ['profile', 'settings', 'orders'];
  $: isValidTab = validTabs.includes(tab);
  
  // Use validated parameters
  $: userId = isValidId ? parseInt(id) : null;
  $: currentTab = isValidTab ? tab : 'profile';
</script>

{#if !isValidId}
  <div class="error">
    <h1>Invalid User ID</h1>
    <p>User ID must be a number.</p>
  </div>
{:else if !isValidTab}
  <div class="error">
    <h1>Invalid Tab</h1>
    <p>Tab must be one of: {validTabs.join(', ')}</p>
  </div>
{:else}
  <h1>User {userId}</h1>
  <p>Current tab: {currentTab}</p>
{/if}
```

## Advanced Usage

### Parameter Watching

```svelte
<!-- Search.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ q, category, sort, page } = $getRoutParams);
  
  // Watch for parameter changes
  $: if (q) {
    performSearch(q, { category, sort, page });
  }
  
  // Watch for specific parameter changes
  $: if (category) {
    updateCategoryFilter(category);
  }
</script>

<h1>Search Results</h1>
{#if q}
  <p>Searching for: {q}</p>
  <p>Category: {category}</p>
  <p>Sort: {sort}</p>
  <p>Page: {page}</p>
{/if}
```

### Parameter Persistence

```svelte
<!-- ProductList.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ category, sort, page } = $getRoutParams);
  
  // Persist parameters in localStorage
  $: if (category || sort || page) {
    localStorage.setItem('productListParams', JSON.stringify({
      category,
      sort,
      page
    }));
  }
  
  // Load persisted parameters on mount
  onMount(() => {
    const persisted = localStorage.getItem('productListParams');
    if (persisted) {
      const params = JSON.parse(persisted);
      navigate('/products', {}, params);
    }
  });
</script>

<div class="product-list">
  <h1>Products</h1>
  {#if category}
    <p>Category: {category}</p>
  {/if}
  {#if sort}
    <p>Sort by: {sort}</p>
  {/if}
  {#if page}
    <p>Page: {page}</p>
  {/if}
</div>
```

### Parameter Defaults

```svelte
<!-- Blog.svelte -->
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ year, month, category, sort } = $getRoutParams);
  
  // Set defaults
  $: currentYear = year || new Date().getFullYear();
  $: currentMonth = month || new Date().getMonth() + 1;
  $: currentCategory = category || 'all';
  $: currentSort = sort || 'date';
  
  // Load blog posts with parameters
  $: loadPosts({
    year: currentYear,
    month: currentMonth,
    category: currentCategory,
    sort: currentSort
  });
</script>

<h1>Blog</h1>
<p>Year: {currentYear}</p>
<p>Month: {currentMonth}</p>
<p>Category: {currentCategory}</p>
<p>Sort: {currentSort}</p>
```

## Best Practices

1. **Destructure parameters** - Use destructuring for cleaner code
2. **Validate parameters** - Always validate parameter values
3. **Handle missing parameters** - Provide default values
4. **Watch for changes** - Use reactive statements to watch parameter changes
5. **Transform when needed** - Convert string parameters to appropriate types

## Related Functions

- [`route-parameters`](route-parameters.md) - Route parameters overview
- [`parameter-helpers`](parameter-helpers.md) - Parameter helper functions
- [`navigate`](navigate.md) - Programmatic navigation