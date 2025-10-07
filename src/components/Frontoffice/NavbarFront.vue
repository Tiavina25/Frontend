<template>
    <nav>
      <ul>
        <li><router-link to="/client/menu">Menu</router-link></li>
        <li><router-link to="/client/tables">Tables</router-link></li>
        <li><router-link to="/client/commande">Commande</router-link></li>
      </ul>
    </nav>
  </template>
  
  <script setup></script>
  
  <style scoped>
  nav {
    background: #2c3e50;
    padding: 10px;
  }
  ul {
    display: flex;
    list-style: none;
    gap: 15px;
  }
  li a {
    color: white;
    text-decoration: none;
  }
  li a:hover {
    text-decoration: underline;
  }
  </style>
  