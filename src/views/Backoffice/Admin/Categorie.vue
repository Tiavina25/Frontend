<template>
  <div class="container">
    <!-- HEADER avec bouton retour rond + titre centré -->
    <div class="title-row">
      <button type="button" class="back-circle" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h2 class="form-title">{{ editId ? 'Modifier une Catégorie' : 'Ajouter une Catégorie' }}</h2>
    </div>

    <!-- FORMULAIRE -->
    <form @submit.prevent="saveCategorie">
      <input v-model="nom" placeholder="Nom de la catégorie" required />
      <button type="submit">{{ editId ? 'Modifier' : 'Ajouter' }}</button>
    </form>

    <p class="message">{{ message }}</p>

    <!-- LISTE DES CATEGORIES -->
    <ul class="categorie-list">
      <li v-for="cat in categories" :key="cat.id" class="categorie-item">
        <span>{{ cat.nom }}</span>
        <div class="actions">
          <!-- Modifier -->
          <button class="icon-btn" @click="editCategorie(cat)" title="Modifier">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          </button>

          <!-- Supprimer -->
          <button class="icon-btn" @click="deleteCategorie(cat.id)" title="Supprimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6m5 0V4h4v2"/>
            </svg>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const nom = ref('')
const message = ref('')
const categories = ref([])
const editId = ref(null)

const loadCategories = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/admin/categories')
    categories.value = res.data
  } catch (err) {
    message.value = err.response?.data?.message || 'Erreur lors du chargement des catégories'
  }
}

const saveCategorie = async () => {
  try {
    if (editId.value) {
      await axios.put(`http://127.0.0.1:8000/api/admin/categories/${editId.value}`, { nom: nom.value })
      message.value = 'Catégorie modifiée avec succès'
    } else {
      await axios.post('http://127.0.0.1:8000/api/admin/categories', { nom: nom.value })
      message.value = 'Catégorie ajoutée avec succès'
    }
    nom.value = ''
    editId.value = null
    loadCategories()
  } catch (err) {
    message.value = err.response?.data?.message || 'Erreur'
  }
}

const editCategorie = (cat) => { nom.value = cat.nom; editId.value = cat.id }

const deleteCategorie = async (id) => {
  if (!confirm('Supprimer cette catégorie ?')) return
  try { 
    await axios.delete(`http://127.0.0.1:8000/api/admin/categories/${id}`)
    message.value = 'Catégorie supprimée avec succès'
    loadCategories()
  } catch (err) { 
    message.value = err.response?.data?.message || 'Erreur' 
  }
}

const goBack = () => { router.push('/admin/menu') }

onMounted(() => { loadCategories() })
</script>

<style scoped>
/* Ton CSS existant pour categorie */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.container { display:flex; flex-direction:column; align-items:center; margin-top:40px; font-family:'Poppins', sans-serif; }
.title-row { display:flex; align-items:center; justify-content:center; position:relative; width:100%; max-width:500px; margin-bottom:25px; }
.back-circle { position:absolute; left:0; background:linear-gradient(135deg,#F1BA0A,#e6a900); border:none; border-radius:50%; width:46px; height:46px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.2); transition:all 0.3s ease; }
.back-circle svg { stroke:#fff; }
.back-circle:hover { transform:translateY(-2px) scale(1.1); box-shadow:0 8px 20px rgba(0,0,0,0.3); }
.form-title { font-size:1.8rem; font-weight:700; color:#1e2a38; text-align:center; }
form { background:#fff; border-radius:20px; padding:30px 25px; width:100%; max-width:500px; box-shadow:0 15px 35px rgba(0,0,0,0.08); display:flex; flex-direction:column; transition:transform 0.3s ease; }
form:hover { transform:translateY(-3px); }
input { width:90%; padding:14px 16px; border:none; border-radius:12px; margin-bottom:16px; background-color:#f5f5f5; font-size:0.95rem; outline:none; transition:all 0.3s ease; }
input:focus { background-color:#fff; box-shadow:0 0 12px rgba(241,186,10,0.3); }
button[type="submit"] { width:100%; padding:14px; border:none; border-radius:14px; font-weight:700; font-size:1rem; cursor:pointer; color:#fff; background:linear-gradient(90deg,#F1BA0A,#F1BA0A); transition:all 0.3s ease; margin-top:8px; }
button[type="submit"]:hover { background:linear-gradient(90deg,#e6a900,#d69900); transform:translateY(-2px) scale(1.02); }
.message { margin-top:15px; color:#96d88b; font-weight:500; text-align:center; }
.categorie-list { list-style:none; padding:0; margin-top:30px; width:100%; max-width:500px; }
.categorie-item { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-radius:12px; background:#fff; box-shadow:0 3px 10px rgba(0,0,0,0.06); margin-bottom:12px; transition:transform 0.2s, box-shadow 0.2s; }
.categorie-item:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,0.1); }
.actions { display:flex; gap:8px; }
.icon-btn { background:none; border:none; cursor:pointer; padding:6px; border-radius:8px; transition:background 0.2s ease, transform 0.2s ease; }
.icon-btn:hover { background:#f8d6d6; transform:translateY(-2px); color:#a30000; }
.icon-svg { width:20px; height:20px; stroke:#727272; stroke-linecap:round; stroke-linejoin:round; }
@media (max-width:480px) { form { padding:25px 20px; } .form-title { font-size:1.5rem; } .categorie-item { flex-direction:column; align-items:flex-start; } .actions { margin-top:10px; } }
</style>
