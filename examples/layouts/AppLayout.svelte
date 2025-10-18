<!-- AppLayout.svelte - Базовый layout для всего приложения -->
<script>
  export let component;
</script>

<div class="app-layout">
  <header class="app-header">
    <h1>My App</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/user">User</a>
    </nav>
  </header>
  
  <main class="app-main">
    <svelte:component this={component} />
  </main>
  
  <footer class="app-footer">
    <p>&copy; 2024 My App. All rights reserved.</p>
  </footer>
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .app-header {
    background: #f8f9fa;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .app-header h1 {
    margin: 0 0 1rem 0;
    color: #333;
  }
  
  .app-header nav {
    display: flex;
    gap: 1rem;
  }
  
  .app-header nav a {
    color: #007bff;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  .app-header nav a:hover {
    background-color: #e9ecef;
  }
  
  .app-main {
    flex: 1;
    padding: 2rem;
  }
  
  .app-footer {
    background: #f8f9fa;
    padding: 1rem;
    text-align: center;
    border-top: 1px solid #dee2e6;
    color: #6c757d;
  }
</style>
