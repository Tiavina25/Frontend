<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import NavbarBack from '@/components/Backoffice/NavbarBack.vue'

const router = useRouter()

// Données
const plats = ref([])
const categories = ref([])
const selectedCategory = ref('')

// Notifications
const notifications = ref([])

const addNotification = (message, type = 'info') => {
  const id = Date.now()
  notifications.value.push({ id, message, type })
  setTimeout(() => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }, 4000) // disparition auto
}

// Fetch plats
const fetchPlats = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/admin/plats')
    plats.value = res.data
  } catch (err) {
    console.error(err)
    addNotification('Erreur de chargement des plats', 'error')
  }
}

const fetchCategories = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/admin/categories')
    categories.value = res.data || []
  } catch (err) {
    console.error(err)
    addNotification('Erreur de chargement des catégories', 'error')
  }
}

onMounted(() => { fetchPlats(); fetchCategories() })

// Computed
const filteredPlats = computed(() => {
  if (!selectedCategory.value) return plats.value
  return plats.value.filter(p => p.categorie?.id === selectedCategory.value)
})
const totalPlats = computed(() => filteredPlats.value.length)
const totalActifs = computed(() => filteredPlats.value.filter(p => p.actif).length)
const totalInactifs = computed(() => filteredPlats.value.filter(p => !p.actif).length)

// Actions
const editPlat = (plat) => router.push(`/admin/plat/${plat.id}/edit`)

const deletePlat = async (id) => {
  if (!confirm('Supprimer ce plat ?')) return
  try { 
    await axios.delete(`http://127.0.0.1:8000/api/admin/plats/${id}`) 
    plats.value = plats.value.filter(p => p.id !== id)
    addNotification('Plat supprimé avec succès', 'success')
  } catch(err){ 
    console.error(err); 
    addNotification('Erreur lors de la suppression', 'error')
  }
}

const toggleActif = async (plat) => {
  try { 
    const res = await axios.put(`http://127.0.0.1:8000/api/admin/plats/${plat.id}/toggle-actif`)
    plat.actif = res.data.actif 
    addNotification(`Plat ${plat.actif ? 'activé' : 'désactivé'}`, 'info')
  } catch(err){ 
    console.error(err); 
    addNotification('Impossible de changer le statut', 'error')
  }
}
</script>

