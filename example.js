// Example usage of svelte-router-v5

// 1. Create routes.js in your project root:
/*
// routes.js
import Home from './pages/Home.svelte';
import User from './pages/User.svelte';
import NotFound from './pages/NotFound.svelte';

export const routes = {
  '/': Home,
  '/user/:id': User,
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

// Automatic navigation
navigate('/user/:id', {id: 456}, {tab: 'profile'});

// URL generation only
const url = linkTo('/user/:id', {id: 456}, {tab: 'profile'});
// Result: '/user/456?tab=profile'
*/
