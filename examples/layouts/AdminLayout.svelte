<!-- AdminLayout.svelte - Layout для админ панели -->
<script>
  export let component;
</script>

<div class="admin-layout">
  <aside class="admin-sidebar">
    <h2>Admin Panel</h2>
    <nav class="admin-nav">
      <a href="/admin">Dashboard</a>
      <a href="/admin/users">Users</a>
      <a href="/admin/settings">Settings</a>
    </nav>
  </aside>
  
  <main class="admin-content">
    <div class="admin-header">
      <h1>Administration</h1>
    </div>
    
    <div class="admin-body">
      <svelte:component this={component} />
    </div>
  </main>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f8f9fa;
  }
  
  .admin-sidebar {
    width: 250px;
    background: #343a40;
    color: white;
    padding: 1rem;
  }
  
  .admin-sidebar h2 {
    margin: 0 0 1rem 0;
    color: #fff;
  }
  
  .admin-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .admin-nav a {
    color: #adb5bd;
    text-decoration: none;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    transition: all 0.2s;
  }
  
  .admin-nav a:hover {
    background-color: #495057;
    color: #fff;
  }
  
  .admin-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .admin-header {
    background: white;
    padding: 1rem 2rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .admin-header h1 {
    margin: 0;
    color: #333;
  }
  
  .admin-body {
    flex: 1;
    padding: 2rem;
  }
</style>
