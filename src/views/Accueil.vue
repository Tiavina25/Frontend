<!-- Accueil.vue -->
<template>
    <div class="container">
      <h1>Bienvenue</h1>
      <div class="buttons">
        <button @click="goToClient">Client</button>
        <button @click="goToAdmin">Admin</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  function goToClient() {
    router.push('/client/tables') // Redirection vers la route client
  }
  
  function goToAdmin() {
    router.push('/admin/login') // Redirection vers la route admin
  }
  </script>
  
  <style scoped>
  .container {
    text-align: center;
    margin-top: 50px;
  }
  .buttons {
    margin-top: 20px;
  }
  button {
    margin: 10px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  