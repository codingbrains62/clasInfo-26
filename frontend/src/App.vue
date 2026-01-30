<template>
  <Toast />

  <Appnavbar :username="username" />
  <router-view />
</template>

<script setup>
import Appnavbar from '@/components/layout/AppNavbar.vue'
import Toast from 'primevue/toast'

const username = localStorage.getItem('username') || 'Guest'
</script>
