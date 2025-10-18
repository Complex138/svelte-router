<script>
  import { getContext, onMount } from 'svelte';
  import { linkTo } from './Router.js';
  import { prefetchRoute, prefetchRelated } from './core/prefetch.js';
import { observeForPrefetch } from './core/shared-observer.js';

  export let route;
  export let params = {};
  export let queryParams = {};
  export let props = {}; // Объекты для передачи в компонент
  export let className = '';

  // Prefetch опции
  export let prefetch = 'hover'; // 'hover' | 'visible' | 'mount' | 'none' | 'smart'
  export let prefetchDelay = 50; // Задержка для hover prefetch (ms)

  // Получаем функцию navigate и smartPrefetch из контекста
  const navigate = getContext('navigate');
  const smartPrefetch = getContext('smartPrefetch');

  // Создаем URL с параметрами (без объектов)
  const href = linkTo(route, params, queryParams);

  let prefetchTimeout = null;
  let linkElement = null;
  let observer = null;
  let abortController = null;

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
      // Создаем новый AbortController для отмены
      abortController = new AbortController();
      
      prefetchTimeout = setTimeout(() => {
        prefetchRoute(route, { signal: abortController.signal }).catch(err => {
          if (err.name !== 'AbortError') {
            console.warn('Prefetch failed:', err);
          }
        });
        prefetchTimeout = null;
      }, prefetchDelay);
    } else if (prefetch === 'smart' && smartPrefetch && !prefetchTimeout) {
      // Создаем новый AbortController для отмены
      abortController = new AbortController();
      
      prefetchTimeout = setTimeout(async () => {
        try {
          // Prefetch текущий роут
          await prefetchRoute(route, { signal: abortController.signal });
          
          // Prefetch предсказанные связанные роуты
          const predicted = smartPrefetch.predictNext(route);
          if (predicted.length > 0) {
            await prefetchRelated(predicted.slice(0, 2), { parallel: true, signal: abortController.signal });
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('Smart prefetch failed:', err);
          }
        }
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
    } else if (prefetch === 'smart' && smartPrefetch) {
      // Умный prefetch при монтировании
      (async () => {
        try {
          await prefetchRoute(route);
          const predicted = smartPrefetch.predictNext(route);
          if (predicted.length > 0) {
            await prefetchRelated(predicted.slice(0, 2), { parallel: true });
          }
        } catch (err) {
          console.warn('Smart prefetch on mount failed:', err);
        }
      })();
    }

    // Prefetch при появлении в viewport (используем shared observer)
    if (prefetch === 'visible' && linkElement && 'IntersectionObserver' in window) {
      const cleanup = observeForPrefetch(linkElement, route, () => {
        if (prefetch === 'smart' && smartPrefetch) {
          // Умный prefetch при видимости
          (async () => {
            try {
              await prefetchRoute(route);
              const predicted = smartPrefetch.predictNext(route);
              if (predicted.length > 0) {
                await prefetchRelated(predicted.slice(0, 2), { parallel: true });
              }
            } catch (err) {
              console.warn('Smart prefetch on visible failed:', err);
            }
          })();
        } else {
          prefetchRoute(route).catch(err => console.warn('Prefetch on visible failed:', err));
        }
      });
      
      // Сохраняем cleanup функцию
      if (typeof cleanup === 'function') {
        observer = { disconnect: cleanup };
      }
    }

    return () => {
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
      if (observer) {
        observer.disconnect();
      }
      if (abortController) {
        abortController.abort();
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
