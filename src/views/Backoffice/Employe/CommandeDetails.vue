<template>
  <div v-if="commande" class="commande-container">
    <h2>Détails commande #{{ commande.id }}</h2>
    <p>Type : {{ commande.type_commande }}</p>
    <p>Date : {{ formatDate(commande.created_at) }}</p>
    <p>Table : {{ commande.table_numero || 'Aucune' }}</p>

    <ul>
      <li v-for="(ligne, index) in commande.lignes" :key="index" class="plat-card">
        <img v-if="ligne.plat.image_url" :src="`http://127.0.0.1:8000/storage/${ligne.plat.image_url}`" class="plat-image"/>
        <div class="plat-info">
          <span class="plat-nom">{{ ligne.plat.nom }}</span>
          <span class="quantite-badge">{{ ligne.quantite }}</span>
          <span class="plat-prix">{{ ligne.prix }} €</span>
        </div>
      </li>
    </ul>

    <div class="totals-section">
      <div class="total-item">
        <span>Total quantité :</span>
        <span class="total-value">{{ totalQuantite }}</span>
      </div>
      <div class="total-item">
        <span>Total :</span>
        <span class="total-value">{{ totalCommande }} €</span>
      </div>
    </div>

    <div class="payer-container">
      <button class="btn-payer" @click="payerCommande" :disabled="paiementEffectue">
        {{ paiementEffectue ? "Paiement OK" : "Payer" }}
      </button>
    </div>

    <p v-if="messagePaiement" class="message-success">{{ messagePaiement }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const commande = ref(null)
const messagePaiement = ref('')
const paiementEffectue = ref(false)
const route = useRoute()
const id = route.params.id

// Récupération de la commande
onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:8000/api/employe/commande/${id}`)
    commande.value = res.data
    // Si la commande est déjà payée (statut TERMINE)
    if (commande.value.statut === "TERMINE") paiementEffectue.value = true
  } catch (err) {
    console.error("Erreur récupération commande:", err)
  }
})

const totalCommande = computed(() => {
  if (!commande.value || !commande.value.lignes) return 0
  return commande.value.lignes.reduce((sum, ligne) => sum + ligne.prix * ligne.quantite, 0)
})

const totalQuantite = computed(() => {
  if (!commande.value || !commande.value.lignes) return 0
  return commande.value.lignes.reduce((sum, ligne) => sum + ligne.quantite, 0)
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Paiement
const payerCommande = async () => {
  try {
    await axios.post(`http://localhost:8000/api/employe/commande/${id}/payer`)
    paiementEffectue.value = true
    messagePaiement.value = "Paiement validé"
  } catch (err) {
    console.error('Erreur lors du paiement:', err)
    messagePaiement.value = "Erreur lors du paiement"
  }
}
</script>

<style scoped>
.commande-container {
  max-width: 700px;
  margin: 30px auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h2 { text-align: center; margin-bottom: 15px; color: #2c3e50; font-family: 'Arial', sans-serif; }
p { font-size: 16px; color: #34495e; margin: 4px 0; font-family: 'Arial', sans-serif; }

ul { list-style: none; padding: 0; margin-top: 20px; }

.plat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f4f6f8;
  padding: 12px 15px;
  margin-bottom: 12px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.plat-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }

.plat-info { display: flex; flex: 1; justify-content: space-between; align-items: center; }
.plat-nom { font-weight: bold; color: #2c3e50; }
.plat-prix { font-weight: normal; color: #2c3e50; }
.quantite-badge { background: #3498db; color: white; font-weight: bold; padding: 6px 12px; border-radius: 14px; text-align: center; }

.totals-section {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f1f3f6;
  border-radius: 10px;
  font-weight: bold;
  color: #2c3e50;
}

.total-item { display: flex; flex-direction: column; align-items: center; }
.total-value { font-size: 18px; margin-top: 4px; color: #2c3e50; }

.payer-container { display: flex; justify-content: center; margin-top: 20px; }
.btn-payer {
  background-color: #2c3e50;
  color: white;
  font-weight: bold;
  border: none;
  padding: 10px 35px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-payer:hover { background-color: #2c3e50; }

.message-success {
  text-align: center;
  margin-top: 15px;
  color: green;
  font-weight: bold;
}
</style>
