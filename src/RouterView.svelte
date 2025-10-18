<script>
  // RouterView component for rendering current route with lazy loading support
  import { getLayout } from './core/layout-registry.js';
  import { navigate, getRouter } from './Navigation.js';
  import { createSmartPrefetch } from './core/prefetch.js';
  import { autoInitHtmlLinks } from './core/html-links.js';
  import { setContext, onMount } from 'svelte';
  
  export let currentComponent;
  export let loadingComponent = null; // Optional custom loading component
  export let errorComponent = null; // Optional custom error component
  
  // Передаем navigate и smartPrefetch через контекст
  setContext('navigate', navigate);
  setContext('smartPrefetch', createSmartPrefetch());

  // Инициализируем обработку HTML ссылок в компоненте
  onMount(() => {
    autoInitHtmlLinks();
  });
  
  // Определяем layout компонент
  $: layoutComponent = currentComponent?.layout 
    ? (getLayout(currentComponent.layout) || null)
    : null;
    
</script>

{#if currentComponent?.loading}
  {#if loadingComponent}
    <svelte:component this={loadingComponent} />
  {:else}
    <div class="router-loading">
      <p>Loading...</p>
    </div>
  {/if}
{:else if currentComponent?.error}
  {#if errorComponent}
    <svelte:component this={errorComponent} error={currentComponent.error} />
  {:else}
    <div class="router-error">
      <p>Error: {currentComponent.error}</p>
    </div>
  {/if}
{:else if currentComponent?.component}
  {#if layoutComponent}
    <svelte:component this={layoutComponent} component={currentComponent.component} {...currentComponent.props} />
  {:else}
    <svelte:component this={currentComponent.component} {...currentComponent.props} />
  {/if}
{/if}

<style>
  .router-loading,
  .router-error {
    padding: 2rem;
    text-align: center;
  }

  .router-error {
    color: #d32f2f;
  }
</style>
