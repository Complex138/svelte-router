// Пример использования svelte-router

// 1. Создайте routes.js в корне вашего проекта:
/*
// routes.js
import Home from './pages/Home.svelte';
import User from './pages/User.svelte';

export const routes = {
  '/': Home,
  '/user/:id': User,
  '*': NotFound
};
*/

// 2. Используйте в главном компоненте:
/*
// App.svelte
<script>
  import { createNavigation, LinkTo } from 'svelte-router';
  
  const currentComponent = createNavigation();
</script>

<main>
  <nav>
    <LinkTo route="/" className="nav-link">Главная</LinkTo>
    <LinkTo route="/user/:id" params={{id: 123}} className="nav-link">Пользователь 123</LinkTo>
  </nav>
  
  <svelte:component this={$currentComponent.component} {...$currentComponent.props} />
</main>
*/

// 3. Получайте параметры в компонентах:
/*
// User.svelte
<script>
  import { getRoutParams } from 'svelte-router';
  
  $: ({ id: userId, userData } = $getRoutParams);
</script>

<h1>Пользователь: {userId}</h1>
*/

// 4. Программная навигация:
/*
import { linkTo } from 'svelte-router';

const url = linkTo('/user/:id', {id: 456}, {tab: 'profile'});
// Результат: '/user/456?tab=profile'
*/
