<template>
  <div class="menu-container">
    <!-- HEADER -->
    <header class="header">
      <div class="table-info" v-if="tableNumero">
        <button class="btn-back" @click="goBack" aria-label="Retour">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span class="table-circle">{{ tableNumero }}</span>
        <div class="table-text">
          <span class="table-label">Table {{ tableNumero }}</span>
          <p class="table-welcome">Bienvenue à RestoFlow</p>
        </div>
      </div>
      <div class="header-text">
        <h1>Votre menu</h1>
        <p>Système de commande restaurant</p>
      </div>
    </header>

    <div class="main-content">
      <!-- MENU -->
      <section class="menu-section">
        <h2>Menu</h2>
        <!-- Recherche et filtres -->
        <div class="search-bar">
          <span class="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#888">
              <path d="M21 20l-5.6-5.6a7 7 0 1 0-1.4 1.4L20 21zM10 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
            </svg>
          </span>
          <input type="text" v-model="searchTerm" placeholder="Rechercher menu" />
        </div>

        <div class="categories-filter" v-if="categories.length > 0">
          <button @click="resetFilter" :class="{ active: selectedCategory === null }">Tous</button>
          <button v-for="cat in categories" :key="cat.id"
                  @click="filterByCategory(cat.id, cat.nom)"
                  :class="{ active: selectedCategory === cat.id }">
            {{ cat.nom }}
          </button>
        </div>

        <h3 v-if="selectedCategoryName">{{ selectedCategoryName }}</h3>

        <div v-if="filteredPlats.length === 0" class="no-plat">Aucun plat disponible</div>
        <div class="plats-grid">
          <div v-for="plat in filteredPlats" :key="plat.id" class="plat-card"
               :class="{ active: selectedPlat && selectedPlat.id === plat.id }">
            <img v-if="plat.image_url" :src="`http://127.0.0.1:8000/storage/${plat.image_url}`" />
            <h4>{{ plat.nom }}</h4>
            <p class="prix">{{ plat.prix }} €</p>

            <div v-if="selectedPlat && selectedPlat.id === plat.id" class="plat-details">
              <p class="description">{{ plat.description }}</p>
              <div class="quantity-selector">
                <button @click="quantity > 1 ? quantity-- : null">-</button>
                <span>{{ quantity }}</span>
                <button @click="quantity++">+</button>
              </div>
            </div>

            <button class="btn-add"
                    @click="selectedPlat && selectedPlat.id === plat.id ? ajouterACommande(plat) : voirDetails(plat)">
              {{ selectedPlat && selectedPlat.id === plat.id ? 'Ajouter à la commande' : 'Détails' }}
            </button>
          </div>
        </div>
      </section>

      <!-- COMMANDE -->
      <aside class="commande-section">
        <h3>Plats</h3>
        <div class="type-commande" v-if="commande.length > 0">
          <label>Type de commande :</label>
          <select v-model="typeChoisi">
            <option disabled value="">Choisir...</option>
            <option v-for="type in typesCommande" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <div v-if="commande.length === 0" class="empty">
          Aucune commande
        </div>
        <div v-else>
          <div v-for="(item, index) in commande" :key="item.platId" class="commande-item">
            <img v-if="item.image_url" :src="`http://127.0.0.1:8000/storage/${item.image_url}`" />
            <div>
              <h4>{{ item.nom }}</h4>
              <p class="subtotal">{{ (item.prix * item.quantite).toFixed(2) }} €</p>
              <div class="qtt-control">
                <button @click="modifierQuantite(index, -1)">-</button>
                <span>{{ item.quantite }}</span>
                <button @click="modifierQuantite(index, 1)">+</button>
              </div>
              <button class="btn-delete" @click="supprimerPlat(index)">🗑</button>
            </div>
          </div>

          <div class="addition">
            <p>Quantité : <strong>{{ commande.length }}</strong></p>
            <p>Total : <strong>{{ total }} €</strong></p>
            <button class="btn-confirm" @click="validerCommande">Confirmer</button>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="notif.show" class="notification">{{ notif.message }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import echo from '@/pusher.js'

const router = useRouter()
const plats = ref([])
const categories = ref([])
const searchTerm = ref('')
const selectedCategory = ref(null)
const selectedCategoryName = ref('')
const tableNumero = ref(null)
const selectedPlat = ref(null)
const quantity = ref(1)
const commande = ref([])
const typesCommande = ref([])
const typeChoisi = ref('')
const notif = ref({ show: false, message: '' })

const showNotification = (msg) => {
  notif.value.message = msg
  notif.value.show = true
  setTimeout(() => { notif.value.show = false }, 3000)
}

const goBack = () => router.push('/client/tables')

const fetchPlats = async () => {
  try { 
    const res = await axios.get('http://localhost:8000/api/client/plats')
    plats.value = res.data.plats || res.data
  } catch (err) { console.error(err) }
}

const fetchCategories = async () => {
  try { categories.value = (await axios.get('http://localhost:8000/api/client/categories')).data } 
  catch (err) { console.error(err) }
}

const fetchTypesCommande = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/client/types-commande')
    typesCommande.value = res.data.map(t => t.type_commande)
  } catch (err) { console.error(err) }
}

