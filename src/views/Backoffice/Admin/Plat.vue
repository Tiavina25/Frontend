<template>
  <div class="container">
   <!-- Notification wrapper -->
<div class="notification-wrapper">
  <transition-group name="slide-right" tag="div">
    <div
      v-for="(notif, index) in notifications"
      :key="index"
      class="toast"
      :class="notif.type"
    >
      <span class="icon">
        <svg v-if="notif.type === 'success'" class="icon-svg success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M9 16.17l-3.88-3.88L4 14.41 9 19.41 20 8.41 18.59 7l-9.59 9.17z"/>
        </svg>
        <svg v-else-if="notif.type === 'error'" class="icon-svg error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
                   10-4.48 10-10S17.52 2 12 2zm1 
                   15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <svg v-else class="icon-svg info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
        </svg>
      </span>
      <span class="message">{{ notif.message }}</span>
      <button class="close-btn" @click="removeNotification(index)">×</button>
    </div>
  </transition-group>
</div>


    <!-- HEADER -->
    <div class="title-row">
      <button type="button" class="back-circle" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
             fill="none" stroke="currentColor" stroke-width="3"
             stroke-linecap="round" stroke-linejoin="round"
             viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h2 class="form-title">{{ editMode ? 'Modifier un Plat' : 'Ajouter un Plat' }}</h2>
    </div>

    <!-- FORMULAIRE -->
    <form @submit.prevent="submitPlat" enctype="multipart/form-data">
      <select v-model="categorie_id" required>
        <option disabled value="">Choisir une catégorie</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.nom }}
        </option>
      </select>

      <input type="text" v-model="nom" placeholder="Nom plat" required />
      <textarea v-model="description" placeholder="Description"></textarea>
      <input type="number" v-model="prix" placeholder="Prix" required />
      <input type="file" @change="handleImageUpload" />

      <button type="submit">{{ editMode ? 'Mettre à jour' : 'Ajouter' }}</button>
      <button v-if="editMode" type="button" @click="cancelEdit" class="cancel-btn">Annuler</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// Notifications
const notifications = ref([])

const showNotification = (message, type = 'success') => {
  notifications.value.push({ message, type })
  setTimeout(() => notifications.value.shift(), 4000)
}
const removeNotification = (index) => {
  notifications.value.splice(index, 1)
}

// Formulaire
const categorie_id = ref('')
const nom = ref('')
const description = ref('')
const prix = ref('')
const imageFile = ref(null)
const editMode = ref(false)
const editId = ref(null)
const categories = ref([])
const plats = ref([])

onMounted(async () => {
  await loadCategories()
  await loadPlats()
  const platId = route.params.id
  if (platId) {
    editMode.value = true
    editId.value = platId
    await loadPlat(platId)
  }
})

const loadCategories = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/admin/categories')
    categories.value = res.data
  } catch (err) { console.error(err) }
}

const loadPlats = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/admin/plats')
    plats.value = res.data
  } catch(err) { console.error(err) }
}

const loadPlat = async (id) => {
  try {
    const res = await axios.get(`http://127.0.0.1:8000/api/admin/plats/${id}`)
    const plat = res.data
    categorie_id.value = plat.categorie_id
    nom.value = plat.nom
    description.value = plat.description
    prix.value = plat.prix
  } catch(err) { console.error(err) }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if(file.size > 5*1024*1024) {
    showNotification('Image trop grande ! max 5 Mo.', 'error')
    return
  }
  imageFile.value = file
}

const submitPlat = async () => {
  const formData = new FormData()
  formData.append('categorie_id', categorie_id.value)
  formData.append('nom', nom.value)
  formData.append('description', description.value)
  formData.append('prix', prix.value)
  if(imageFile.value) formData.append('image', imageFile.value)

  try {
    if(editMode.value) {
      await axios.post(
        `http://127.0.0.1:8000/api/admin/plats/${editId.value}?_method=PUT`,
        formData, { headers: { 'Content-Type':'multipart/form-data' } }
      )
      showNotification('Plat mis à jour avec succès !', 'success')
    } else {
      await axios.post(
        'http://127.0.0.1:8000/api/admin/plats',
        formData, { headers: { 'Content-Type':'multipart/form-data' } }
      )
      showNotification('Plat ajouté avec succès !', 'success')
    }
    cancelEdit()
    await loadPlats()
  } catch(err) {
    console.error(err.response?.data || err)
    showNotification('Erreur : '+(err.response?.data?.message || 'Échec de la requête'), 'error')
  }
}

