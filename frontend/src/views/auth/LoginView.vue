<template>
  <Card class="login-card">
    <template #title>LOGIN TO CLASINFO PRO</template>

    <template #content>
      <InputText
        placeholder="Username"
        class="full-width mb-3"
        v-model="email"
      />

      <Password
        placeholder="Password"
        toggleMask
        :feedback="false"
        class="full-width mb-3"
        inputClass="full-width"
        v-model="password"
      />

      <div class="remember">
        <Checkbox v-model="toggle" binary @change="rememberMe" />
        <label>Remember Me</label>
      </div>

      <Button
        label="Sign In"
        class="login-btn"
        :loading="isFetching"
        :disabled="btnDisable"
        @click="login"
      />

      <div class="forgot">Forgot password?</div>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFetch, useStorage } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'

// PrimeVue components
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

// Toast
const toast = useToast()

// Form fields
const email = ref('')
const password = ref('')
const toggle = ref(false)

// Remember Me (VueUse storage)
const rememberedEmail = useStorage('remember_email', '')
const rememberedPassword = useStorage('remember_password', '')

// Security alert
const securityAlert = useStorage('securityalert', 0)
const btnDisable = computed(() => securityAlert.value > 7)

// Restore remembered values
onMounted(() => {
  if (rememberedEmail.value && rememberedPassword.value) {
    email.value = rememberedEmail.value
    password.value = rememberedPassword.value
    toggle.value = true
  }
})

// Remember Me handler
const rememberMe = () => {
  if (toggle.value) {
    rememberedEmail.value = email.value
    rememberedPassword.value = password.value
  } else {
    rememberedEmail.value = ''
    rememberedPassword.value = ''
  }
}

// Reset security
const resetSecurity = () => {
  securityAlert.value = 0
}

// Login
const login = async () => {
  if (btnDisable.value) return

  const { data, error, isFetching } = await useFetch(
    'http://localhost:1337/api/v1/login'
  )
    .post({
      email: email.value,
      password: password.value
    })
    .json()

  if (error.value) {
    toast.add({
      severity: 'error',
      summary: 'Server Error',
      detail: 'Unable to connect to server',
      life: 3000
    })
    return
  }

  const res = data.value?.record

  if (res?.status_code === 200) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('username', res.data.username)
        localStorage.setItem('fullName', res.data.fullName || '')
        localStorage.setItem('emailAddress', res.data.emailAddress || '')
        localStorage.setItem('celPhone', res.data.celPhone || '')
        localStorage.setItem('userid', res.data.id)

    resetSecurity()
    window.location.href = '/dashboard'
  } else {
    securityAlert.value++

    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: res?.message || 'Invalid credentials',
      life: 3000
    })

    if (securityAlert.value > 7) {
      toast.add({
        severity: 'warn',
        summary: 'Account Locked',
        detail: 'Account disabled for 12 minutes',
        life: 4000
      })

      setTimeout(resetSecurity, 12 * 60 * 1000)
    }
  }
}
</script>

<style scoped>
.login-card {
  width: 360px;
}

.full-width {
  width: 100%;
}

.mb-3 {
  margin-bottom: 12px;
}

.login-card :deep(.p-inputtext),
.login-card :deep(.p-password-input) {
  width: 100%;
}

.login-card :deep(.p-card-title) {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.login-btn {
  width: 100%;
  background: #1f7fd1;
  border: none;
  margin-top: 15px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
}

.forgot {
  text-align: center;
  margin-top: 10px;
  color: #1f7fd1;
  cursor: pointer;
}
</style>