<template>
<div class="admin-layout">
  <!-- NAVBAR -->
  <NavbarBack />

  <!-- CONTENU PRINCIPAL -->
  <main class="main-area">
    <!-- HEADER -->
    <header class="main-header">
      <div class="admin-info">
        <span class="admin-circle">A</span>
        <div class="admin-text">
          <h4>Admin</h4>
          <p>Bienvenue à RestoFlow !</p>
        </div>
      </div>

      <div class="header-title">
        <h2>Gestion du Menu</h2>
        <p>Système de commande restaurant</p>
      </div>
    </header>

    <div class="content">
      <div class="left">
        <div class="menu-box">
          <div>
            <h3>Gestion du menu</h3>
            <p>Ajouter / Modifier / Supprimer un plat</p>
          </div>
          <button class="btn-red" @click="router.push('/admin/plat')">+ Ajouter un plat</button>
        </div>

        <div class="filter-actions">
          <select v-model="selectedCategory">
            <option value="">Tous</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nom }}</option>
          </select>
          <button class="btn-red" @click="router.push('/admin/categorie')">+ Ajouter une catégorie</button>
        </div>

        <h3>
          {{ selectedCategory ? categories.find(c => c.id === selectedCategory)?.nom : 'Articles du Menu' }}
        </h3>

        <div v-if="filteredPlats.length===0">Aucun plat trouvé</div>
        <div v-else class="plats-list">
          <div v-for="plat in filteredPlats" :key="plat.id" class="plat-card">
            <img v-if="plat.image_url" :src="`http://127.0.0.1:8000/storage/${plat.image_url}`" />
            <div class="plat-info">
              <h4>{{ plat.nom }}</h4>
              <p>{{ categories.find(c => c.id === plat.categorie_id)?.nom }}</p>
              <span class="prix">{{ plat.prix }} €</span>
            </div>
            <div class="plat-actions">
              <button class="icon-btn" @click="editPlat(plat)" title="Modifier">
                <!-- Nouvelle icône stylée -->
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>

              <button class="icon-btn" @click="deletePlat(plat.id)" title="Supprimer">
                <!-- Nouvelle icône stylée -->
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M9 6V4h6v2m1 0l-1 14H7L6 6"/>
                </svg>
              </button>

              <button :class="plat.actif?'btn-disable':'btn-enable'" @click="toggleActif(plat)">
                {{ plat.actif?'Désactiver':'Activer' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside class="resume">
        <h3>Résumé</h3>
        <div class="resume-box">Total plats <span>{{ totalPlats }}</span></div>
        <div class="resume-box">Disponible <span>{{ totalActifs }}</span></div>
        <div class="resume-box">Indisponible <span>{{ totalInactifs }}</span></div>
      </aside>
    </div>
  </main>

  <!-- Notifications -->
  <div class="notification-wrapper">
    <transition-group name="slide-right" tag="div">
      <div v-for="n in notifications" :key="n.id" class="toast" :class="n.type">
        <span class="icon">
          <svg v-if="n.type==='success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4z"/></svg>
          <svg v-else-if="n.type==='error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 2C6.5 2 2 6.6 2 12s4.5 10 10 10 10-4.6 10-10S17.5 2 12 2zm5 13.6L15.6 17 12 13.4 8.4 17 7 15.6 10.6 12 7 8.4 8.4 7 12 10.6 15.6 7 17 8.4 13.4 12 17 15.6z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 2C6.5 2 2 6.6 2 12s4.5 10 10 10 10-4.6 10-10S17.5 2 12 2zM11 9h2v2h-2V9zm0 4h2v4h-2v-4z"/></svg>
        </span>
        <span class="message">{{ n.message }}</span>
        <button class="close-btn" @click="notifications = notifications.filter(x => x.id !== n.id)">×</button>
      </div>
    </transition-group>
  </div>
</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.admin-layout, .admin-layout * {
  font-family: 'Poppins', sans-serif !important;
}

.admin-layout { display: flex; height: 100vh; background: #f4f6f8; }
.main-area { flex: 1; display: flex; flex-direction: column; overflow: auto; }

.main-header {
  display: flex; justify-content: space-between; align-items: center;
  background-color: #fff; padding: 25px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
}
.admin-info { display: flex; align-items: center; gap: 15px; }
.admin-circle { width: 40px; height: 40px; border-radius: 50%; background: #A70B0B; color: #fff; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 18px; }
.admin-text h4 { margin:0; font-weight:600; font-size:16px; color:#333; }
.admin-text p { margin:0; font-size:0.9em; color:#666; }
.header-title h2 { margin:0; color:#A70B0B; font-size:1.7em; font-weight:700; }
.header-title p { margin:0; font-size:1em; color:#555; }

.content { display: flex; gap:40px; padding:30px 40px; }
.left { flex:3; display:flex; flex-direction:column; gap:20px; }

.menu-box {
  background:#fff; border-radius:12px; padding:20px;
  display:flex; justify-content:space-between; align-items:center;
  box-shadow:0 6px 18px rgba(0,0,0,0.08); transition: all 0.2s ease;
}
.menu-box:hover { transform: translateY(-2px); box-shadow:0 10px 22px rgba(0,0,0,0.12); }

.btn-red { background:#A70B0B; color:#fff; padding:10px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:bold; transition: background 0.3s ease, transform 0.2s ease; }
.btn-red:hover { background:#A70B0B; transform: translateY(-2px); }

.filter-actions { display:flex; gap:10px; margin-bottom:20px; }
.filter-actions select { padding:10px 15px; border-radius:8px; border:1px solid #ccc; background:#fff; font-size:0.95em; color:#333; outline:none; min-width:180px; box-shadow:0 2px 8px rgba(0,0,0,0.08); transition: all 0.2s ease; }
.filter-actions select:hover { border-color:#F1BA0A; box-shadow:0 4px 12px rgba(0,0,0,0.12); }
.filter-actions select:focus { border-color:#F1BA0A; box-shadow:0 4px 12px rgba(163,0,0,0.3); }

.plats-list { display:flex; flex-direction:column; gap:15px; }
.plat-card { display:flex; align-items:center; background:#fff; border-radius:12px; padding:15px 20px; justify-content:space-between; box-shadow:0 4px 12px rgba(0,0,0,0.06); transition: all 0.2s ease; }
.plat-card:hover { transform: translateY(-2px); box-shadow:0 8px 18px rgba(0,0,0,0.12); }
.plat-card img { width:70px; height:70px; border-radius:12px; object-fit:cover; }
.plat-info { flex:1; margin-left:20px; }
.plat-info h4 { margin:0; font-size:16px; font-weight:600; color:#333; }
.plat-info p { margin:5px 0 0; color:#666; font-size:0.9em; }
.prix { color:#e1b918; font-weight:bold; font-size:1em; }

.plat-actions { display:flex; gap:10px; align-items:center; }
.icon-btn { background:none; border:none; cursor:pointer; padding:6px; border-radius:8px; transition: background 0.2s ease, transform 0.2s ease; }
.icon-btn:hover { background:#f8d6d6; transform: translateY(-2px); color:#A70B0B; }
.icon-svg { width:20px; height:20px; stroke:#727272; stroke-linecap:round; stroke-linejoin:round; }

.btn-enable { background: linear-gradient(145deg, #F1BA0A, #F1BA0A); color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-weight:600; transition: all 0.2s; }
.btn-enable:hover { background: linear-gradient(145deg, #F1BA0A, #F1BA0A); }
.btn-disable { background:#A70B0B; color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-weight:600; transition: all 0.2s; }
.btn-disable:hover { background:#A70B0B; }

.resume { flex:1.2; min-width:260px; background:#fff; border-radius:12px; padding:25px 20px; box-shadow:0 4px 12px rgba(0,0,0,0.08); display:flex; flex-direction:column; gap:20px; max-height:450px; overflow-y:auto; }
.resume h3 { margin-bottom:20px; text-align:center; font-size:1.2em; color:#A70B0B; font-weight:700; }
.resume-box { background:#f4f4f4; padding:12px 15px; border-radius:10px; display:flex; justify-content:space-between; font-weight:600; color:#333; transition: all 0.2s ease; }
.resume-box:hover { background:#e8e8e8; }
.resume::-webkit-scrollbar { width:6px; }
.resume::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.2); border-radius:3px; }
.resume::-webkit-scrollbar-track { background:transparent; }

.notification-wrapper { position: fixed; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 12px; z-index: 9999; }
.toast { display:flex; align-items:center; gap:10px; padding:12px 16px; min-width:250px; border-radius:8px; color:#fff; box-shadow:0 4px 15px rgba(0,0,0,0.15); font-weight:600; animation:fadeIn 0.3s ease; }
.toast .icon svg { width:20px; height:20px; }
.toast.success { background:#888; }
.toast.error { background:#e74c3c; }
.toast.info { background:#3498db; }
.toast .message { flex:1; }
.close-btn { background:none; border:none; color:#fff; font-weight:bold; font-size:1rem; cursor:pointer; }
.close-btn:hover { color:#ddd; }

.slide-right-enter-active { animation: slideInRight 0.4s ease-out; }
.slide-right-leave-active { animation: slideOutRight 0.4s ease forwards; }
@keyframes slideInRight { from { opacity:0; transform:translateX(100%);} to {opacity:1; transform:translateX(0);} }
@keyframes slideOutRight { from {opacity:1; transform:translateX(0);} to {opacity:0; transform:translateX(100%);} }

/* RESPONSIVE */
@media screen and (max-width:1024px) {
  .content { flex-direction: column; gap: 20px; padding: 20px; }
  .left { flex:1; }
  .resume { width: 100%; max-height:none; }
  .filter-actions { flex-direction: column; gap:10px; }
  .filter-actions select, .filter-actions button { width: 100%; }
  .menu-box { flex-direction: column; gap:10px; text-align:center; }
  .menu-box button { width:100%; }
  .plat-card { flex-direction: column; align-items:flex-start; gap:10px; }
  .plat-actions { width:100%; justify-content:flex-start; gap:10px; }
}

@media screen and (max-width:768px) {
  .main-header { flex-direction:column; align-items:flex-start; gap:10px; }
}

@media screen and (max-width:480px) {
  .notification-wrapper { top:10px; right:10px; }
  .toast { min-width:200px; padding:10px 12px; font-size:0.9rem; }
  .plat-card img { width:100%; max-width:120px; height:auto; }
}
</style>
