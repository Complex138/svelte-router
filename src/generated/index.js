// Автоматически сгенерированные роуты для Svelte
import { createNavigation } from 'svelte-router-v5';

// Статические импорты всех компонентов
import About_svelte from '/resources/js/pages/About.svelte';
import AlbumDetail_svelte from '/resources/js/pages/AlbumDetail.svelte';
import Albums_svelte from '/resources/js/pages/Albums.svelte';
import CacheDemo_svelte from '/resources/js/pages/CacheDemo.svelte';
import demo_svelte from '/resources/js/pages/demo.svelte';
import HashRoutingDemo_svelte from '/resources/js/pages/HashRoutingDemo.svelte';
import Home_svelte from '/resources/js/pages/Home.svelte';
import index_svelte from '/resources/js/pages/index.svelte';
import NotFound_svelte from '/resources/js/pages/NotFound.svelte';
import PostDetail_svelte from '/resources/js/pages/PostDetail.svelte';
import Posts_svelte from '/resources/js/pages/Posts.svelte';
import RouteValidationDemo_svelte from '/resources/js/pages/RouteValidationDemo.svelte';
import UserAlbums_svelte from '/resources/js/pages/UserAlbums.svelte';
import UserDetail_svelte from '/resources/js/pages/UserDetail.svelte';
import UserPosts_svelte from '/resources/js/pages/UserPosts.svelte';
import Users_svelte from '/resources/js/pages/Users.svelte';

// Создаем роуты
const routes = {
  'About': () => import('/resources/js/pages/About.svelte'),
  'AlbumDetail': () => import('/resources/js/pages/AlbumDetail.svelte'),
  'Albums': () => import('/resources/js/pages/Albums.svelte'),
  'CacheDemo': () => import('/resources/js/pages/CacheDemo.svelte'),
  'demo': () => import('/resources/js/pages/demo.svelte'),
  'HashRoutingDemo': () => import('/resources/js/pages/HashRoutingDemo.svelte'),
  'Home': () => import('/resources/js/pages/Home.svelte'),
  'index': () => import('/resources/js/pages/index.svelte'),
  'NotFound': () => import('/resources/js/pages/NotFound.svelte'),
  'PostDetail': () => import('/resources/js/pages/PostDetail.svelte'),
  'Posts': () => import('/resources/js/pages/Posts.svelte'),
  'RouteValidationDemo': () => import('/resources/js/pages/RouteValidationDemo.svelte'),
  'UserAlbums': () => import('/resources/js/pages/UserAlbums.svelte'),
  'UserDetail': () => import('/resources/js/pages/UserDetail.svelte'),
  'UserPosts': () => import('/resources/js/pages/UserPosts.svelte'),
  'Users': () => import('/resources/js/pages/Users.svelte')
};

// Создаем layouts
const layouts = {

};

// Создаем middleware
const middleware = {

};

// Экспортируем навигацию
export const navigation = createNavigation(routes);

export { routes, layouts, middleware };
