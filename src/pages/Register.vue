<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <i class="pi pi-bolt"></i>
          <h1>Crear Cuenta</h1>
          <p>Regístrate en Serina</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <InputText
              id="username"
              v-model="username"
              placeholder="Elige un nombre de usuario"
              :class="{ 'p-invalid': validationError && !username }"
              class="w-full"
            />
            <small class="form-hint">Mínimo 3 caracteres</small>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <Password
              id="password"
              v-model="password"
              placeholder="Crea una contraseña segura"
              toggleMask
              :class="{ 'p-invalid': validationError && !password }"
              class="w-full"
              inputClass="w-full"
            />
            <small class="form-hint">Mínimo 6 caracteres</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirma tu contraseña"
              :feedback="false"
              toggleMask
              :class="{ 'p-invalid': validationError && password !== confirmPassword }"
              class="w-full"
              inputClass="w-full"
            />
          </div>

          <div v-if="error" class="error-message">
            <i class="pi pi-exclamation-circle"></i>
            {{ error }}
          </div>

          <div v-if="successMessage" class="success-message">
            <i class="pi pi-check-circle"></i>
            {{ successMessage }}
          </div>

          <Button
            type="submit"
            label="Crear Cuenta"
            :loading="loading"
            class="w-full mt-3"
            icon="pi pi-user-plus"
          />
        </form>

        <div class="register-footer">
          <span>¿Ya tienes cuenta?</span>
          <router-link to="/login" class="login-link">
            Inicia sesión aquí
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
const confirmPassword = ref('')
const validationError = ref(false)
const successMessage = ref('')

const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

async function handleRegister() {
  validationError.value = false
  successMessage.value = ''

  // Validaciones
  if (!username.value || !password.value || !confirmPassword.value) {
    validationError.value = true
    return
  }

  if (username.value.length < 3) {
    error.value = 'El usuario debe tener al menos 3 caracteres'
    validationError.value = true
    return
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    validationError.value = true
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    validationError.value = true
    return
  }

  const result = await authStore.register(username.value, password.value)
  
  if (result.success) {
    successMessage.value = '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    validationError.value = true
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2f 0%, #2d2d44 100%);
}

.register-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.register-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header i {
  font-size: 48px;
  color: #6366f1;
  margin-bottom: 16px;
}

.register-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e1e2f;
}

.register-header p {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.register-form {
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

.form-hint {
  color: #9ca3af;
  font-size: 12px;
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

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-size: 14px;
}

.register-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.login-link {
  color: #6366f1;
  font-weight: 500;
  margin-left: 4px;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
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

