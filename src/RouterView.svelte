<script>
  // RouterView component for rendering current route
  export let currentComponent;
</script>

{#if currentComponent?.component}
  <svelte:component this={currentComponent.component} {...currentComponent.props} />
{/if}
