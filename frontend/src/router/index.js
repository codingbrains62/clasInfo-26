import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'

import Login from '@/views/auth/LoginView.vue'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    meta: { centerContent: true },
    children: [
      { path: '', component: Login }
    ]
  },
  {
    path: '/dashboard',
    component: MainLayout,
    meta: { centerContent: false },
    children: [
      { path: '', component: Dashboard }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
