<template>
  <div class="page-layout">
    <div class="main-content">

      <!-- MESSAGES -->
      <div class="messages-section">
        <div class="messages-header">
          <div class="employe-circle">E</div>
          <div class="employe-info">
            <h2>Employé</h2>
            <p>Bienvenue au RestoFlow</p>
          </div>

          <!-- CLOCHETTE NOTIFICATIONS -->
          <div class="notif-bell">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11
                   a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 
                   6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 
                   1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span v-if="unreadCount > 0" class="notif-count">{{ unreadCount }}</span>
          </div>
        </div>

        <h3>Messages</h3>
        <ul>
          <li 
            v-for="notif in notifications" 
            :key="notif.id" 
            @click="ouvrirCommande(notif)" 
            :class="{ active: notif.lu === false }"
          >
            <div class="message-item">
              <div class="table-circle">{{ notif.table_numero }}</div>
              <div class="message-info">
                <div class="title-with-badge">
                  <h4>Table {{ notif.table_numero }}</h4>
                  <span class="status-badge" :class="getBadgeClass(notif)">
                    {{ getBadgeText(notif) }}
                  </span>
                </div>
                <p>{{ notif.message }}</p>
                <small v-if="notif.commande_date">Date : {{ formatDate(notif.commande_date) }}</small>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- COMMANDE DETAILS -->
      <div class="commande-card" v-if="commande">
        <div class="commande-section">
          <div class="commande-header">
            <div class="table-circle big">{{ commande.table_numero }}</div>
            <div>
              <h2>Table {{ commande.table_numero }}</h2>
              <p class="commande-date">Date : {{ formatDate(commande.created_at) }}</p>
            </div>
          </div>

          <div class="plats-list">
            <div v-for="(ligne, index) in commande.lignes" :key="index" class="plat-card">
              <img v-if="ligne.plat.image_url" :src="`http://127.0.0.1:8000/storage/${ligne.plat.image_url}`" class="plat-image" />
              <div class="plat-details">
                <h4>{{ ligne.plat.nom }}</h4>
                <p>{{ ligne.plat.description }}</p>
                <span class="plat-price">{{ ligne.prix }} Ar</span>
              </div>
              <div class="plat-quantite">Qté: {{ ligne.quantite }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ADDITION -->
      <div class="addition-section" v-if="commande">
        <h3>Addition</h3>

        <p v-if="paiementEffectue" class="paiement-ok">Cette commande est déjà payée</p>

        <div class="addition-item">
          <span>Quantité :</span>
          <span>{{ totalQuantite }}</span>
        </div>
        <div class="addition-item">
          <span>Sous total :</span>
          <span>{{ totalCommande }} Ar</span>
        </div>
        <div class="addition-item total">
          <span>Total :</span>
          <span>{{ totalCommande }} Ar</span>
        </div>
        <button class="btn-payer" @click="payerCommande" :disabled="paiementEffectue">
          {{ paiementEffectue ? 'Paiement OK' : 'Payer' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher
const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  wsHost: window.location.hostname,
  wsPort: 6001,
  forceTLS: false,
  encrypted: false,
  disableStats: true
})

const notifications = ref([])
const commande = ref(null)
const paiementEffectue = ref(false)
const nouvelleCommandeArrivee = ref(false)

const unreadCount = computed(() => notifications.value.filter(n => !n.lu).length)

// Récupération initiale
const getNotifications = async () => {
  const res = await axios.get('http://localhost:8000/api/employe/notifications')
  notifications.value = await Promise.all(
    res.data.map(async n => {
      const commandeRes = await axios.get(`http://localhost:8000/api/employe/commande/${n.commande_id}`)
      return { ...n, commande: commandeRes.data }
    })
  )
}

// Ouvrir une commande et marquer comme lue
const ouvrirCommande = async (notif) => {
  if (!notif.lu) {
    await axios.post(`http://localhost:8000/api/employe/notifications/${notif.id}/read`)
    notif.lu = true
  }
  commande.value = notif.commande
  paiementEffectue.value = commande.value.statut === "TERMINE"
  nouvelleCommandeArrivee.value = false
}

// Totaux
const totalCommande = computed(() => commande.value ? commande.value.lignes.reduce((sum, l) => sum + l.prix * l.quantite, 0) : 0)
const totalQuantite = computed(() => commande.value ? commande.value.lignes.reduce((sum, l) => sum + l.quantite, 0) : 0)

// Payer
const payerCommande = async () => {
  await axios.post(`http://localhost:8000/api/employe/commande/${commande.value.id}/payer`)
  paiementEffectue.value = true
  commande.value.statut = 'TERMINE'
  const notif = notifications.value.find(n => n.commande_id === commande.value.id)
  if (notif) notif.commande.statut = 'TERMINE'
}

// Formater date
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Badge
const getBadgeText = (notif) => notif.commande && notif.commande.statut === 'TERMINE' ? 'Payé' : notif.lu ? 'Lu' : 'Nouveau'
const getBadgeClass = (notif) => notif.commande && notif.commande.statut === 'TERMINE' ? 'paye' : notif.lu ? 'lu' : 'nouveau'

// Écoute en temps réel
onMounted(() => {
  getNotifications()

  echo.channel('employes')
    .listen('NouvelleCommandeEvent', async (e) => {
      const commandeRes = await axios.get(`http://localhost:8000/api/employe/commande/${e.id}`)
      notifications.value.unshift({
        id: e.id,
        commande_id: e.id,
        message: e.message,
        lu: false,
        table_numero: e.table_numero,
        commande_date: e.commande_date,
        commande: commandeRes.data
      })
      nouvelleCommandeArrivee.value = true
    })
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.page-layout { 
  display: flex; 
  height: 100vh; 
  background: #f4f5f7; 
  font-family: 'Poppins', sans-serif; 
}

.main-content { 
  display: grid; 
  grid-template-columns: 1.1fr 2.2fr 1fr; 
  gap: 25px; 
  flex: 1; 
  padding: 25px; 
}

/* CLOCHETTE */
.notif-bell {
  position: relative;
  margin-left: auto;
  cursor: pointer;
}
.icon-bell {
  width: 28px;
  height: 28px;
  stroke: #333;
}
.notif-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #e60000;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 50%;
}

/* MESSAGES */
.messages-section { 
  background: white; 
  border-radius: 14px; 
  box-shadow: 0 6px 16px rgba(0,0,0,0.08); 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
}
.messages-header { 
  display: flex; 
  align-items: center; 
  margin-bottom: 15px; 
  padding-bottom: 12px; 
  border-bottom: 1px solid #eee; 
}
.employe-circle { 
  width: 55px; 
  height: 55px; 
  background: #F1BA0A; 
  color: white; 
  font-weight: bold; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-right: 14px; 
  font-size: 20px; 
}

.messages-section ul { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
  max-height: 650px; 
  overflow-y: auto; 
}
.messages-section li { 
  padding: 14px; 
  margin-bottom: 12px; 
  background: #fafafa; 
  border-radius: 10px; 
  cursor: pointer; 
  transition: background 0.3s; 
}
.messages-section li:hover { 
  background: #f0f0f0; 
}
.messages-section li.active { 
  background: #fff4d1; 
}

.message-item { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}
.message-info { 
  flex: 1; 
}
.title-with-badge { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}
.status-badge { 
  padding: 3px 8px; 
  border-radius: 50px; 
  font-size: 11px; 
  font-weight: 600; 
  color: white; 
  text-align: center; 
  min-width: 50px; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.2); 
  transition: all 0.3s ease; 
}
.status-badge.nouveau { background-color: #F1BA0A; }
.status-badge.paye { background-color: #80ce74; }
.status-badge.lu { background-color: #666; }

.table-circle { 
  width: 35px; 
  height: 35px; 
  background: #A70B0B; 
  color: white; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.table-circle.big { 
  width: 55px; 
  height: 55px; 
  font-size: 18px; 
  margin-right: 12px; 
}

/* COMMANDE */
.commande-card { 
  background: white; 
  border-radius: 16px; 
  box-shadow: 0 8px 20px rgba(0,0,0,0.1); 
  padding: 20px; 
}
.commande-header { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}
.plats-list { margin-top: 20px; }
.plat-card { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  background: #f9f9f9; 
  border-radius: 12px; 
  padding: 14px; 
  margin-bottom: 12px; 
  transition: transform 0.2s, box-shadow 0.2s; 
}
.plat-card:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
}
.plat-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
.plat-details { flex: 1; margin-left: 10px; }
.plat-price { color: #A70B0B; font-weight: bold; }
.plat-quantite { background: #e0e0e0; border-radius: 12px; padding: 6px 12px; }

/* ADDITION */
.addition-section { 
  background: #fff; 
  border-radius: 14px; 
  padding: 20px; 
  box-shadow: 0 6px 18px rgba(0,0,0,0.08); 
}
.addition-section h3 { 
  text-align: center; 
  margin-bottom: 20px; 
  font-size: 1.3rem; 
  font-weight: 700; 
  color: #A70B0B; 
  letter-spacing: 0.6px; 
  border-bottom: 2px solid #f0f0f0; 
  padding-bottom: 8px; 
}
.paiement-ok { color: #A70B0B; font-weight: 600; margin-bottom: 10px; text-align: center; }
.addition-item { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; color: #333; font-weight: 500; }
.addition-item.total { background: linear-gradient(90deg, #ffe3e3, #ffd6d6); border-radius: 10px; font-weight: 700; color: #A70B0B; border: 1px solid #ffb2b2; font-size: 17px; padding: 12px; }
.btn-payer { background: linear-gradient(135deg,#A70B0B,#A70B0B); color: white; width: 100%; padding: 14px; border: none; border-radius: 10px; margin-top: 20px; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 4px 10px rgba(179,0,0,0.2); transition: all 0.3s ease; }
.btn-payer:hover { background: linear-gradient(135deg,#A70B0B,#A70B0B); box-shadow: 0 6px 14px rgba(179,0,0,0.3); transform: translateY(-2px); }
.btn-payer:disabled { background: #ccc; color: #666; cursor: not-allowed; box-shadow: none; }
</style>
