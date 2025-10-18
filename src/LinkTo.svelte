<script>
  import { getContext, onMount } from 'svelte';
  import { linkTo } from './Router.js';
  import { prefetchRoute, prefetchRelated } from './core/prefetch.js';

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
    } else if (prefetch === 'smart' && smartPrefetch && !prefetchTimeout) {
      prefetchTimeout = setTimeout(async () => {
        try {
          // Prefetch текущий роут
          await prefetchRoute(route);
          
          // Prefetch предсказанные связанные роуты
          const predicted = smartPrefetch.predictNext(route);
          if (predicted.length > 0) {
            await prefetchRelated(predicted.slice(0, 2), { parallel: true });
          }
        } catch (err) {
          console.warn('Smart prefetch failed:', err);
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

    // Prefetch при появлении в viewport
    if (prefetch === 'visible' && linkElement && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
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
