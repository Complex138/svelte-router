# registerMiddleware - Middleware Registration

## Description

Function for registering middleware functions in the router system. Middleware allows executing code before/after navigation.

## Syntax

```javascript
import { registerMiddleware } from 'svelte-router-v5';

registerMiddleware(name, middlewareFunction);
```

## Parameters

- `name` (String) - Unique middleware name (required)
- `middlewareFunction` (Function) - Middleware function (required)

## Middleware Function Structure

```javascript
async function middlewareFunction(context) {
  // context contains navigation information
  console.log('Navigation:', context.from, '->', context.to);

  // Can block navigation
  if (someCondition) {
    return false;
  }

  // Can add data to context
  context.props.userData = await fetchUserData();

  // Allow navigation
  return true;
}
```

## Middleware Context

The context object contains:

```javascript
{
  from: '/previous-page',     // Previous path
  to: '/current-page',       // Current path
  params: {id: '123'},       // Route parameters
  query: {tab: 'profile'},   // Query parameters
  props: {},                 // Additional props
  navigate: function,        // Navigation function
  route: '/current-page'     // Current route pattern
}
```

## Usage Examples

### Basic Registration

```javascript
import { registerMiddleware } from 'svelte-router-v5';

// Authentication middleware
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    context.navigate('/login');
    return false;
  }
  
  return true;
});

// Admin check middleware
registerMiddleware('admin', async (context) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role !== 'admin') {
    context.navigate('/unauthorized');
    return false;
  }
  
  return true;
});
```

### Advanced Middleware

```javascript
// Logging middleware
registerMiddleware('logger', async (context) => {
  console.log(`Navigation: ${context.from} -> ${context.to}`, {
    params: context.params,
    query: context.query,
    timestamp: new Date().toISOString()
  });
  
  return true;
});

// Data loading middleware
registerMiddleware('loadData', async (context) => {
  if (context.to.startsWith('/dashboard')) {
    try {
      const dashboardData = await fetchDashboardData();
      context.props.dashboardData = dashboardData;
      return true;
    } catch (error) {
      console.error('Failed to load data:', error);
      context.navigate('/error');
      return false;
    }
  }
  
  return true;
});

// Rate limiting middleware
registerMiddleware('rateLimit', async (context) => {
  const userId = context.user?.id || 'anonymous';
  const key = `rate_limit_${userId}`;
  
  const requests = parseInt(localStorage.getItem(key) || '0');
  const now = Date.now();
  const lastReset = parseInt(localStorage.getItem(`${key}_reset`) || '0');
  
  // Reset counter every hour
  if (now - lastReset > 3600000) {
    localStorage.setItem(key, '0');
    localStorage.setItem(`${key}_reset`, now.toString());
  }
  
  if (requests >= 100) {
    context.navigate('/rate-limited');
    return false;
  }
  
  localStorage.setItem(key, (requests + 1).toString());
  return true;
});
```

### Usage in Routes

```javascript
export const routes = {
  '/': Home,
  
  '/profile': {
    component: Profile,
    middleware: ['auth', 'logger']
  },
  
  '/admin': {
    component: Admin,
    middleware: ['auth', 'admin', 'logger']
  },
  
  group: {
    prefix: '/api',
    middleware: ['rateLimit'],
    routes: {
      '/users': APIUsers,
      '/posts': APIPosts
    }
  }
};
```

### Global Middleware

```javascript
import { registerGlobalMiddleware } from 'svelte-router-v5';

// Global before middleware
registerGlobalMiddleware('before', async (context) => {
  console.log(`Global before: ${context.from} -> ${context.to}`);
  return true;
});

// Global after middleware
registerGlobalMiddleware('after', async (context) => {
  console.log(`Global after: navigation completed to ${context.to}`);
  return true;
});

// Global error middleware
registerGlobalMiddleware('error', async (error, context) => {
  console.error('Global error:', error);
  return true;
});
```

## Best Practices

1. **Descriptive names** - Use clear middleware names
2. **Async functions** - All middleware can be asynchronous
3. **Error handling** - Handle errors in middleware
4. **Performance** - Don't do heavy operations in middleware
5. **Context usage** - Pass data through context.props

## Related Functions

- [`registerGlobalMiddleware`](register-global-middleware.md) - Global middleware registration
- [`middleware`](middleware.md) - Middleware system overview