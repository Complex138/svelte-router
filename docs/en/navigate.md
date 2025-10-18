# navigate - Programmatic Navigation

## Description

Function for programmatic navigation between routes. Supports three parameter formats and automatic data type detection.

## Syntax

```javascript
import { navigate } from 'svelte-router-v5';

// Method 1: Old format
navigate(route, params, queryParams, additionalProps);

// Method 2: New format with keys
navigate(route, {
  params: {...},
  queryParams: {...},
  props: {...}
});

// Method 3: Auto-detection
navigate(route, {
  paramName: 'value',     // Automatically goes to params
  propName: {...}         // Automatically goes to props
});
```

## Parameters

- `route` (String) - Route pattern (required)
- `paramsOrConfig` (Object) - Parameters or configuration object

### Configuration Object (Methods 2 and 3)

```javascript
{
  params?: Object,        // Parameters for dynamic segments
  queryParams?: Object,   // GET parameters
  props?: Object         // Additional props for component
}
```

## Usage Examples

### Method 1: Old Format

```javascript
import { navigate } from 'svelte-router-v5';

// Route parameters only
navigate('/user/:id', {id: 123});

// With query parameters
navigate('/search', {query: 'svelte'}, {category: 'tutorials'});

// With props for component
navigate('/user/:id', {id: 123}, {}, {userData: {...}});
```

### Method 2: New Format with Keys

```javascript
import { navigate } from 'svelte-router-v5';

// All parameters explicitly specified
navigate('/user/:id', {
  params: {id: 123},
  queryParams: {tab: 'profile'},
  props: {userData: {...}}
});

// Only some parameters
navigate('/search', {
  params: {query: 'svelte'},
  queryParams: {category: 'docs'}
});
```

### Method 3: Auto-Detection

```javascript
import { navigate } from 'svelte-router-v5';

// Automatically determines where to put data
navigate('/user/:id', {
  id: 123,                    // Goes to params (matches :id)
  userData: {name: 'John'},  // Goes to props
  settings: {theme: 'dark'}   // Goes to props
});

// Mixed parameters
navigate('/post/:id/comments', {
  id: 456,                    // Goes to params
  commentId: 789,             // Goes to props (doesn't match pattern)
  sortBy: 'date'              // Goes to query (short name)
});
```

## Practical Examples

### Navigation After Successful Action

```javascript
<script>
  import { navigate } from 'svelte-router-v5';

  async function handleLogin(credentials) {
    try {
      const user = await loginAPI(credentials);
      // Redirect after successful login
      navigate('/dashboard', {
        userData: user,
        message: 'Welcome back!'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  function goToUserProfile(userId) {
    navigate('/user/:id', {
      id: userId,
      tab: 'profile'
    });
  }
</script>
```

### Conditional Navigation

```javascript
<script>
  import { navigate } from 'svelte-router-v5';

  function handleAction(action, itemId) {
    switch (action) {
      case 'edit':
        navigate('/edit/:id', {id: itemId});
        break;
      case 'delete':
        if (confirm('Delete item?')) {
          navigate('/delete/:id', {id: itemId});
        }
        break;
      case 'view':
        navigate('/view/:id', {
          id: itemId,
          readonly: true
        });
        break;
    }
  }
</script>
```

## Important Notes

1. **Auto-detection** - Works only if property name matches route parameter
2. **Middleware** - Executed automatically during navigation
3. **Browser history** - Adds entry to history API
4. **Preloading** - Doesn't trigger preloading automatically

## Related Functions

- [`linkTo`](en/generate-url.md) - URL generation without navigation
- [`LinkTo`](en/link-to.md) - Component for declarative navigation
- [`prefetchRoute`](en/prefetch-route.md) - Route preloading

