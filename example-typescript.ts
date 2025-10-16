// Example usage of svelte-router-v5 with TypeScript

import { createNavigation, LinkTo, RouterView, navigate, getRoutParams, type Routes, type RouteParams } from 'svelte-router-v5';
import type { ComponentType } from 'svelte';

// Import components
import Home from './pages/Home.svelte';
import About from './pages/About.svelte';
import User from './pages/User.svelte';
import NotFound from './pages/NotFound.svelte';

// Typed routes
const routes: Routes = {
  '/': Home,
  '/about': About,
  '/user/:id': User,
  '/user/:id/delete/:postId': User,
  '*': NotFound,
};

// Create navigation with typing
const currentComponent = createNavigation(routes);

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
  }
};

// Export for usage
export { currentComponent, routes };
