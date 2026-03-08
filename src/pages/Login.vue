<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <i class="pi pi-bolt"></i>
          <h1>Serina</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <InputText
              id="username"
              v-model="username"
              placeholder="Ingresa tu usuario"
              :class="{ 'p-invalid': validationError }"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <Password
              id="password"
              v-model="password"
              placeholder="Ingresa tu contraseña"
              :feedback="false"
              toggleMask
              :class="{ 'p-invalid': validationError }"
              class="w-full"
              inputClass="w-full"
            />
          </div>

          <div v-if="error" class="error-message">
            <i class="pi pi-exclamation-circle"></i>
            {{ error }}
          </div>

          <Button
            type="submit"
            label="Iniciar Sesión"
            :loading="loading"
            class="w-full mt-3"
            icon="pi pi-sign-in"
          />
        </form>

        <div class="login-footer">
          <span>¿No tienes cuenta?</span>
          <router-link to="/register" class="register-link">
            Regístrate aquí
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const validationError = ref(false)

const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

async function handleLogin() {
  validationError.value = false

  if (!username.value || !password.value) {
    validationError.value = true
    return
  }

  const result = await authStore.login(username.value, password.value)
  
  if (result.success) {
    router.push('/')
  } else {
    validationError.value = true
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2f 0%, #2d2d44 100%);
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header i {
  font-size: 48px;
  color: #6366f1;
  margin-bottom: 16px;
}

.login-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e1e2f;
}

.login-header p {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.register-link {
  color: #6366f1;
  font-weight: 500;
  margin-left: 4px;
  text-decoration: none;
  transition: color 0.2s;
}

.register-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
}

:deep(.p-invalid) {
  border-color: #dc2626 !important;
}
</style>