const filteredPlats = computed(() =>
  plats.value.filter(plat => {
    const matchSearch = plat.nom.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchCategory = selectedCategory.value ? plat.categorie_id === selectedCategory.value : true
    return matchSearch && matchCategory
  })
)

const filterByCategory = (id, name) => {
  selectedCategory.value = id
  selectedCategoryName.value = name
}
const resetFilter = () => {
  selectedCategory.value = null
  selectedCategoryName.value = ''
}

onMounted(() => {
  const storedTable = localStorage.getItem('selectedTable')
  if (storedTable) {
    const table = JSON.parse(storedTable)
    tableNumero.value = table.numero
  }
  fetchPlats()
  fetchCategories()
  fetchTypesCommande()
  chargerCommande()

  echo.channel('employes')
      .listen('.NouvelleCommandeEvent', (e) => {
          console.log('Nouvelle commande reçue !', e)
          if (e.table_numero) showNotification(`Nouvelle commande pour la table ${e.table_numero}`)
      })
})

const voirDetails = plat => { selectedPlat.value = plat; quantity.value = 1 }

const chargerCommande = () => {
  const table = JSON.parse(localStorage.getItem('selectedTable') || '{}')
  const tableId = table.id || 'default'
  const commandes = JSON.parse(localStorage.getItem('commandes') || '{}')
  commande.value = commandes[tableId] || []
}

const ajouterACommande = plat => {
  const table = JSON.parse(localStorage.getItem('selectedTable') || '{}')
  const tableId = table.id || 'default'
  const commandes = JSON.parse(localStorage.getItem('commandes') || '{}')
  if (!commandes[tableId]) commandes[tableId] = []

  const tableCommande = commandes[tableId]
  const index = tableCommande.findIndex(item => item.platId === plat.id)
  if (index !== -1) tableCommande[index].quantite += quantity.value
  else tableCommande.push({ platId: plat.id, nom: plat.nom, prix: plat.prix, quantite: quantity.value, image_url: plat.image_url })

  commandes[tableId] = tableCommande
  localStorage.setItem('commandes', JSON.stringify(commandes))
  chargerCommande()
  selectedPlat.value = null
  showNotification(`✅ ${quantity.value} ${plat.nom} ajouté(s) à la commande !`)
}

const modifierQuantite = (index, delta) => {
  commande.value[index].quantite += delta
  if (commande.value[index].quantite < 1) commande.value[index].quantite = 1
  sauvegarderCommande()
}

const supprimerPlat = index => {
  commande.value.splice(index, 1)
  sauvegarderCommande()
}

const sauvegarderCommande = () => {
  const table = JSON.parse(localStorage.getItem('selectedTable') || '{}')
  const tableId = table.id || 'default'
  const commandes = JSON.parse(localStorage.getItem('commandes') || '{}')
  commandes[tableId] = commande.value
  localStorage.setItem('commandes', JSON.stringify(commandes))
}

const total = computed(() =>
  commande.value.reduce((sum, item) => sum + item.prix * item.quantite, 0).toFixed(2)
)

