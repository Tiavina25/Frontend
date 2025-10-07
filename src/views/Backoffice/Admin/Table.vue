<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// IMPORT NAVBAR
import NavbarBack from '@/components/Backoffice/NavbarBack.vue'

const router = useRouter()

// Tables
const tables = ref([])
const numero = ref('')
const editId = ref(null)

// Fetch tables
const fetchTables = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/admin/tables')
    tables.value = res.data
  } catch (err) { console.error(err) }
}

// Ajouter / modifier table
const saveTable = async () => {
  if (!numero.value.trim()) return alert('Veuillez entrer le numéro de la table')
  try {
    if (editId.value) {
      await axios.put(`http://localhost:8000/api/admin/tables/${editId.value}`, { numero: numero.value })
      editId.value = null
    } else {
      await axios.post('http://localhost:8000/api/admin/tables', { numero: numero.value })
    }
    numero.value = ''
    fetchTables()
  } catch (err) { console.error(err); alert('Erreur : numéro déjà existant ou problème serveur') }
}

// Préparer modification
const editTable = (table) => {
  numero.value = table.numero
  editId.value = table.id
}

// Supprimer table
const deleteTable = async (id) => {
  if (!confirm('Voulez-vous vraiment supprimer cette table ?')) return
  try {
    await axios.delete(`http://localhost:8000/api/admin/tables/${id}`)
    fetchTables()
  } catch (err) { console.error(err) }
}

onMounted(fetchTables)
</script>

<template>
  <div class="admin-layout">
    <!-- NAVBAR IMPORTÉE -->
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
          <h2>Gestion des Tables</h2>
          <p>Système de commande restaurant</p>
        </div>
      </header>

      <div class="content">
        <div class="left">
          <!-- BOX GESTION TABLES AVEC INPUT À DROITE -->
          <div class="menu-box">
            <div>
              <h3>Gestion des tables</h3>
              <p>Ajouter / Modifier / Supprimer une table</p>
            </div>

            <div class="filter-actions">
              <input v-model="numero" type="text" placeholder="Numéro de la table" />
              <button class="btn-red" @click="saveTable">{{ editId ? 'Modifier' : 'Ajouter' }}</button>
            </div>
          </div>

          <h3>Liste des Tables</h3>
          <div v-if="tables.length === 0">Aucune table trouvée</div>
          <div v-else class="plats-list">
            <div v-for="table in tables" :key="table.id" class="plat-card">
              
              <!-- Carré rouge avec numéro de table -->
              <div class="table-number">{{ table.numero }}</div>

              <div class="plat-info">
                <h4>Table {{ table.numero }}</h4>
              </div>

              <div class="plat-actions">
                <!-- Modifier -->
                <button class="icon-btn" @click="editTable(table)" title="Modifier">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                  </svg>
                </button>

                <!-- Supprimer -->
                <button class="icon-btn" @click="deleteTable(table.id)" title="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6m5 0V4h4v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

/* LAYOUT GLOBAL */
.admin-layout { display: flex; height: 100vh; font-family: 'Poppins', sans-serif; background: #f4f6f8; }
.main-area { flex: 1; display: flex; flex-direction: column; overflow: auto; }

/* HEADER */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 25px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #A70B0B;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
}

.admin-text h4 { margin:0; font-weight:600; font-size:16px; color:#333; }
.admin-text p { margin:0; font-size:0.9em; color:#666; }

.header-title h2 { margin:0; color:#A70B0B; font-size:1.7em; font-weight:700; }
.header-title p { margin:0; font-size:1em; color:#555; }

/* CONTENU PRINCIPAL */
.content { display: flex; gap:40px; padding:30px 40px; }
.left { flex:3; display:flex; flex-direction:column; gap:20px; max-width:650px; }

/* BOX GESTION TABLES */
.menu-box {
  background:#ffffff;
  border-radius:12px;
  padding:20px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  box-shadow:0 6px 18px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
}
.menu-box:hover { transform: translateY(-2px); box-shadow:0 10px 22px rgba(0,0,0,0.12); }

.filter-actions {
  display:flex;
  gap:10px;
  align-items:center;
}

.filter-actions input {
  padding:10px 14px;
  border-radius:8px;
  border:1px solid #e6b800;  /* jaune subtil */
  outline:none;
  font-size:0.95em;
  width:160px;
  box-shadow:0 2px 6px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
}
.filter-actions input:hover { border-color:#F1BA0A; box-shadow:0 4px 12px rgba(255,204,0,0.2); }
.filter-actions input:focus { border-color:#F1BA0A; box-shadow:0 4px 12px rgba(255,204,0,0.3); }

.btn-red {
  background:#a30000;
  color:#fff;
  padding:10px 16px;
  border-radius:8px;
  border:none;
  cursor:pointer;
  font-weight:bold;
  transition: background 0.3s ease, transform 0.2s ease;
}
.btn-red:hover { background:#A70B0B; transform: translateY(-2px); }

/* LISTE TABLES */
.plats-list { display:flex; flex-direction:column; gap:15px; }

.plat-card {
  display:flex;
  align-items:center;
  background:#ffffff;
  border-radius:12px;
  padding:15px 20px;
  justify-content:space-between;
  box-shadow:0 4px 12px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
}
.plat-card:hover { transform: translateY(-2px); box-shadow:0 8px 18px rgba(0,0,0,0.12); }

.table-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #F1BA0A, #F1BA0A); /* jaune dynamique */
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
  border-radius: 12px;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* INFO TABLE */
.plat-info { flex:1; }
.plat-info h4 { margin:0; font-size:16px; font-weight:600; color:#333; }

/* ACTIONS TABLES */
.plat-actions {
  display:flex;
  gap:10px;
  align-items:center;
}

.icon-btn {
  background:none;
  border:none;
  cursor:pointer;
  padding:6px;
  border-radius:8px;
  transition: background 0.2s ease, transform 0.2s ease;
}
.icon-btn:hover { background:#fff2cc; transform: translateY(-2px); color:#F1BA0A; } /* jaune clair */

.icon-svg {
  width:20px;
  height:20px;
  stroke:#727272;
  stroke-linecap:round;
  stroke-linejoin:round;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .content { flex-direction: column; padding:20px; gap:20px; }
  .left { max-width:100%; }
  .filter-actions { flex-direction:column; gap:10px; align-items:flex-start; }
}
</style>

