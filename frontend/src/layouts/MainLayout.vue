<template>
  <div class="layout">
    <AppHeader @toggle="sidebarVisible = true" />
    <AppSidebar v-model:visible="sidebarVisible" />

    <main
      class="page-content"
      :class="{ 'center-content': isCenter }"
    >
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const sidebarVisible = ref(false)
const route = useRoute()

const isCenter = computed(() => route.meta.centerContent === true)
</script>


<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* space for fixed header */
.page-content {
  flex: 1;
  margin-top: 55px;
  padding: 20px;
}

/* 👇 LOGIN PAGE CENTERING (IMAGE MATCH) */
.center-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-screen {
  height: 100vh;
  width: 100vw;
  background: #f5f7fa;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
