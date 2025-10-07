<template>
  <div>
    <Navbar />
    <h2>Validation de la Commande</h2>

    <div v-if="commande.length === 0" class="empty">
      Votre commande est vide
    </div>

    <div v-else>
      <div class="type-commande">
        <label>Type de commande :</label>
        <select v-model="typeChoisi">
          <option disabled value="">Choisir...</option>
          <option v-for="type in typesCommande" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
      <div class="panier-list">
        <div v-for="(item, index) in commande" :key="item.platId" class="plat-card">
          <img v-if="item.image_url" :src="`http://127.0.0.1:8000/storage/${item.image_url}`" class="plat-image"/>
          <div class="plat-info">
            <h3>{{ item.nom }}</h3>
            <div class="ligne-quantite">
              <div class="qtt-control">
                <button @click="modifierQuantite(index, -1)">-</button>
                <span>{{ item.quantite }}</span>
                <button @click="modifierQuantite(index, 1)">+</button>
              </div>
              <p>Sous-total : <strong>{{ (item.prix * item.quantite).toFixed(2) }} €</strong></p>
            </div>
            <button @click="supprimerPlat(index)" class="btn-supprimer">Supprimer</button>
          </div>
        </div>
      </div>

      <!-- <div class="type-commande">
        <label>Type de commande :</label>
        <select v-model="typeChoisi">
          <option disabled value="">Choisir...</option>
          <option v-for="type in typesCommande" :key="type" :value="type">{{ type }}</option>
        </select>
      </div> -->

      <p class="total">Total : <strong>{{ total }} €</strong></p>

      <button @click="validerCommande" class="btn-valider">Valider la commande</button>

      <div v-if="message" class="confirmation">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Navbar from '@/components/Frontoffice/NavbarFront.vue'

const commande = ref([])
const typesCommande = ref([])
const typeChoisi = ref('')
const message = ref('')

// Récupérer la commande spécifique de la table
onMounted(async () => {
  const table = JSON.parse(localStorage.getItem('selectedTable') || '{}')
  const tableId = table.id || 'default'

  const commandes = JSON.parse(localStorage.getItem('commandes') || '{}')
  commande.value = commandes[tableId] || []

  try {
    const res = await axios.get('http://localhost:8000/api/client/types-commande')
    typesCommande.value = res.data.map(t => t.type_commande)
  } catch(err) {
    console.error('Erreur récupération types commande:', err)
  }
})

// Calcul du total
const total = computed(() =>
  commande.value.reduce((sum, item) => sum + item.prix * item.quantite, 0).toFixed(2)
)

// Modifier la quantité avec + / -
const modifierQuantite = (index, delta) => {
  commande.value[index].quantite += delta
  if (commande.value[index].quantite < 1) commande.value[index].quantite = 1
  const table = JSON.parse(localStorage.getItem('selectedTable') || '{}')
  const tableId = table.id || 'default'
  const commandes = JSON.parse(localStorage.getItem('commandes') || '{}')
  commandes[tableId] = commande.value
  localStorage.setItem('commandes', JSON.stringify(commandes))
}

// Supprimer un plat de la commande
const supprimerPlat = (index) => {
  const table = JSON.parse(localStorage.getItem('selectedTable') || '{}')
  const tableId = table.id || 'default'
  commande.value.splice(index, 1)
  const commandes = JSON.parse(localStorage.getItem('commandes') || '{}')
  commandes[tableId] = commande.value
  localStorage.setItem('commandes', JSON.stringify(commandes))
}

// Valider la commande et l'envoyer au serveur
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

    // Supprimer uniquement la commande de cette table
    const commandes = JSON.parse(localStorage.getItem('commandes') || '{}')
    commandes[table.id] = []
    localStorage.setItem('commandes', JSON.stringify(commandes))

    message.value = "Commande envoyée avec succès !"
    commande.value = []
  } catch (err) {
    console.error(err)
    message.value = "Erreur lors de l'envoi de la commande"
  }
}
</script>

<style scoped>
h2 { text-align:center; margin:20px 0; color:#333; }
.panier-list { display:flex; flex-wrap:wrap; gap:20px; justify-content:center; }
.plat-card { display:flex; background:#f9f9f9; border-radius:10px; padding:10px; box-shadow:0 4px 8px rgba(0,0,0,0.1); width:500px; }
.plat-image { width:120px; height:120px; object-fit:cover; border-radius:10px; margin-right:15px; }
.plat-info { flex:1; display:flex; flex-direction:column; justify-content:space-between; }
.ligne-quantite { display:flex; justify-content:space-between; align-items:center; margin:10px 0; }
.qtt-control { display:flex; align-items:center; gap:10px; }
.qtt-control button { padding:4px 10px; background:#98999a; color:white; border:none; border-radius:5px; cursor:pointer; }
.qtt-control button:hover { background:#98999a; }
.qtt-control span { min-width:20px; text-align:center; display:inline-block; }
.type-commande { text-align:center; margin:15px 0; }
.type-commande select { padding:8px; border-radius:5px; border:1px solid #ccc; }
.total { text-align:right; margin:20px 5%; font-weight:bold; font-size:18px; color:#2c3e50; }
.btn-valider { display:block; margin:20px auto; padding:12px 25px; background:#2c3e50; color:white; border:none; border-radius:8px; cursor:pointer; font-size:16px; }
.btn-valider:hover { background:#2c3e50; }
.btn-supprimer { margin-top:10px; background:#bf5653; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; align-self:flex-start; }
.btn-supprimer:hover { background:#bf5653; }
.confirmation { text-align:center; font-weight:bold; margin-top:20px; color:green }
.empty { text-align:center; font-weight:bold; margin-top:20px; color:#777; font-size:16px; }
</style>
