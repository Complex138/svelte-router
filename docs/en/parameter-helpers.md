# Parameter Helper Functions

## Description

Set of functions for getting route parameters, query parameters, and all parameters together. Useful for working outside reactive context.

## Functions

### getRouteParams(path)

Gets route parameters for specified path.

**Parameters:**
- `path` (String) - Path to analyze

**Returns:** Object with route parameters

```javascript
import { getRouteParams } from 'svelte-router-v5';

// Parameters for current path
const params = getRouteParams('/user/123');
// {id: '123'}

// Parameters for specific path
const params = getRouteParams('/user/456');
// {id: '456'}
```

### getQueryParams()

Gets current query parameters.

**Returns:** Object with query parameters

```javascript
import { getQueryParams } from 'svelte-router-v5';

// Current query parameters
const query = getQueryParams();
// {tab: 'profile', sort: 'date'}

// Example URL: /user/123?tab=profile&sort=date
```

### getAllParams()

Gets all parameters (route + query).

**Returns:** Object with all parameters

```javascript
import { getAllParams } from 'svelte-router-v5';

// All parameters
const allParams = getAllParams();
// {id: '123', tab: 'profile', sort: 'date'}

// Example URL: /user/123?tab=profile&sort=date
```

## Usage Examples

### Basic Parameter Access

```javascript
import { getRouteParams, getQueryParams, getAllParams } from 'svelte-router-v5';

// Get route parameters
const routeParams = getRouteParams();
console.log('Route params:', routeParams);
// {id: '123', slug: 'my-post'}

// Get query parameters
const queryParams = getQueryParams();
console.log('Query params:', queryParams);
// {tab: 'content', sort: 'date'}

// Get all parameters
const allParams = getAllParams();
console.log('All params:', allParams);
// {id: '123', slug: 'my-post', tab: 'content', sort: 'date'}
```

### Parameter Validation

```javascript
import { getRouteParams } from 'svelte-router-v5';

function validateUserId() {
  const params = getRouteParams();
  const { id } = params;
  
  if (!id) {
    throw new Error('User ID is required');
  }
  
  if (!/^\d+$/.test(id)) {
    throw new Error('User ID must be a number');
  }
  
  return parseInt(id);
}

// Usage
try {
  const userId = validateUserId();
  console.log('Valid user ID:', userId);
} catch (error) {
  console.error('Validation error:', error.message);
}
```

### Parameter Transformation

```javascript
import { getRouteParams, getQueryParams } from 'svelte-router-v5';

function transformParameters() {
  const routeParams = getRouteParams();
  const queryParams = getQueryParams();
  
  // Transform route parameters
  const transformedRoute = {
    id: routeParams.id ? parseInt(routeParams.id) : null,
    slug: routeParams.slug?.toLowerCase(),
    category: routeParams.category?.replace(/-/g, ' ')
  };
  
  // Transform query parameters
  const transformedQuery = {
    page: queryParams.page ? parseInt(queryParams.page) : 1,
    limit: queryParams.limit ? parseInt(queryParams.limit) : 10,
    sort: queryParams.sort || 'date',
    order: queryParams.order || 'desc'
  };
  
  return {
    route: transformedRoute,
    query: transformedQuery
  };
}

// Usage
const params = transformParameters();
console.log('Transformed params:', params);
```

### Parameter Persistence

```javascript
import { getAllParams } from 'svelte-router-v5';

// Save parameters to localStorage
function saveParameters() {
  const params = getAllParams();
  localStorage.setItem('lastRouteParams', JSON.stringify(params));
}

// Load parameters from localStorage
function loadParameters() {
  const saved = localStorage.getItem('lastRouteParams');
  if (saved) {
    return JSON.parse(saved);
  }
  return {};
}

// Usage
saveParameters();
const savedParams = loadParameters();
console.log('Saved params:', savedParams);
```

### Parameter Comparison

```javascript
import { getAllParams } from 'svelte-router-v5';

let previousParams = {};

function hasParametersChanged() {
  const currentParams = getAllParams();
  
  // Compare with previous parameters
  const changed = JSON.stringify(currentParams) !== JSON.stringify(previousParams);
  
  if (changed) {
    console.log('Parameters changed:', {
      from: previousParams,
      to: currentParams
    });
    
    previousParams = { ...currentParams };
  }
  
  return changed;
}

// Usage
if (hasParametersChanged()) {
  console.log('Parameters have changed, updating component...');
}
```

### Parameter Filtering

```javascript
import { getRouteParams, getQueryParams } from 'svelte-router-v5';

function getFilteredParameters() {
  const routeParams = getRouteParams();
  const queryParams = getQueryParams();
  
  // Filter out empty values
  const filteredRoute = Object.fromEntries(
    Object.entries(routeParams).filter(([key, value]) => value !== null && value !== undefined && value !== '')
  );
  
  // Filter out default values
  const filteredQuery = Object.fromEntries(
    Object.entries(queryParams).filter(([key, value]) => {
      const defaults = {
        page: '1',
        sort: 'date',
        order: 'desc'
      };
      return value !== defaults[key];
    })
  );
  
  return {
    route: filteredRoute,
    query: filteredQuery
  };
}

// Usage
const filtered = getFilteredParameters();
console.log('Filtered params:', filtered);
```

### Parameter Serialization

```javascript
import { getAllParams } from 'svelte-router-v5';

function serializeParameters() {
  const params = getAllParams();
  
  // Convert to URL search params
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
}

// Usage
const serialized = serializeParameters();
console.log('Serialized params:', serialized);
// "id=123&tab=profile&sort=date"
```

### Parameter Merging

```javascript
import { getRouteParams, getQueryParams } from 'svelte-router-v5';

function mergeParameters(additionalParams = {}) {
  const routeParams = getRouteParams();
  const queryParams = getQueryParams();
  
  // Merge all parameters
  const merged = {
    ...routeParams,
    ...queryParams,
    ...additionalParams
  };
  
  return merged;
}

// Usage
const merged = mergeParameters({ userData: { name: 'John' } });
console.log('Merged params:', merged);
```

## Best Practices

1. **Use appropriate function** - Choose the right function for your needs
2. **Handle missing parameters** - Always check for parameter existence
3. **Validate parameters** - Validate parameter values before use
4. **Transform when needed** - Convert string parameters to appropriate types
5. **Cache results** - Cache parameter values if used multiple times

## Related Functions

- [`getRoutParams`](get-route-params.md) - Reactive parameter access
- [`route-parameters`](route-parameters.md) - Route parameters overview
- [`navigate`](navigate.md) - Programmatic navigation