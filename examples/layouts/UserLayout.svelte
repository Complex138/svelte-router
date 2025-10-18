<!-- UserLayout.svelte - Layout для пользовательской области -->
<script>
  export let component;
</script>

<div class="user-layout">
  <header class="user-header">
    <h1>User Dashboard</h1>
    <nav class="user-nav">
      <a href="/user">Dashboard</a>
      <a href="/user/profile">Profile</a>
      <a href="/user/settings">Settings</a>
    </nav>
  </header>
  
  <main class="user-content">
    <svelte:component this={component} />
  </main>
</div>

<style>
  .user-layout {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .user-header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    color: white;
  }
  
  .user-header h1 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }
  
  .user-nav {
    display: flex;
    gap: 1rem;
  }
  
  .user-nav a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .user-nav a:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .user-content {
    padding: 2rem;
  }
</style>
