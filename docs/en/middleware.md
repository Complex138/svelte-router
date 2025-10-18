# Middleware System

## Description

Powerful middleware system for handling navigation, authentication, authorization, and other tasks. Supports three types of middleware: route-specific, global, and before/after hooks.

## Middleware Registration

### Basic Registration

```javascript
import { registerMiddleware } from 'svelte-router-v5';

// Register middleware function
registerMiddleware('auth', async (context) => {
  // Check authentication
  const token = localStorage.getItem('auth_token');

  if (!token) {
    // Redirect to login page
    context.navigate('/login');
    return false; // Block navigation
  }

  // Allow navigation
  return true;
});
```

### Global Middleware

```javascript
import { registerGlobalMiddleware } from 'svelte-router-v5';

// Register global middleware for all routes
registerGlobalMiddleware('before', async (context) => {
  console.log(`Navigation from ${context.from} to ${context.to}`);
  return true;
});

registerGlobalMiddleware('after', async (context) => {
  console.log(`Navigation completed to ${context.to}`);
  return true;
});

registerGlobalMiddleware('error', async (error, context) => {
  console.error('Navigation error:', error);
  // Can send to monitoring system
  return true;
});
```

## Usage in Routes

### In Specific Route

```javascript
export const routes = {
  '/': Home,

  '/profile': {
    component: Profile,
    middleware: ['auth', 'profile-access']
  },

  '/admin': {
    component: Admin,
    middleware: ['auth', 'admin'],
    beforeEnter: async (context) => {
      console.log('Entering admin panel');
      return true;
    },
    afterEnter: async (context) => {
      console.log('Leaving admin panel');
      return true;
    }
  }
};
```

### In Route Groups

```javascript
export const routes = {
  '/': Home,

  group: {
    prefix: '/admin',
    middleware: ['auth', 'admin'], // Common middleware for group
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers,
      '/settings': {
        component: AdminSettings,
        middleware: ['audit'] // Additional middleware
      }
    }
  }
};
```

## Middleware Context

Each middleware receives a context object with navigation information:

```javascript
{
  from: '/previous-page',     // Previous path
  to: '/current-page',       // Current path
  params: {id: '123'},       // Route parameters
  query: {tab: 'profile'},   // Query parameters
  props: {userData: {...}},  // Additional props
  navigate: function,        // Navigation function
  route: '/current-page'     // Current route pattern
}
```

## Middleware Examples

### Authentication

```javascript
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    context.navigate('/login');
    return false;
  }

  // Add user to context for other middleware
  context.user = user;
  return true;
});
```

### Permission Check

```javascript
registerMiddleware('admin', async (context) => {
  if (!context.user) {
    context.navigate('/login');
    return false;
  }

  if (context.user.role !== 'admin') {
    context.navigate('/unauthorized');
    return false;
  }

  return true;
});
```

### Logging

```javascript
registerMiddleware('logger', async (context) => {
  console.log(`Navigation: ${context.from} -> ${context.to}`, {
    params: context.params,
    query: context.query,
    user: context.user?.id
  });

  // Send to analytics
  if (typeof analytics !== 'undefined') {
    analytics.track('page_view', {
      from: context.from,
      to: context.to,
      userId: context.user?.id
    });
  }

  return true;
});
```

### API Calls

```javascript
registerMiddleware('api-data', async (context) => {
  if (context.to.startsWith('/dashboard')) {
    try {
      // Load data for dashboard
      const dashboardData = await fetchDashboardData();
      context.props.dashboardData = dashboardData;
      return true;
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      context.navigate('/error');
      return false;
    }
  }

  return true;
});
```

### A/B Testing

```javascript
registerMiddleware('ab-test', async (context) => {
  const userId = context.user?.id || 'anonymous';

  // Determine test variant for user
  const variant = getABTestVariant('new-feature', userId);

  if (variant === 'B' && context.to === '/dashboard') {
    context.navigate('/dashboard-v2');
    return false;
  }

  return true;
});
```

## Global Hooks

### beforeEnter in Routes

```javascript
export const routes = {
  '/checkout': {
    component: Checkout,
    beforeEnter: async (context) => {
      // Check cart before proceeding to payment
      const cart = getCartFromStorage();

      if (cart.items.length === 0) {
        alert('Cart is empty!');
        return false;
      }

      return true;
    }
  }
};
```

### afterEnter in Routes

```javascript
export const routes = {
  '/payment-success': {
    component: PaymentSuccess,
    afterEnter: async (context) => {
      // Clear cart after successful payment
      clearCart();

      // Send event to analytics
      analytics.track('purchase_completed', {
        orderId: context.params.orderId,
        amount: context.props.amount
      });

      return true;
    }
  }
};
```

## Error Handling

```javascript
// Global error handler
registerGlobalMiddleware('error', async (error, context) => {
  console.error('Router error:', error);

  // Send to monitoring system
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(error, {
      contexts: {
        router: {
          from: context.from,
          to: context.to,
          params: context.params
        }
      }
    });
  }

  // Redirect to error page
  context.navigate('/error');
  return false;
});
```

## Best Practices

1. **Naming** - Use descriptive middleware names
2. **Asynchronous** - All middleware can be asynchronous
3. **Context** - Pass data through context.props
4. **Errors** - Handle errors in middleware
5. **Performance** - Don't do heavy operations in middleware

## Related Functions

- [`registerMiddleware`](register-middleware.md) - Middleware registration
- [`registerGlobalMiddleware`](register-global-middleware.md) - Global middleware registration