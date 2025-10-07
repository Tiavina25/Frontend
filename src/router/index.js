import { createRouter, createWebHistory } from 'vue-router'

// Backoffice
import Login from '../views/Backoffice/Admin/Login.vue'
import Categorie from '../views/Backoffice/Admin/Categorie.vue'
import MenuAdmin from '../views/Backoffice/Admin/Menu.vue'
import Plat from '../views/Backoffice/Admin/Plat.vue'
import TableAdmin from '../views/Backoffice/Admin/Table.vue'
import Accueil from '@/views/Accueil.vue'
import Notifications from '../views/Backoffice/Employe/Notifications.vue'
import CommandeDetails from '../views/Backoffice/Employe/CommandeDetails.vue' // page détails commande
import HistoriqueVentes from '../views/Backoffice/Admin/HistoriqueVentes.vue'

// Frontoffice
import TablesClient from '../views/Frontoffice/Client/Tables.vue'
import MenuClient from '../views/Frontoffice/Client/Menu.vue'
import PanierClient from '../views/Frontoffice/Client/Panier.vue'
import CommandeClient from '../views/Frontoffice/Client/Commande.vue'

const routes = [
  { path: '/', component: Accueil },

  // Routes Backoffice
  { path: '/admin/login', component: Login },
  { path: '/admin/categorie', component: Categorie },
  { path: '/admin/menu', component: MenuAdmin },
  { path: '/admin/plat', component: Plat },
  { path: '/admin/plat/:id', component: Plat, props: true },          // pour ID simple
  { path: '/admin/plat/:id/edit', component: Plat, props: true },     // <-- pour modification
  { path: '/admin/table', component: TableAdmin },                    
  { path: '/employe/notifications', component: Notifications },  
  { path: '/employe/commande/:id', component: CommandeDetails, props: true }, // route dynamique détails commande
  { path: '/admin/historiqueVentes', component: HistoriqueVentes },
  
  // Routes Frontoffice
  { path: '/client/tables', component: TablesClient },
  { path: '/client/menu', component: MenuClient },
  { path: '/client/panier', component: PanierClient },
  { path: '/client/commande', component: CommandeClient },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
