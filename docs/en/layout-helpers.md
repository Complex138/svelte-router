# Layout Helper Functions

## Description

Set of functions for managing registered layouts in the router system.

## Functions

### getLayout(name)

Gets layout component by name.

**Parameters:**
- `name` (String) - Layout name

**Returns:** Component or null

```javascript
import { getLayout } from 'svelte-router-v5';

const appLayout = getLayout('app');
if (appLayout) {
  console.log('App layout found');
} else {
  console.log('App layout not found');
}
```

### hasLayout(name)

Checks if layout exists.

**Parameters:**
- `name` (String) - Layout name

**Returns:** Boolean

```javascript
import { hasLayout } from 'svelte-router-v5';

if (hasLayout('admin')) {
  console.log('Admin layout is registered');
} else {
  console.log('Admin layout is not registered');
}
```

### getAllLayouts()

Gets all registered layouts.

**Returns:** Map with all layouts

```javascript
import { getAllLayouts } from 'svelte-router-v5';

const layouts = getAllLayouts();
console.log('All layouts:', layouts);
// Map { 'app' => AppLayout, 'admin' => AdminLayout, 'user' => UserLayout }
```

### getLayoutNames()

Gets all registered layout names.

**Returns:** Array of layout names

```javascript
import { getLayoutNames } from 'svelte-router-v5';

const names = getLayoutNames();
console.log('Layout names:', names);
// ['app', 'admin', 'user']
```

### clearLayouts()

Clears all registered layouts.

```javascript
import { clearLayouts } from 'svelte-router-v5';

clearLayouts();
console.log('All layouts cleared');
```

### debugLayouts()

Prints debug information about registered layouts.

```javascript
import { debugLayouts } from 'svelte-router-v5';

debugLayouts();
// Output:
// 📋 Registered Layouts:
//   - app: AppLayout
//   - admin: AdminLayout
//   - user: UserLayout
```

## Usage Examples

### Layout Validation

```javascript
import { hasLayout, getLayout } from 'svelte-router-v5';

function validateLayout(layoutName) {
  if (!hasLayout(layoutName)) {
    throw new Error(`Layout '${layoutName}' is not registered`);
  }
  
  const layout = getLayout(layoutName);
  if (!layout) {
    throw new Error(`Layout '${layoutName}' is null`);
  }
  
  return layout;
}

// Usage
try {
  const layout = validateLayout('admin');
  console.log('Admin layout is valid:', layout);
} catch (error) {
  console.error('Layout validation error:', error.message);
}
```

### Layout Registration Check

```javascript
import { getLayoutNames, hasLayout } from 'svelte-router-v5';

function checkRequiredLayouts() {
  const requiredLayouts = ['app', 'admin', 'user'];
  const registeredLayouts = getLayoutNames();
  
  const missing = requiredLayouts.filter(layout => !hasLayout(layout));
  
  if (missing.length > 0) {
    console.warn('Missing required layouts:', missing);
    return false;
  }
  
  console.log('All required layouts are registered');
  return true;
}

// Usage
if (checkRequiredLayouts()) {
  console.log('Layout system is ready');
} else {
  console.error('Layout system is not ready');
}
```

### Layout Information

```javascript
import { getAllLayouts, getLayoutNames } from 'svelte-router-v5';

function getLayoutInfo() {
  const layouts = getAllLayouts();
  const names = getLayoutNames();
  
  return {
    count: layouts.size,
    names: names,
    layouts: Array.from(layouts.entries()).map(([name, component]) => ({
      name,
      component: component.name || 'Anonymous'
    }))
  };
}

// Usage
const info = getLayoutInfo();
console.log('Layout info:', info);
```

### Layout Cleanup

```javascript
import { clearLayouts, getLayoutNames } from 'svelte-router-v5';

function cleanupLayouts() {
  const beforeCount = getLayoutNames().length;
  console.log(`Clearing ${beforeCount} layouts`);
  
  clearLayouts();
  
  const afterCount = getLayoutNames().length;
  console.log(`Cleared ${beforeCount - afterCount} layouts`);
}

// Usage
cleanupLayouts();
```

### Layout Debugging

```javascript
import { debugLayouts, getLayoutNames, getAllLayouts } from 'svelte-router-v5';

function debugLayoutSystem() {
  console.log('=== Layout System Debug ===');
  
  const names = getLayoutNames();
  console.log(`Registered layouts: ${names.length}`);
  
  if (names.length > 0) {
    console.log('Layout names:', names);
    debugLayouts();
  } else {
    console.log('No layouts registered');
  }
  
  console.log('=== End Debug ===');
}

// Usage
debugLayoutSystem();
```

### Layout Conditional Registration

```javascript
import { registerLayout, hasLayout } from 'svelte-router-v5';

function registerLayoutIfNeeded(name, component) {
  if (!hasLayout(name)) {
    registerLayout(name, component);
    console.log(`Layout '${name}' registered`);
  } else {
    console.log(`Layout '${name}' already registered`);
  }
}

// Usage
registerLayoutIfNeeded('app', AppLayout);
registerLayoutIfNeeded('admin', AdminLayout);
```

### Layout System Status

```javascript
import { getLayoutNames, getAllLayouts, hasLayout } from 'svelte-router-v5';

function getLayoutSystemStatus() {
  const names = getLayoutNames();
  const layouts = getAllLayouts();
  
  return {
    isReady: names.length > 0,
    count: names.length,
    names: names,
    hasApp: hasLayout('app'),
    hasAdmin: hasLayout('admin'),
    hasUser: hasLayout('user'),
    allLayouts: Array.from(layouts.entries())
  };
}

// Usage
const status = getLayoutSystemStatus();
console.log('Layout system status:', status);
```

### Layout Error Handling

```javascript
import { getLayout, hasLayout } from 'svelte-router-v5';

function safeGetLayout(name) {
  try {
    if (!hasLayout(name)) {
      console.warn(`Layout '${name}' not found`);
      return null;
    }
    
    const layout = getLayout(name);
    if (!layout) {
      console.error(`Layout '${name}' is null`);
      return null;
    }
    
    return layout;
  } catch (error) {
    console.error(`Error getting layout '${name}':`, error);
    return null;
  }
}

// Usage
const layout = safeGetLayout('admin');
if (layout) {
  console.log('Admin layout loaded successfully');
} else {
  console.log('Failed to load admin layout');
}
```

## Best Practices

1. **Check before use** - Always check if layout exists before using
2. **Handle errors** - Handle layout errors gracefully
3. **Debug when needed** - Use debug functions for troubleshooting
4. **Validate layouts** - Validate layout components before registration
5. **Clean up** - Clear layouts when no longer needed

## Related Functions

- [`registerLayout`](register-layout.md) - Layout registration
- [`layouts`](layouts.md) - Layout system overview
- [`RouterView`](router-view.md) - Layout rendering