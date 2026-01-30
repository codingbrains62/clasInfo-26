<template>
  <div class="login_form">
    <div class="innerwrp">
      <h1 class="heading">Login to CLASINFO PRO</h1>

      <div class="error" v-if="error">{{ message }}</div>

      <form @submit.prevent="login">

        <div class="form-group">
          <InputText
            v-model="email"
            placeholder="Username"
            autocomplete="off"
            class="form-control"
            :disabled="btnDisable"
          />
        </div>

        <div class="form-group">
          <Password
            v-model="password"
            placeholder="Password"
            toggleMask="false"
            class="form-control"
            :disabled="btnDisable"
          />
        </div>

        <div class="form-group">
          <div class="custom-control custom-checkbox custom-control-inline">
            <Checkbox v-model="remember" binary />
            <label class="ml-2">Remember Me</label>
          </div>
        </div>

        <Button
          type="submit"
          label="Sign In"
          class="loginbtn"
          :disabled="btnDisable"
        />

      </form>

      <a href="/forgotpassword" class="forgetbtn">Forgot password?</a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'

const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)

const error = ref(false)
const message = ref('')
const securityalert = ref(Number(localStorage.getItem('securityalert') || 0))

const btnDisable = computed(() => securityalert.value > 7)

async function login() {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })

  const data = await res.json()

  if (data.record.status_code === 200) {
    localStorage.setItem('token', data.record.token)
    localStorage.setItem('username', data.record.data.username)
    localStorage.setItem('securityalert', 0)
    router.push('/dashboard')
  } else {
    securityalert.value++
    localStorage.setItem('securityalert', securityalert.value)
    error.value = true
    message.value = data.record.message
  }
}
</script>
