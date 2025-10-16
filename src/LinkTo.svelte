<script>
  import { getContext, onMount } from 'svelte';
  import { linkTo } from './Router.js';
  import { prefetchRoute } from './core/prefetch.js';

  export let route;
  export let params = {};
  export let queryParams = {};
  export let props = {}; // Объекты для передачи в компонент
  export let className = '';

  // Prefetch опции
  export let prefetch = 'hover'; // 'hover' | 'visible' | 'mount' | 'none'
  export let prefetchDelay = 50; // Задержка для hover prefetch (ms)

  // Получаем функцию navigate из контекста
  const navigate = getContext('navigate');

  // Создаем URL с параметрами (без объектов)
  const href = linkTo(route, params, queryParams);

  let prefetchTimeout = null;
  let linkElement = null;
  let observer = null;

  function handleClick(event) {
    event.preventDefault();

    // Отменяем отложенный prefetch если есть
    if (prefetchTimeout) {
      clearTimeout(prefetchTimeout);
      prefetchTimeout = null;
    }

    // Если есть объекты, передаем их через navigate
    if (Object.keys(props).length > 0) {
      navigate(href, props);
    } else {
      navigate(href);
    }
  }

  function handleMouseEnter() {
    if (prefetch === 'hover' && !prefetchTimeout) {
      prefetchTimeout = setTimeout(() => {
        prefetchRoute(route).catch(err => console.warn('Prefetch failed:', err));
        prefetchTimeout = null;
      }, prefetchDelay);
    }
  }

  function handleMouseLeave() {
    if (prefetchTimeout) {
      clearTimeout(prefetchTimeout);
      prefetchTimeout = null;
    }
  }

  onMount(() => {
    // Prefetch при монтировании компонента
    if (prefetch === 'mount') {
      prefetchRoute(route).catch(err => console.warn('Prefetch on mount failed:', err));
    }

    // Prefetch при появлении в viewport
    if (prefetch === 'visible' && linkElement && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              prefetchRoute(route).catch(err => console.warn('Prefetch on visible failed:', err));
              // Отключаем наблюдатель после первого prefetch
              if (observer) {
                observer.disconnect();
                observer = null;
              }
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.01
        }
      );

      observer.observe(linkElement);
    }

    return () => {
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  });
</script>

<a
  bind:this={linkElement}
  {href}
  class={className}
  on:click={handleClick}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <slot />
</a>
