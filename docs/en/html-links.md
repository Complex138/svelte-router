# HTML Links Support

## Description

Automatic processing of regular HTML links `<a href="...">` with click interception and routing through the router.

## Automatic Initialization

By default, HTML links are processed automatically when calling `createNavigation()`:

```javascript
import { createNavigation } from 'svelte-router-v5';

const router = createNavigation(routes);
// ✅ HTML links already work automatically!
```

## Usage

### Regular HTML Links

```html
<!-- ✅ These links will be processed by the router automatically -->
<a href="/">Home</a>
<a href="/about">About</a>
<a href="/user/123">User 123</a>
<a href="/post/456?tab=comments">Post with parameters</a>

<!-- ❌ These links will NOT be intercepted (external, anchors, JS) -->
<a href="https://google.com">External link</a>
<a href="mailto:test@example.com">Email</a>
<a href="tel:+1234567890">Phone</a>
<a href="#section">Anchor</a>
<a href="javascript:alert('test')">JavaScript</a>
<a target="_blank">New tab</a>
<a download>Download file</a>
```

### Configuration

```javascript
import { initHtmlLinks } from 'svelte-router-v5';

// Manual initialization with settings
const cleanup = initHtmlLinks({
  enabled: true,                    // Enable processing
  selector: 'a[href]',             // Link selector
  external: false,                 // Process external links
  exclude: [                       // Exclusions
    'a[href^="http"]',            // External links
    'a[href^="mailto:"]',         // Email
    'a[href^="tel:"]',            // Phone
    'a[target="_blank"]',         // New tab
    'a[download]',                // Download
    'a[href^="javascript:"]'      // JavaScript
  ]
});

// Disable processing
cleanup();
```

### Process Specific Link

```javascript
import { processLink } from 'svelte-router-v5';

// Process specific link
const link = document.querySelector('a[href="/user/123"]');
const processed = processLink(link);

if (processed) {
  console.log('Link processed by router');
} else {
  console.log('Link not processed (external or excluded)');
}
```

## Settings

### enabled
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Enable/disable HTML links processing

### selector
- **Type:** `string`
- **Default:** `'a[href]'`
- **Description:** CSS selector for links

### external
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Process external links (http/https)

### exclude
- **Type:** `Array<string>`
- **Default:** `['a[href^="http"]', 'a[href^="mailto:"]', 'a[href^="tel:"]', 'a[target="_blank"]']`
- **Description:** CSS selectors to exclude from processing

## Usage Examples

### Basic Usage

```html
<!-- App.svelte -->
<script>
  import { createNavigation } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const router = createNavigation(routes);
  // ✅ HTML links work automatically
</script>

<nav>
  <!-- ✅ Regular HTML links -->
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/user/123">User</a>
  
  <!-- ✅ With parameters -->
  <a href="/post/456?tab=comments">Post with comments</a>
  
  <!-- ❌ External links (not intercepted) -->
  <a href="https://google.com">Google</a>
  <a href="mailto:test@example.com">Email</a>
</nav>
```

### Custom Configuration

```javascript
import { initHtmlLinks } from 'svelte-router-v5';

// Configure processing for specific links
const cleanup = initHtmlLinks({
  selector: '.nav-link[href]',     // Only links with nav-link class
  external: true,                  // Process external links
  exclude: [
    'a[target="_blank"]',         // Exclude new tabs
    'a[download]'                 // Exclude downloads
  ]
});
```

### Exclude Specific Links

```html
<!-- Add data attribute to exclude -->
<a href="/external" data-router-ignore>External link</a>

<!-- Or use target="_blank" -->
<a href="/external" target="_blank">External link</a>
```

## Benefits

- ✅ **Automatic processing** - no need to change existing HTML
- ✅ **Smart exclusions** - external links, email, phone are not intercepted
- ✅ **Performance** - only internal links are processed
- ✅ **Flexibility** - configurable selectors and exclusions
- ✅ **Backward compatibility** - works with existing code

## Limitations

- ❌ **Internal links only** - external links are not processed
- ❌ **Existing routes only** - unknown routes are not intercepted
- ❌ **Click events only** - programmatic navigation is not intercepted
