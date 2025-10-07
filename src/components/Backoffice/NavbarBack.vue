<!-- NavbarBack.vue -->
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goToMenu = () => router.push('/admin/menu')
const goToTable = () => router.push('/admin/table')
const goToHistorique = () => router.push('/admin/historiqueVentes')
const goToDeconnexion = () => router.push('/admin/Login')
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo" @click="goToMenu">
      <img src="@/assets/png 1.png" alt="Logo" class="logo-img" />
      <!-- <span class="logo-text">Admin</span> -->
    </div>

    <!-- Menu -->
    <ul class="sidebar-menu">
      <!-- Menu / Carte Menu -->
      <li @click="goToMenu">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" stroke-width="2" fill="none"/>
          <line x1="7" y1="7" x2="17" y2="7" stroke="white" stroke-width="2"/>
          <line x1="7" y1="11" x2="17" y2="11" stroke="white" stroke-width="2"/>
          <line x1="7" y1="15" x2="17" y2="15" stroke="white" stroke-width="2"/>
        </svg>
        <span class="menu-text">Menu</span>
      </li>

      <!-- Table / Vraie Table -->
      <li @click="goToTable">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 64 64">
          <!-- Plateau -->
          <rect x="12" y="12" width="40" height="20" rx="2" ry="2" fill="white"/>
          <!-- Pieds -->
          <rect x="12" y="34" width="4" height="10" fill="white"/>
          <rect x="48" y="34" width="4" height="10" fill="white"/>
          <rect x="24" y="34" width="4" height="10" fill="white"/>
          <rect x="36" y="34" width="4" height="10" fill="white"/>
        </svg>
        <span class="menu-text">Table</span>
      </li>

      <!-- Historique / Dashboard -->
      <li @click="goToHistorique">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
          <path d="M3 3h4v18H3V3zm6 6h4v12h-4V9zm6-6h4v18h-4V3z"/>
        </svg>
        <span class="menu-text">Historique</span>
      </li>
    </ul>

    <!-- Déconnexion -->
    <div class="sidebar-footer" @click="goToDeconnexion">
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
        <path d="M16 13v-2H7V8l-5 4 5 4v-3h9z"/>
      </svg>
      <span class="menu-text">Déconnexion</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 100px;
  height: 100vh;
  background-color: #A70B0B;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.logo-img { width: 40px; height: 40px; }
.logo-text { color: #ff6f61; font-size: 12px; font-weight: bold; }

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 70px; /* espace vertical plus grand entre icônes */
  align-items: center;
}

.sidebar-menu li {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.sidebar-menu li:hover .icon { color: #A70B0B; }

.icon { width: 50px; height: 50px; transition: all 0.3s; }
.menu-text { font-size: 10px; margin-top: 5px; color: #fff; }

.sidebar-footer { display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; }
.sidebar-footer .icon { width: 40px; height: 40px; color: #fff; }
.sidebar-footer .menu-text { font-size: 10px; }
</style>