const cancelEdit = () => {
  editMode.value = false
  editId.value = null
  categorie_id.value = ''
  nom.value = ''
  description.value = ''
  prix.value = ''
  imageFile.value = null
}

const goBack = () => { router.push('/admin/menu') }
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.container { display:flex; flex-direction:column; align-items:center; margin-top:40px; font-family:'Poppins', sans-serif }
.title-row { display:flex; align-items:center; justify-content:center; gap:15px; margin-bottom:25px; position:relative; width:100%; max-width:500px }
.back-circle { position:absolute; left:0; background: linear-gradient(135deg, #F1BA0A, #F1BA0A); border:none; border-radius:50%; width:46px; height:46px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.2); transition: all 0.3s ease; }
.back-circle svg { stroke:#fff; }
.back-circle:hover { transform:translateY(-2px) scale(1.1); box-shadow:0 8px 20px rgba(0,0,0,0.3); }
.form-title { font-size:2rem; font-weight:700; color:#372B2B; text-align:center; flex:1 }
form { background:#fff; border-radius:20px; padding:40px 30px; width:100%; max-width:500px; box-shadow:0 15px 35px rgba(0,0,0,0.08); transition: transform 0.3s ease }
form:hover { transform:translateY(-3px) }
input, select, textarea { width:90%; padding:14px 16px; border:none; border-radius:12px; margin-bottom:16px; background-color:#f5f5f5; font-size:0.95rem; outline:none; transition: all 0.3s ease; font-family:'Poppins', sans-serif }
input:focus, select:focus, textarea:focus { background-color:#fff; box-shadow:0 0 12px rgba(241,186,10,0.3) }
textarea { min-height:100px; resize:vertical }
button { width:100%; padding:14px; border:none; border-radius:14px; font-weight:700; font-size:1rem; cursor:pointer; color:#fff; background: linear-gradient(90deg, #F1BA0A, #F1BA0A); transition: all 0.3s ease; margin-top:8px; font-family:'Poppins', sans-serif }
button:hover { background: linear-gradient(90deg, #F1BA0A, #F1BA0A); transform:translateY(-2px) scale(1.02) }
.cancel-btn { background:#2c3e50 !important }
.cancel-btn:hover { background:#34495e !important }
input[type="file"] { padding:6px 10px; background-color:#f5f5f5 }

/* LISTE DES PLATS */
.plats-list { list-style:none; padding:0; margin-top:20px; width:100%; max-width:500px; display:flex; flex-direction:column; gap:12px; }
.plat-item { display:flex; justify-content:space-between; align-items:center; background:#fff; border-radius:12px; padding:12px 16px; box-shadow:0 3px 10px rgba(0,0,0,0.06); }
.plat-info { display:flex; align-items:center; gap:12px; }
.plat-img { width:50px; height:50px; border-radius:8px; object-fit:cover; }
.plat-text p { margin:0; font-size:0.9rem; color:#555; }
.plat-actions button { margin-left:6px; padding:6px 10px; border-radius:6px; border:none; cursor:pointer; background:#A70B0B; color:#fff; transition:0.2s }
.plat-actions button:hover { background:#e53935; }

.notification-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
}

/* Toast style */
.toast {
  background: #fff;
  border-radius: 10px;
  padding: 14px 18px;
  min-width: 280px;
  max-width: 320px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.15);
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2c3e50;
  border-left: 5px solid;
  animation: fadeIn 0.3s ease;
}

/* Types */
.toast.success { border-color: #27ae60; }
.toast.error   { border-color: #c0392b; }
.toast.info    { border-color: #2980b9; }

/* Icones */
.icon-svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}
.success-icon { fill: #27ae60; }
.error-icon   { fill: #c0392b; }
.info-icon    { fill: #2980b9; }

/* Close button */
.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 1.2rem;
  cursor: pointer;
}
.close-btn:hover { color: #2c3e50; }

/* Animations */
.slide-right-enter-active {
  animation: slideInRight 0.4s ease-out;
}
.slide-right-leave-active {
  animation: slideOutRight 0.4s ease forwards;
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideOutRight {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(100%); }
}
</style>
