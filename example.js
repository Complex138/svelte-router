// Example usage of svelte-router-v5

// 1. Create routes.js in your project root:
/*
// routes.js
import Home from './pages/Home.svelte';
import User from './pages/User.svelte';
import Post from './pages/Post.svelte';
import Api from './pages/Api.svelte';
import NotFound from './pages/NotFound.svelte';

export const routes = {
  '/': Home,
  
  // Basic routes
  '/user/:id': User,
  
  // Routes with regular expressions for validation
  '/user/id/:id(\\d+)': User,                    // Only numbers: /user/id/123 ✅, /user/id/abc ❌
  '/user/name/:userName([a-zA-Z]+)': User,       // Only letters: /user/name/john ✅, /user/name/123 ❌
  '/user/slug/:slug([a-zA-Z0-9-]+)': User,       // Letters, numbers, dashes: /user/slug/john-doe ✅
  '/post/:id(\\d+)/:action(edit|delete)': Post,  // Specific values: /post/123/edit ✅
  '/api/:version(v\\d+)/:endpoint(users|posts|comments)': Api, // API versions: /api/v1/users ✅
  
  '*': NotFound
};
*/

// 2. Use in your main component:
/*
// App.svelte
<script>
  import { createNavigation, LinkTo, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<main>
         <nav>
           <LinkTo route="/" className="nav-link">Home</LinkTo>
           <LinkTo route="/user/:id" params={{id: 123}} className="nav-link">User 123</LinkTo>
           <LinkTo route="/user/id/:id(\\d+)" params={{id: 456}} className="nav-link">User ID 456</LinkTo>
           <LinkTo route="/user/name/:userName([a-zA-Z]+)" params={{userName: "john"}} className="nav-link">User John</LinkTo>
           <LinkTo route="/post/:id(\\d+)/:action(edit|delete)" params={{id: 789, action: "edit"}} className="nav-link">Edit Post 789</LinkTo>
         </nav>
  
  <RouterView currentComponent={$currentComponent} />
</main>
*/

// 3. Get parameters in components:
/*
// User.svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';
  
  $: ({ id: userId, userData } = $getRoutParams);
</script>

<h1>User: {userId}</h1>
*/

// 4. Programmatic navigation:
/*
import { navigate, linkTo } from 'svelte-router-v5';

// Method 1: Old format
navigate('/user/:id', {id: 456}, {tab: 'profile'});

// Method 2: New format with keys
navigate('/user/:id', {
  params: {id: 456},
  queryParams: {tab: 'profile'},
  props: {userData: {name: 'John'}}
});

// Method 3: Automatic detection
navigate('/user/:id', {
  id: 456,                    // Goes to params
  userData: {name: 'John'}   // Goes to props
});

// All methods work with regular expressions
navigate('/user/id/:id(\\d+)', {id: 123}); // Method 1
navigate('/user/name/:userName([a-zA-Z]+)', {
  params: {userName: 'john'},
  props: {userData: {name: 'John'}}
}); // Method 2
navigate('/post/:id(\\d+)/:action(edit|delete)', {
  id: 789,                    // Goes to params
  action: 'edit',             // Goes to params
  postData: {title: 'Test'}   // Goes to props
}); // Method 3

// URL generation only
const url = linkTo('/user/:id', {id: 456}, {tab: 'profile'});
// Result: '/user/456?tab=profile'

// Regular expression routes
navigate('/user/id/:id(\\d+)', {id: 123}); // Only numbers
navigate('/user/name/:userName([a-zA-Z]+)', {userName: 'john'}); // Only letters
navigate('/post/:id(\\d+)/:action(edit|delete)', {id: 789, action: 'edit'}); // Specific values
navigate('/api/:version(v\\d+)/:endpoint(users|posts|comments)', {version: 'v1', endpoint: 'users'}); // API routes
*/