const validerCommande = async () => {
  if (commande.value.length === 0) return alert("Votre commande est vide !")
  if (!typeChoisi.value) return alert("Veuillez choisir un type de commande !")

  try {
    const lignes = commande.value.map(item => ({
      plat_id: item.platId,
      quantite: item.quantite,
      prix: item.prix
    }))

    const table = JSON.parse(localStorage.getItem('selectedTable') || '{}')
    const table_id = table.id || null

    await axios.post('http://localhost:8000/api/client/commandes', {
      table_id,
      type_commande: typeChoisi.value,
      lignes
    })

    const commandes = JSON.parse(localStorage.getItem('commandes') || '{}')
    commandes[table.id] = []
    localStorage.setItem('commandes', JSON.stringify(commandes))
    commande.value = []

    showNotification("✅ Votre commande a été envoyée !")
  } catch (err) {
    console.error(err)
    showNotification("❌ Erreur lors de l'envoi de la commande")
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

/* ===== Appliquer Poppins à tout ===== */
.menu-container, .menu-container * {
  font-family: 'Poppins', sans-serif !important;
}

/* --- Tout ton CSS existant reste inchangé --- */

/* HEADER */
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

.table-info { display: flex; align-items: center; gap: 12px; }
.table-circle { width: 40px; height: 40px; border-radius: 50%; background: white; color: #A70B0B; display: flex; justify-content: center; align-items: center; font-size: 18px; font-weight: bold; }
.table-label { font-weight: bold; color: white; font-size: 17px; }
.table-text { display: flex; flex-direction: column; gap: 5px; color: white; }
.table-welcome { margin: 0; font-size: 1em; color: #f5f5f5; }

.btn-back {
  background-color: rgba(255,255,255,0.3);
  border: none;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}
.btn-back:hover { background-color: rgba(255,255,255,0.5); }
.btn-back svg { width: 22px; height: 22px; }

.header-text { margin-left: auto; text-align: right; color: white; }
.header-text h1 { margin: 0; font-size: 1.8em; font-weight: bold; }
.header-text p { margin: 0; font-size: 1.1em; opacity: 0.9; }

/* MAIN CONTENT */
.main-content { display: flex; padding: 20px; gap: 30px; justify-content: flex-start; }
.menu-section { flex: 2; margin-left: 30px; }
.menu-section h3 { font-weight: 600; font-size: 1.3em; margin: 40px 0 15px 0; text-align: left; }
.commande-section { flex: 1; background: #f8f8f8; padding: 20px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.commande-section h3 { text-align: center; }

.search-bar { position: relative; width: 30%; background: #f0f0f0; border-radius: 10px; padding: 5px 10px; margin-bottom: 25px; display: flex; align-items: center; }
.search-bar .search-icon { position: absolute; left: 15px; pointer-events: none; }
.search-bar input { width: 100%; padding: 10px 10px 10px 35px; border: none; outline: none; background: transparent; font-size: 0.95em; color: #555; }
.search-bar input::placeholder { color: #aaa; }
.categories-filter { display: flex; gap: 10px; margin-bottom: 20px; }
.categories-filter button { padding: 8px 15px; border-radius: 20px; border: none; cursor: pointer; background: #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);}
.categories-filter button.active { background: #f57e7e; color: white; }

.plats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 38px; }
.plat-card { background: #fff; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 6px 14px rgba(0,0,0,0.08); width: 200px; transition: transform 0.2s; margin: auto; }
.plat-card:hover { transform: scale(1.05); }
.plat-card.active { background: #fddede; }
.plat-card img { width: 120px; height: 120px; object-fit: cover; margin-bottom: 12px; }
.plat-card h4 { font-weight: 600; font-size: 1em; color: #333; margin: 8px 0 4px 0; text-align: center; }
.prix { color: #F1BA0A; font-weight: bold; }
.plat-details { margin-top: 10px; text-align: left; }
.plat-details .description { font-size: 0.9em; color: #555; margin-bottom: 10px; }
.quantity-selector { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 10px; }
.quantity-selector button { padding: 6px 10px; border: none; background: #ccc; border-radius: 5px; }
.btn-add { margin-top: 10px; background: #A70B0B; color: white; padding: 8px 15px; border-radius: 10px; border: none; cursor: pointer; }

.commande-section { flex: 1; background: #fff; padding: 20px; border-radius: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.commande-section h3 { text-align: center; margin-bottom: 15px; font-size: 1.3em; font-weight: 600; color: #A70B0B; }
.type-commande { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.type-commande label { font-weight: 500; color: #333; }
.type-commande select { padding: 8px 12px; border-radius: 10px; border: 1px solid #ccc; outline: none; font-size: 0.95em; cursor: pointer; transition: border 0.2s; }
.type-commande select:focus { border-color: #A70B0B; }

.commande-item { display: flex; gap: 15px; background: #f9f0f0; padding: 12px; border-radius: 12px; margin-bottom: 15px; align-items: center; transition: background 0.2s; }
.commande-item:hover { background: #ffe5e5; }
.commande-item img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; }
.commande-item div h4 { margin: 0; font-size: 1em; font-weight: 600; color: #333; }
.subtotal { font-weight: bold; color: #A70B0B; margin: 4px 0; }
.qtt-control { display: flex; gap: 8px; align-items: center; margin-top: 5px; }
.qtt-control button { padding: 5px 10px; border: none; background: #eee; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.qtt-control button:hover { background: #ddd; }
.btn-delete { background: none; border: none; color: #A70B0B; cursor: pointer; font-size: 18px; margin-left: auto; transition: transform 0.2s; }
.btn-delete:hover { transform: scale(1.2); }

.addition { margin-top: 20px; background: #fff4e1; padding: 15px; border-radius: 12px; text-align: center; font-weight: 500; }
.addition p { margin: 5px 0; font-size: 1em; }

.btn-confirm { margin-top: 10px; background: #F1BA0A; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; font-size: 0.95em; cursor: pointer; transition: all 0.3s ease; }
.btn-confirm:hover { background: #ecc115; transform: translateY(-2px); }

.empty { display: flex; justify-content: center; align-items: center; height: 180px; font-size: 1.1em; font-weight: 500; color: #999; text-align: center; border: 2px dashed #ccc; border-radius: 12px; }

.notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #888; color: white; padding: 15px 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-weight: bold; animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards; z-index: 9999; }
@keyframes slideIn { from { transform: translateX(50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
@keyframes fadeOut { to { opacity: 0; transform: translateX(-50%) translateY(-20px); } }
</style>
