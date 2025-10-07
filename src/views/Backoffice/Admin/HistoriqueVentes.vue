<script setup>
import { ref } from 'vue'
import axios from 'axios'
import NavbarBack from '@/components/Backoffice/NavbarBack.vue'

// Historique ventes
const dateDebut = ref(null)
const dateFin = ref(null)
const periode = ref('')
const global = ref({ total_commandes: 0, chiffre_affaires: 0, total_plats: 0 })
const historique = ref([])

// Formatter prix
const formatPrix = (val) => val ? parseFloat(val).toFixed(2) + " €" : "0.00 €"

// Charger historique
const chargerHistorique = (p = '') => {
  if (!dateDebut.value && !dateFin.value && !p) {
    return alert("Veuillez sélectionner une période ou une plage de dates")
  }

  periode.value = p

  axios.get("http://localhost:8000/api/admin/historique-ventes", { 
    params: { 
      date_debut: dateDebut.value, 
      date_fin: dateFin.value, 
      periode: periode.value 
    } 
  })
  .then(res => {
    global.value = res.data.global
    historique.value = res.data.commandes_details || []
  })
  .catch(err => console.error(err))
}
</script>

<template>
<div class="admin-layout">
  <NavbarBack />

  <main class="main-area">
    <header class="main-header">
      <div class="admin-info">
        <span class="admin-circle">A</span>
        <div class="admin-text">
          <h4>Admin</h4>
          <p>Bienvenue à RestoFlow !</p>
        </div>
      </div>
      <div class="header-title">
        <h2>Historique des Ventes</h2>
        <p>Suivi quotidien et périodique des commandes</p>
      </div>
    </header>

    <div class="content">
      <div class="left">

        <!-- FILTRES PÉRIODE -->
        <div class="periode-filtres">
          <p>Période :</p>
          <span 
            class="periode-item" 
            :class="{ active: periode === 'aujourdhui' }" 
            @click="chargerHistorique('aujourdhui')">Aujourd'hui</span>
          <span 
            class="periode-item" 
            :class="{ active: periode === 'cette_semaine' }" 
            @click="chargerHistorique('cette_semaine')">Cette semaine</span>
          <span 
            class="periode-item" 
            :class="{ active: periode === 'ce_mois' }" 
            @click="chargerHistorique('ce_mois')">Ce mois</span>
        </div>

        <!-- RÉSUMÉ GLOBAL -->
        <div class="resume-global" :class="{ 'empty': !historique.length }">
          <div class="card">
            <p>Total commandes :</p>
            <h3>{{ global.total_commandes }}</h3>
          </div>
          <div class="card">
            <p>Chiffre d'affaires :</p>
            <h3>{{ formatPrix(global.chiffre_affaires) }}</h3>
          </div>
          <div class="card">
            <p>Total plats :</p>
            <h3>{{ global.total_plats }}</h3>
          </div>
        </div>

        <!-- FILTRE DATE DÉBUT / FIN -->
        <div class="filtres">
          <label>Date début :
            <input type="date" v-model="dateDebut" />
          </label>
          <label>Date fin :
            <input type="date" v-model="dateFin" />
          </label>
          <button class="btn" @click="chargerHistorique()">Valider</button>
        </div>

        <!-- HISTORIQUE DÉTAILLÉ -->
        <h3>Détail des commandes</h3>
        <div v-if="historique.length" class="commandes-list">
          <div v-for="commande in historique" :key="commande.id" class="commande-card">
            <div class="commande-header">
              <span class="commande-id">Commande #{{ commande.id }}</span>
              <span class="commande-date">{{ commande.created_at }}</span>
            </div>
            <div class="commande-body">
              <p>Total € : <strong>{{ formatPrix(commande.total) }}</strong></p>
              <p>Total Qtt : <strong>{{ commande.total_qtt }}</strong></p>
            </div>
          </div>
        </div>
        <p v-else class="no-data">Aucune commande pour cette période.</p>
      </div>
    </div>
  </main>
</div>
</template>


<style scoped>
/* Charger la police Poppins depuis Google Fonts */
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

.admin-info { display: flex; align-items: center; gap: 15px; }
.admin-circle { width: 40px; height: 40px; border-radius: 50%; background: #a81616; color: #fff; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 18px; }
.admin-text h4 { margin:0; font-weight:600; font-size:16px; color:#333; }
.admin-text p { margin:0; font-size:0.9em; color:#666; }
.header-title h2 { margin:0; color:#800000; font-size:1.7em; font-weight:700; }
.header-title p { margin:0; font-size:1em; color:#555; }

/* CONTENU */
.content { display: flex; gap:40px; padding:30px 40px; }
.left { flex:3; display:flex; flex-direction:column; gap:20px; }

/* FILTRES */
.periode-filtres { display: flex; gap:12px; align-items:center; margin-bottom:20px; }
.periode-item { padding:8px 18px; border-radius:12px; background:#f0e5e5; cursor:pointer; font-weight:600; color:#800000; transition: all 0.3s; border:1px solid transparent; }
.periode-item.active { background:#a30000; color:white; box-shadow: 0 4px 12px rgba(128,0,0,0.3); border-color: #a30000; }
.periode-item:hover { background:#cc0000; color:white; }

/* BOUTON DATE */
.filtres { display:flex; gap:15px; align-items:center; margin-bottom:20px; }
input[type="date"] { padding:8px 14px; border-radius:8px; border:1px solid #ccc; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
button.btn { padding:8px 22px; background-color:#a30000; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; transition: all 0.3s; }
button.btn:hover { background-color:#cc0000; box-shadow: 0 4px 12px rgba(163,0,0,0.3); }

/* RÉSUMÉ GLOBAL */
.resume-global { display:flex; gap:20px; margin-bottom:25px; }
.resume-global.empty { opacity:0.5; }
.resume-global .card { flex:1; background:white; padding:25px 20px; border-radius:12px; box-shadow:0 6px 15px rgba(0,0,0,0.08); text-align:center; transition: all 0.3s; }
.resume-global .card:hover { box-shadow:0 10px 25px rgba(0,0,0,0.12); }
.resume-global .card h3 { margin-top:10px; color:#a30000; font-size:1.8em; font-weight:700; }

/* LISTE COMMANDES */
.commandes-list { display:flex; flex-direction:column; gap:20px; }
.commande-card { background:white; padding:20px 25px; border-radius:12px; box-shadow:0 6px 15px rgba(0,0,0,0.08); transition: all 0.3s; }
.commande-card:hover { transform: translateY(-3px); box-shadow:0 10px 20px rgba(0,0,0,0.12); }
.commande-header { display:flex; justify-content:space-between; font-weight:600; margin-bottom:12px; }
.commande-id { color:#a30000; font-weight:700; }
.commande-date { color:#555; font-size:0.9em; }
.commande-body p { margin:6px 0; font-size:1em; }

/* MESSAGE VIDE */
.no-data { text-align:center; color:#a30000; font-style:italic; margin-top:20px; }
</style>
