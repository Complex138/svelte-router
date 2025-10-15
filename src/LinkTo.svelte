<script>
  import { getContext } from 'svelte';
  import { linkTo } from '../router/Router.js';
  
  export let route;
  export let params = {};
  export let queryParams = {};
  export let props = {}; // Объекты для передачи в компонент
  export let className = '';
  
  // Получаем функцию navigate из контекста
  const navigate = getContext('navigate');
  
  // Создаем URL с параметрами (без объектов)
  const href = linkTo(route, params, queryParams);
  
  function handleClick(event) {
    event.preventDefault();
    
    // Если есть объекты, передаем их через navigate
    if (Object.keys(props).length > 0) {
      navigate(href, props);
    } else {
      navigate(href);
    }
  }
</script>

<a {href} class={className} on:click={handleClick}>
  <slot />
</a>
