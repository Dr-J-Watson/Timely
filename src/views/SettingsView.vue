<template>
    <div class="settings-container">
      <div class="settings-layout">
        <aside class="settings-sidebar">
          <nav class="settings-nav">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.to"
              class="nav-link"
              :class="{ 'nav-link-active': route.name === item.name }"
            >
              {{ item.title }}
            </router-link>
          </nav>
        </aside>
  
        <main class="settings-content">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  
  const navigationItems = [
    {
      name: 'ProfileSettings',
      to: { name: 'ProfileSettings' },
      title: 'Mon profil'
    },
    {
      name: 'ProjectsSettings',
      to: { name: 'ProjectsSettings' },
      title: 'Mes projets'
    },
    {
      name: 'ActivitiesSettings',
      to: { name: 'ActivitiesSettings' },
      title: 'Mes activités'
    }
  ]
  </script>
  
  <style scoped>
  .settings-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .settings-layout {
    display: flex;
    gap: 2rem;
    min-height: calc(100vh - 180px);
  }
  
  .settings-sidebar {
    width: 200px;
    flex-shrink: 0;
  }
  
  .settings-content {
    flex: 1;
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .settings-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .nav-link {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    color: var(--gray-700);
    text-decoration: none;
    transition: all 0.2s;
  }
  
  .nav-link:hover {
    background-color: var(--gray-100);
  }
  
  .nav-link-active {
    background-color: var(--primary-color);
    color: white;
  }
  
  .nav-link-active:hover {
    background-color: var(--primary-color);
  }
  </style>