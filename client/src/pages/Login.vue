<template>
  <div class="auth-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="effect effect-1"></div>
      <div class="effect effect-2"></div>
      <div class="effect effect-3"></div>
    </div>

    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo Section -->
        <div class="auth-logo">
          <div class="logo-icon">
            <i class="pi pi-bolt"></i>
          </div>
          <h1>Serina</h1>
          <p class="subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="username">
              <i class="pi pi-user"></i>
              Usuario
            </label>
            <InputText
              id="username"
              v-model="username"
              placeholder="Ingresa tu usuario"
              :class="{ 'p-invalid': validationError }"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <i class="pi pi-lock"></i>
              Contraseña
            </label>
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
            class="w-full mt-3 auth-btn"
            icon="pi pi-sign-in"
          />
        </form>

        <!-- Footer -->
        <div class="auth-footer">
          <span>¿No tienes cuenta?</span>
          <router-link to="/register" class="auth-link">
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
import { useAuthStore } from '@/store/authStore'
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
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

/* Background Effects */
.bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.effect {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
}

.effect-1 {
  width: 500px;
  height: 500px;
  background: var(--neon-violet);
  top: -150px;
  left: -150px;
  animation: float 15s ease-in-out infinite;
}

.effect-2 {
  width: 400px;
  height: 400px;
  background: var(--neon-cyan);
  bottom: -100px;
  right: -100px;
  animation: float 18s ease-in-out infinite reverse;
}

.effect-3 {
  width: 300px;
  height: 300px;
  background: var(--neon-magenta);
  top: 40%;
  left: 60%;
  animation: pulse 10s ease-in-out infinite;
}

.effect-4 {
  width: 250px;
  height: 250px;
  background: var(--neon-green);
  bottom: 30%;
  left: 10%;
  animation: float 12s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { 
    transform: translate(0, 0) rotate(0deg); 
  }
  25% { 
    transform: translate(30px, 50px) rotate(5deg); 
  }
  50% { 
    transform: translate(60px, 20px) rotate(10deg); 
  }
  75% { 
    transform: translate(20px, 40px) rotate(5deg); 
  }
}

@keyframes pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1); 
    opacity: 0.3; 
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.5); 
    opacity: 0.5; 
  }
}

/* Card entrance animation */
.auth-card {
  animation: cardEntrance 0.6s ease-out;
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-container {
  width: 100%;
  max-width: 440px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-lg), 0 0 40px rgba(139, 92, 246, 0.1);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--neon-violet), var(--neon-cyan), var(--neon-magenta));
}

/* Logo Section */
.auth-logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, var(--neon-violet), var(--neon-magenta));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.3);
}

.logo-icon i {
  font-size: 36px;
  color: white;
}

.auth-logo h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-violet), var(--neon-magenta));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-logo .subtitle {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
}

/* Form Styles */
.auth-form {
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
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group label i {
  color: var(--color-primary);
  font-size: 14px;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--radius-sm);
  color: var(--color-danger);
  font-size: 14px;
}

.error-message i {
  font-size: 16px;
}

/* Auth Button */
.auth-btn {
  background: linear-gradient(135deg, var(--neon-violet), var(--neon-magenta)) !important;
  border: none !important;
  padding: 14px 24px !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  border-radius: var(--radius-sm) !important;
  transition: all 0.3s !important;
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
}

/* Footer */
.auth-footer {
  margin-top: 28px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.auth-link {
  color: var(--color-primary);
  font-weight: 600;
  margin-left: 6px;
  text-decoration: none;
  transition: all 0.2s;
}

.auth-link:hover {
  color: var(--neon-magenta);
  text-shadow: 0 0 10px var(--neon-magenta-glow);
}

/* PrimeVue Overrides */
:deep(.p-inputtext),
:deep(.p-password-input) {
  width: 100%;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  color: var(--text-primary);
  transition: all 0.3s;
}

:deep(.p-inputtext:focus),
:deep(.p-password-input:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

:deep(.p-inputtext::placeholder),
:deep(.p-password-input::placeholder) {
  color: var(--text-muted);
}

:deep(.p-invalid) {
  border-color: var(--color-danger) !important;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}
</style>

