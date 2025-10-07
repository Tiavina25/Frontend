<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import logo from '@/assets/Logo RestoFlow.png'

const router = useRouter()

const email = ref('')
const password = ref('')
const message = ref('')

const login = async () => {
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/admin/login', {
      email: email.value,
      password: password.value
    })
    message.value = res.data.message
    router.push('/admin/menu')
  } catch (err) {
    message.value = err.response?.data?.message || 'Erreur'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo">
        <img :src="logo" alt="Logo" />
      </div>

      <h2 class="title">Connexion Admin</h2>
      <p class="subtitle">Connectez-vous à votre espace</p>

      <form @submit.prevent="login" class="login-form">
        <input v-model="email" type="email" placeholder="Adresse email" required />
        <input v-model="password" type="password" placeholder="Mot de passe" required />
        <button type="submit" class="btn-login">Se connecter</button>
      </form>

      <a href="#" class="forgot-password">Mot de passe oublié ?</a>
      <p class="message">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
/* --- CONTAINER --- */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* --- CARD --- */
.login-card {
  background: #fff;
  border-radius: 20px;
  padding: 50px 35px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-3px);
}

/* --- LOGO --- */
.logo img {
  width: 80px;
  margin-bottom: 20px;
}

/* --- TITRES --- */
.title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #1e2a38;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 30px;
}

/* --- FORM --- */
/* --- FORM --- */
.login-form input {
  width: 90%;
  padding: 14px 16px;
  border: none; /* plus de bordure */
  border-radius: 12px;
  margin-bottom: 16px;
  outline: none;
  font-size: 0.9rem;
  background-color: #f5f5f5; /* Gris clair */
  transition: all 0.3s ease;
}

.login-form input:focus {
  box-shadow: 0 0 12px rgba(241, 186, 10, 0.3); /* légère mise en évidence au focus */
  background-color: #fff; /* blanc au focus pour meilleure lisibilité */
}



/* --- BUTTON --- */
.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #F1BA0A, #F1BA0A);
  color: #fff;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-login:hover {
  background: linear-gradient(90deg, #F1BA0A, #F1BA0A);
  transform: translateY(-2px) scale(1.02);
}

/* --- LIEN --- */
.forgot-password {
  display: inline-block;
  margin-top: 18px;
  font-size: 0.9rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #1e2a38;
  text-decoration: underline;
}

/* --- MESSAGE --- */
.message {
  margin-top: 14px;
  color: red;
  font-size: 0.9rem;
  font-weight: 500;
}

/* --- ANIMATION --- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- RESPONSIVE --- */
@media (max-width: 480px) {
  .login-card {
    padding: 35px 22px;
  }
  .title {
    font-size: 1.4rem;
  }
  .logo img {
    width: 65px;
  }
}
</style>
