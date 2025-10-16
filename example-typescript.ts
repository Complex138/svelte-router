// Example usage of svelte-router-v5 with TypeScript

import { createNavigation, LinkTo, RouterView, navigate, linkTo, getRoutParams, type Routes, type RouteParams, type NavigateFunctionV2, type LinkToFunction } from 'svelte-router-v5';
import type { ComponentType } from 'svelte';

// Import components
import Home from './pages/Home.svelte';
import About from './pages/About.svelte';
import User from './pages/User.svelte';
import Post from './pages/Post.svelte';
import Api from './pages/Api.svelte';
import NotFound from './pages/NotFound.svelte';

// Typed routes
const routes: Routes = {
  '/': Home,
  '/about': About,
  
  // Basic routes
  '/user/:id': User,
  '/user/:id/delete/:postId': User,
  
  // Routes with regular expressions for validation
  '/user/id/:id(\\d+)': User,                    // Only numbers: /user/id/123 ✅, /user/id/abc ❌
  '/user/name/:userName([a-zA-Z]+)': User,       // Only letters: /user/name/john ✅, /user/name/123 ❌
  '/user/slug/:slug([a-zA-Z0-9-]+)': User,       // Letters, numbers, dashes: /user/slug/john-doe ✅
  '/post/:id(\\d+)/:action(edit|delete)': Post,  // Specific values: /post/123/edit ✅
  '/api/:version(v\\d+)/:endpoint(users|posts|comments)': Api, // API versions: /api/v1/users ✅
  
  '*': NotFound,
};

// Create navigation with typing
const currentComponent = createNavigation(routes);

// Typed navigation functions
const navigateTyped: NavigateFunctionV2 = navigate;
const linkToTyped: LinkToFunction = linkTo;

// Example usage in component
export function MyComponent() {
  // Typed parameters
  const { id: userId, tab, theme }: RouteParams & { tab?: string; theme?: string } = $getRoutParams;
  
  return {
    userId,
    tab,
    theme
  };
}

// Example LinkTo usage with typing
export const navigationLinks = [
  {
    route: '/',
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/about',
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/user/:id',
    params: { id: '123' } as RouteParams,
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/user/:id',
    params: { id: '456' } as RouteParams,
    queryParams: { tab: 'profile', theme: 'dark' },
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/user/id/:id(\\d+)',
    params: { id: '789' } as RouteParams,
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/user/id/:id',
    params: { id: '789' } as RouteParams,
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/user/name/:userName([a-zA-Z]+)',
    params: { userName: 'alice' } as RouteParams,
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/user/name/:userName',
    params: { userName: 'alice' } as RouteParams,
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/post/:id(\\d+)/:action(edit|delete)',
    params: { id: '123', action: 'edit' } as RouteParams,
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/post/:id/:action',
    params: { id: '123', action: 'edit' } as RouteParams,
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  }
];

// Programmatic navigation examples
export const navigationFunctions = {
  // Method 1: Old format
  goToUser: (userId: string) => {
    navigate('/user/:id', { id: userId });
  },
  
  goToUserProfile: (userId: string, tab: string = 'profile') => {
    navigate('/user/:id', { id: userId }, { tab });
  },
  
  goToUserWithData: (userId: string) => {
    navigate('/user/:id', { id: userId }, {}, {
      userData: { name: 'John Doe', email: 'john@example.com' },
      onSave: (data: any) => console.log('Saving:', data)
    });
  },
  
  // Method 2: New format with keys
  goToUserWithKeys: (userId: string, userData: any) => {
    navigate('/user/:id', {
      params: { id: userId },
      queryParams: { tab: 'profile' },
      props: { userData }
    });
  },
  
  // Method 3: Automatic detection
  goToUserAuto: (userId: string, userData: any) => {
    navigate('/user/:id', {
      id: userId,        // Goes to params
      userData,          // Goes to props
      settings: { theme: 'dark' } // Goes to props
    });
  },
  
  // Regular expression routes with all methods (with or without regex in navigate - same result!)
  goToUserByIdRegex: (userId: string) => {
    navigate('/user/id/:id(\\d+)', { id: userId }); // Method 1 - with regex
    navigate('/user/id/:id', { id: userId }); // Method 1 - without regex (same result!)
  },
  
  goToUserByNameRegex: (userName: string, userData: any) => {
    navigate('/user/name/:userName([a-zA-Z]+)', {
      params: { userName },
      props: { userData }
    }); // Method 2 - with regex
    navigate('/user/name/:userName', {
      params: { userName },
      props: { userData }
    }); // Method 2 - without regex (same result!)
  },
  
  goToPostActionRegex: (postId: string, action: 'edit' | 'delete', postData: any) => {
    navigate('/post/:id(\\d+)/:action(edit|delete)', {
      id: postId,        // Goes to params
      action,            // Goes to params
      postData           // Goes to props
    }); // Method 3 - with regex
    navigate('/post/:id/:action', {
      id: postId,        // Goes to params
      action,            // Goes to params
      postData           // Goes to props
    }); // Method 3 - without regex (same result!)
  },
  
  // Additional regular expression routes (with or without regex in navigate - same result!)
  goToApiEndpoint: (version: string, endpoint: string) => {
    navigate('/api/:version(v\\d+)/:endpoint(users|posts|comments)', { version, endpoint }); // With regex
    navigate('/api/:version/:endpoint', { version, endpoint }); // Without regex (same result!)
  },
  
  // Typed navigation examples
  goToUserTyped: (userId: string) => {
    navigateTyped('/user/:id', {id: userId}); // Method 1
    navigateTyped('/user/:id', {params: {id: userId}, queryParams: {tab: 'profile'}}); // Method 2
    navigateTyped('/user/:id', {id: userId, userData: {name: 'John'}}); // Method 3
  },
  
  // Typed linkTo examples
  generateUserUrl: (userId: string) => {
    return linkToTyped('/user/:id', {id: userId}); // With regex
    return linkToTyped('/user/:id', {id: userId}); // Without regex (same result!)
  }
};

// Export for usage
export { currentComponent, routes };
