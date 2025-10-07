<template>
  <div>
    <!-- HEADER -->
    <header class="header">
      <div class="header-text">
        <h1>Votre table</h1>
        <p>Système de commande restaurant</p>
      </div>
    </header>

    <!-- CONTENT EXISTANT -->
    <div class="content">
      <h2>Sélectionner votre table</h2>
      <p>Système de commande restaurant</p>

      <ul>
        <li 
          v-for="table in tables" 
          :key="table.id" 
          @click="selectTable(table)" 
          :class="{ selected: selectedTable && selectedTable.id === table.id }"
        >
          <div class="table-number" :class="{ active: selectedTable && selectedTable.id === table.id }">
            {{ table.numero }}
          </div>
          Table {{ table.numero }}
        </li>
      </ul>

      <div v-if="selectedTable" class="validation">
        <p>Vous avez sélectionné la table {{ selectedTable.numero }}</p>
        <button @click="validateTable">Valider</button>
      </div>
    </div>

    <!-- Notification moderne centrée -->
    <transition name="toast-fade">
      <div v-if="showToast" :class="['toast', toastType]">
        <span class="toast-icon">✅</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const tables = ref([])
const selectedTable = ref(null)
const tableNumero = ref(null)

// Notification
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const fetchTables = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/client/tables')
    tables.value = res.data
  } catch (error) {
    showToastMessage('Erreur lors de la récupération des tables', 'error')
    console.error(error)
  }
}

onMounted(() => {
  fetchTables()
  const storedTable = localStorage.getItem('selectedTable')
  if (storedTable) tableNumero.value = JSON.parse(storedTable).numero
})

const selectTable = (table) => { selectedTable.value = table }

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => (showToast.value = false), 3000)
}

const validateTable = () => {
  if (!selectedTable.value) return
  localStorage.setItem('selectedTable', JSON.stringify(selectedTable.value))
  showToastMessage(`Table n° ${selectedTable.value.numero} validée !`, 'success')
  setTimeout(() => router.push('/client/menu'), 3000)
}

const goBack = () => { router.push('/client/tables') }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

/* ================= POLICE GLOBALE ================= */
* {
  font-family: 'Poppins', sans-serif !important;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ================= HEADER ================= */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #A70B0B;
  padding: 25px 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  color: white;
  border-radius: 0 0 18px 18px;
}

.header-text {
  margin-left: auto;
  text-align: right;
  color: white;
}

.header-text h1 {
  margin: 0;
  font-size: 1.8em;
  font-weight: 600;
}

.header-text p {
  margin: 0;
  font-size: 1.1em;
  opacity: 0.9;
  color: white;
}

/* ================= BODY / CONTENT ================= */
body {
  background: linear-gradient(160deg, #fff7f7, #f5f5f5);
}

.content {
  padding: 30px 20px;
  text-align: center;
}

/* TITRES */
h2 {
  margin: 20px 0 10px 0;
  color: #A70B0B;
  font-size: 2em;
  font-weight: 600;
}

/* PARAGRAPHES */
p {
  color: #333;
  font-size: 1.1em;
  margin-bottom: 50px;
}

/* GRILLE DE TABLES */
ul {
  max-width: 1000px;
  margin: 30px auto 0 auto;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

/* CARTES DE TABLE */
li {
  list-style: none;
  padding: 20px;
  border-radius: 20px;
  background: #ffffff;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2em;
  height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #4a4a4a;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

li:hover {
  transform: translateY(-7px);
  box-shadow: 0 15px 25px rgba(0,0,0,0.2);
  background: linear-gradient(145deg, #ffe066, #fff1b8);
}

/* NUMÉRO DE TABLE */
.table-number {
  width: 60px;
  height: 60px;
  background-color: #A70B0B;
  color: white;
  border-radius: 50%;
  margin-bottom: 15px;
  line-height: 60px;
  font-weight: 600;
  font-size: 1.4em;
  text-align: center;
  transition: all 0.3s ease;
}

.table-number.active {
  background-color: #FFE066;
  color: #A70B0B;
  transform: scale(1.3);
}

.selected {
  background-color: #FFFACD;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

/* VALIDATION */
.validation {
  text-align: center;
  margin-top: 30px;
}

button {
  padding: 12px 30px;
  background-color: #A70B0B;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  font-size: 1.2em;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

button:hover {
  transform: translateY(-3px);
}

/* NOTIFICATION */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #888;
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  font-weight: 600;
  z-index: 9999;
}

.toast.success { background: #c6d2c9; }
.toast.error { background: #dc3545; }
</style>
