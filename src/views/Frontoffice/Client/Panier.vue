<template>
    <div>
      <Navbar />
      <h2>Mon Panier</h2>
  
      <div v-if="panier.length === 0" class="empty">
        Votre panier est vide
      </div>
  
      <div v-else class="panier-list">
        <div v-for="(item, index) in panier" :key="item.platId" class="plat-card">
          <img v-if="item.image_url" :src="`http://127.0.0.1:8000/storage/${item.image_url}`" width="150"/>
          <h3>{{ item.nom }}</h3>
          <p>Prix : {{ item.prix }} € x {{ item.quantite }} = {{ (item.prix*item.quantite).toFixed(2) }} €</p>
  
          <div class="actions">
            <button @click="decrementer(index)" :disabled="item.quantite <= 1">-</button>
            <span>{{ item.quantite }}</span>
            <button @click="incrementer(index)">+</button>
            <button @click="supprimer(index)" class="delete-btn">Supprimer</button>
          </div>
        </div>
      </div>
  
      <p class="total">Total : {{ total }} €</p>
  
      <!-- Bouton pour aller à la page Commande -->
      <button
        v-if="panier.length"
        class="btn-valider"
        @click="allerCommande"
      >
        Valider la commande
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import Navbar from '@/components/Frontoffice/NavbarFront.vue'
  
  const router = useRouter()
  const panier = ref([])
  
  // Charger le panier depuis le localStorage
  onMounted(() => {
    panier.value = JSON.parse(localStorage.getItem('panier') || '[]')
  })
  
  // Sauvegarder le panier
  const sauvegarderPanier = () => {
    localStorage.setItem('panier', JSON.stringify(panier.value))
  }
  
  // Incrémenter, décrémenter et supprimer des plats
  const incrementer = index => {
    panier.value[index].quantite++
    sauvegarderPanier()
  }
  
  const decrementer = index => {
    if(panier.value[index].quantite > 1){
      panier.value[index].quantite--
      sauvegarderPanier()
    }
  }
  
  const supprimer = index => {
    panier.value.splice(index, 1)
    sauvegarderPanier()
  }
  
  // Total du panier
  const total = computed(() => panier.value.reduce((sum, item) => sum + item.prix * item.quantite, 0).toFixed(2))
  
  // Navigation vers Commande.vue
  const allerCommande = () => {
    if(panier.value.length === 0) {
      alert('Le panier est vide !')
      return
    }
    // ✅ Chemin exact défini dans index.js
    router.push('/client/commande')
  }
  </script>
  
  <style scoped>
  h2 { text-align:center; margin:20px 0 }
  .panier-list { display:flex; flex-wrap:wrap; gap:20px; justify-content:center }
  .plat-card { border:1px solid #ccc; padding:10px; width:250px; border-radius:5px; text-align:center }
  .actions { margin-top:10px; display:flex; justify-content:center; gap:5px }
  button { padding:4px 8px; cursor:pointer }
  .delete-btn { background:red; color:white; border:none; border-radius:3px }
  .total { text-align:right; margin:20px 5%; font-weight:bold }
  .btn-valider { display:block; margin:20px auto; padding:10px 20px; background:#007bff; color:white; border:none; border-radius:5px; cursor:pointer }
  .btn-valider:hover { background:#0056b3 }
  .empty { text-align:center; font-weight:bold; margin-top:20px }
  </style>
  