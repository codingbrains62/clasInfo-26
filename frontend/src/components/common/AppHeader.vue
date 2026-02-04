<template>
  <div class="header">
    <!-- LEFT DARK STRIP (SAME AS SIDEBAR WIDTH) -->
    <div class="header-left-strip"></div>
        <!-- CONTENT -->
        <div class="header-content">
        <!-- LEFT -->
            <div class="left">
                <i class="pi pi-bars menu" @click="$emit('toggle')" />
                <span class="title">CLASInfo PRO</span>
            </div>

            <!-- RIGHT PROFILE -->
            <div class="right" v-if="isLoggedIn">
            <Menu ref="menu" :model="profileItems" popup />
                <Button class="profile-btn" text @click="toggleMenu" >
                <i class="pi pi-user"></i>
                {{ username }}
                <i class="pi pi-chevron-down"></i>
            </Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'

// PrimeVue
import Button from 'primevue/button'
import Menu from 'primevue/menu'


// Router
const router = useRouter()

// Login data (from login page)
const token = useStorage('token', '')
const username = useStorage('username', '')
const fullname = useStorage('fullName', '')
const email = useStorage('emailAddress', '')
const phone = useStorage('celPhone', '')

const isLoggedIn = computed(() => !!token.value)

// Menu ref
const menu = ref()

const toggleMenu = (event) => {
  menu.value.toggle(event)
}

// Sign out
const signOut = () => {
  token.value = ''
  username.value = ''
  fullname.value = ''
  email.value = ''
  phone.value = ''

  router.push('/')
}

// Profile dropdown items
const profileItems = computed(() => [
  {
    label: fullname.value || username.value || 'User',
    items: [
      {
        label: email.value || 'No email available',
        icon: 'pi pi-envelope',
        disabled: true
      },
      { separator: true },
      {
        label: 'My Orders',
        icon: 'pi pi-inbox',
        command: () => router.push('/cipinfobox')
      },
      {
        label: 'My Profile',
        icon: 'pi pi-user',
        command: () => router.push('/Userprofile')
      },
      { separator: true },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: signOut
      }
    ]
  }
])
</script>

<style scoped>
.header {
  height: 55px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  background: #1f7fd1;
}
.header-left-strip {
  position: absolute;
  left: 0;
  top: 0;
  height: 55px;
  width: 320px; /* MUST MATCH SIDEBAR WIDTH */
  background: #003e77; /* darker blue */
}
.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 16px;
  position: relative;
  z-index: 2;
}

.left {
  display: flex;
  align-items: center;
   color: white;
}

.menu {
  font-size: 20px;
  cursor: pointer;
  margin-right: 12px;
}

.title {
  font-weight: 400;
  font-size: 20px;
  color: white;
}

.right {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;               /* ⭐ icons + text ke beech space */
  color: #fff !important;
  padding: 6px 10px;
  border-radius: 6px;
}

.profile-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.username {
  font-weight: 500;
  white-space: nowrap;
}
</style>
