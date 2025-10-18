# linkTo - URL Generation

## Description

Function for generating URLs without navigation. Useful for creating links, logging, or passing URLs to other systems.

## Syntax

```javascript
import { linkTo } from 'svelte-router-v5';

const url = linkTo(route, params, queryParams);
```

## Parameters

- `route` (String) - Route pattern (required)
- `params` (Object) - Parameters for dynamic segments
- `queryParams` (Object) - GET parameters

## Returns

String - Generated URL

## Usage Examples

### Basic URL Generation

```javascript
import { linkTo } from 'svelte-router-v5';

// Simple route
const homeUrl = linkTo('/');
console.log(homeUrl); // '/'

// Route with parameters
const userUrl = linkTo('/user/:id', { id: 123 });
console.log(userUrl); // '/user/123'

// Route with query parameters
const searchUrl = linkTo('/search', {}, { q: 'javascript', category: 'tech' });
console.log(searchUrl); // '/search?q=javascript&category=tech'

// Route with both
const profileUrl = linkTo('/user/:id', { id: 123 }, { tab: 'profile' });
console.log(profileUrl); // '/user/123?tab=profile'
```

### Complex Route Generation

```javascript
import { linkTo } from 'svelte-router-v5';

// Multiple parameters
const postUrl = linkTo('/user/:userId/post/:postId', {
  userId: 123,
  postId: 456
});
console.log(postUrl); // '/user/123/post/456'

// Nested parameters
const commentUrl = linkTo('/user/:userId/post/:postId/comment/:commentId', {
  userId: 123,
  postId: 456,
  commentId: 789
});
console.log(commentUrl); // '/user/123/post/456/comment/789'

// Complex query parameters
const apiUrl = linkTo('/api/:version/:endpoint', {
  version: 'v1',
  endpoint: 'users'
}, {
  page: 1,
  limit: 10,
  sort: 'name',
  order: 'asc'
});
console.log(apiUrl); // '/api/v1/users?page=1&limit=10&sort=name&order=asc'
```

### URL Generation for Navigation

```javascript
import { linkTo } from 'svelte-router-v5';

// Generate URL for navigation
function navigateToUser(userId, tab = 'profile') {
  const url = linkTo('/user/:id', { id: userId }, { tab });
  console.log('Navigating to:', url);
  return url;
}

// Usage
const userUrl = navigateToUser(123, 'settings');
console.log(userUrl); // '/user/123?tab=settings'
```

### URL Generation for Links

```javascript
import { linkTo } from 'svelte-router-v5';

// Generate URLs for HTML links
function generateUserLinks(users) {
  return users.map(user => ({
    id: user.id,
    name: user.name,
    url: linkTo('/user/:id', { id: user.id })
  }));
}

// Usage
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
];

const userLinks = generateUserLinks(users);
console.log(userLinks);
// [
//   { id: 1, name: 'John', url: '/user/1' },
//   { id: 2, name: 'Jane', url: '/user/2' }
// ]
```

### URL Generation for API Calls

```javascript
import { linkTo } from 'svelte-router-v5';

// Generate URLs for API endpoints
function generateApiUrls() {
  return {
    users: linkTo('/api/:version/users', { version: 'v1' }),
    posts: linkTo('/api/:version/posts', { version: 'v1' }),
    comments: linkTo('/api/:version/comments', { version: 'v1' })
  };
}

// Usage
const apiUrls = generateApiUrls();
console.log(apiUrls);
// {
//   users: '/api/v1/users',
//   posts: '/api/v1/posts',
//   comments: '/api/v1/comments'
// }
```

### URL Generation for Logging

```javascript
import { linkTo } from 'svelte-router-v5';

// Generate URLs for logging
function logNavigation(from, to, params) {
  const fromUrl = linkTo(from.route, from.params, from.query);
  const toUrl = linkTo(to.route, to.params, to.query);
  
  console.log(`Navigation: ${fromUrl} -> ${toUrl}`);
  
  // Send to analytics
  analytics.track('navigation', {
    from: fromUrl,
    to: toUrl,
    params: params
  });
}

// Usage
logNavigation(
  { route: '/', params: {}, query: {} },
  { route: '/user/:id', params: { id: 123 }, query: { tab: 'profile' } }
);
// Navigation: / -> /user/123?tab=profile
```

### URL Generation for Breadcrumbs

```javascript
import { linkTo } from 'svelte-router-v5';

// Generate breadcrumb URLs
function generateBreadcrumbs(path) {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const route = '/' + segments.slice(0, i + 1).join('/');
    const url = linkTo(route);
    
    breadcrumbs.push({
      name: segment,
      url: url,
      active: i === segments.length - 1
    });
  }
  
  return breadcrumbs;
}

// Usage
const breadcrumbs = generateBreadcrumbs('/user/123/profile');
console.log(breadcrumbs);
// [
//   { name: 'user', url: '/user', active: false },
//   { name: '123', url: '/user/123', active: false },
//   { name: 'profile', url: '/user/123/profile', active: true }
// ]
```

### URL Generation for Sitemap

```javascript
import { linkTo } from 'svelte-router-v5';

// Generate sitemap URLs
function generateSitemap(routes) {
  return routes.map(route => {
    const url = linkTo(route.pattern, route.params, route.query);
    return {
      url: url,
      lastmod: route.lastmod || new Date().toISOString(),
      changefreq: route.changefreq || 'monthly',
      priority: route.priority || 0.5
    };
  });
}

// Usage
const routes = [
  { pattern: '/', params: {}, query: {} },
  { pattern: '/about', params: {}, query: {} },
  { pattern: '/user/:id', params: { id: 123 }, query: {} }
];

const sitemap = generateSitemap(routes);
console.log(sitemap);
```

### URL Generation for Testing

```javascript
import { linkTo } from 'svelte-router-v5';

// Generate test URLs
function generateTestUrls() {
  return {
    home: linkTo('/'),
    about: linkTo('/about'),
    user: linkTo('/user/:id', { id: 123 }),
    userWithTab: linkTo('/user/:id', { id: 123 }, { tab: 'profile' }),
    search: linkTo('/search', {}, { q: 'test', category: 'tech' })
  };
}

// Usage
const testUrls = generateTestUrls();
console.log('Test URLs:', testUrls);
```

## Best Practices

1. **Use for non-navigation** - Use linkTo for URL generation, not navigation
2. **Validate parameters** - Ensure parameters are valid before generation
3. **Handle missing parameters** - Provide default values for optional parameters
4. **Encode properly** - Let the function handle URL encoding
5. **Test thoroughly** - Test URL generation with various parameter combinations

## Related Functions

- [`navigate`](navigate.md) - Programmatic navigation
- [`LinkTo`](link-to.md) - Navigation component
- [`route-parameters`](route-parameters.md) - Route parameters overview