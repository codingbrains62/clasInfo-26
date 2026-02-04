<template>
  <Sidebar v-model:visible="modelValue" class="sidebar" :style="{ top: '55px' }" :showCloseIcon="false">
     <template #header></template>
    <h4 class="sidebar-heading">What would you like to do?</h4>

    <ul class="menu">
      <li v-for="item in menu" :key="item.label" @click="handleClick(item)">
        <i :class="item.icon"></i> {{ item.label }}
      </li>
    </ul>
     <!-- CONTACT US SECTION -->
    <div v-if="showContact" class="contact-section">
      <div class="contactInfo">
        <label> Contact us for assistance<br />
          <strong>(800) 952-5696</strong><br />
          <a href="mailto:connect@clasinfo.com" class="contact-email"> connect@clasinfo.com </a>
        </label>
      </div>

      <img
        src="@/assets/images/CLASWW.png"
        class="logoImage"
        alt="CLASInfo"
      />
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from 'primevue/sidebar'

const props = defineProps({
  visible: Boolean
})
const showContact = ref(false)
const emit = defineEmits(['update:visible'])

const modelValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const menu = [
  { label: 'Access Dashboard', icon: 'pi pi-home' },
  { label: 'Place an Order', icon: 'pi pi-shopping-cart' },
  { label: 'Access CLAS Infobox', icon: 'pi pi-inbox' },
  { label: 'UCC Search', icon: 'pi pi-search' },
  { label: 'UCCeZFILE PRO', icon: 'pi pi-folder' },
  { label: 'EntityTrak', icon: 'pi pi-sitemap' },
  { label: 'Pay Invoice', icon: 'pi pi-credit-card' },
  { label: 'Contact Us', icon: 'pi pi-comment', action: 'contact'}
]
const handleClick = (item) => {
  if (item.action === 'contact') {
    showContact.value = !showContact.value
    return
  }

  if (item.route) {
    router.push(item.route)
    modelValue.value = false
  }
}
</script>
<style>
.p-sidebar-header {
  display: none !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}
.p-sidebar-content {
  padding-top: 0 !important;
}
.sidebar-heading {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  color:rgb(0,62, 119)
}
.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
}
.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menu li {
  padding: 10px 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-radius: 6px;
}
.menu li:hover {
  background: #f1f5f9;
}
.menu li i {
  color: #1f7fd1;
  font-size: 15px;
}
.contact-section {
  margin-top: 2px;
  padding: 10px;
  border-top: 1px solid #e5e7eb;
  text-align: left;
}
.contactInfo {
  font-size: 13px;
  line-height: 1.6;
}
.contact-email {
  color: #0d6efd;
  text-decoration: none;
}
.logoImage {
  margin-top: 12px;
  width: 140px;
}
</style>