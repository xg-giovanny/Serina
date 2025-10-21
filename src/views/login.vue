<template>
    <!-- Contenedor principal con soporte de tema claro/oscuro -->
    <div
        :class="['min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-12', theme === 'dark' ? 'theme-dark bg-slate-950' : 'theme-light bg-white']">
        <!-- Botón de tema: alterna entre claro/oscuro y persiste en localStorage -->
        <button class="absolute top-4 right-4 z-10 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all
                   border border-slate-700/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                   hover:shadow-[0_0_18px_rgba(34,211,238,0.35)]
                   bg-white/10 backdrop-blur
                   text-slate-200
                   "
            :class="theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-black/5 text-slate-700 border-slate-300'"
            type="button" @click="toggleTheme"
            :aria-label="theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'" title="Cambiar tema">
            <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                class="size-5">
                <path
                    d="M12 18a6 6 0 110-12 6 6 0 010 12Zm0-16a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1Zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1ZM3 13a1 1 0 110-2H5a1 1 0 110 2H3Zm16 0a1 1 0 110-2h2a1 1 0 110 2h-2ZM5.64 5.64a1 1 0 011.41 0L8.1 6.69a1 1 0 11-1.41 1.41L5.64 7.05a1 1 0 010-1.41Zm10.26 10.26a1 1 0 011.41 0l1.06 1.06a1 1 0 11-1.41 1.41l-1.06-1.06a1 1 0 010-1.41Zm0-10.26l1.06-1.06a1 1 0 111.41 1.41L17.31 6.69a1 1 0 11-1.41-1.41ZM6.69 17.31a1 1 0 010 1.41L5.64 19.78a1 1 0 11-1.41-1.41l1.06-1.06a1 1 0 011.41 0Z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79Z" />
            </svg>
            <span class="hidden sm:inline">{{ theme === 'dark' ? 'Oscuro' : 'Claro' }}</span>
        </button>
        <!-- Fondo decorativo: blobs de color y grid tenue -->
        <div class="pointer-events-none absolute inset-0">
            <div class="neon-blob bg-cyan-500/40 left-[-12%] top-[-18%]"></div>
            <div class="neon-blob bg-fuchsia-500/35 right-[-18%] bottom-[-20%]"></div>
            <div class="neon-grid"></div>
        </div>

        <!-- Card de login -->
        <div class="relative w-full max-w-md">
            <!-- Tarjeta con efecto vidrio y borde neon -->
            <div class="neon-card rounded-2xl p-8 border">
                <div class="text-center">
                    <h1
                        class="text-3xl font-semibold tracking-wide text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-300 to-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.55)]">
                        Bienvenido
                    </h1>
                    <p :class="['mt-2', theme === 'dark' ? 'text-slate-400' : 'text-slate-600']">Inicia sesión para
                        continuar</p>
                </div>

                <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
                    <div class="space-y-2">
                        <!-- Campo: correo electrónico -->
                        <label for="email"
                            :class="['block text-sm font-medium', theme === 'dark' ? 'text-slate-300' : 'text-slate-700']">Correo
                            electrónico</label>
                        <div class="relative">
                            <input id="email" v-model="email" type="email" autocomplete="email" required
                                placeholder="tu@ejemplo.com" class="input-neon w-full" />
                            <span class="absolute inset-y-0 right-3 inline-flex items-center text-cyan-500/80">
                                @
                            </span>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <!-- Campo: contraseña con botón mostrar/ocultar -->
                        <label for="password"
                            :class="['block text-sm font-medium', theme === 'dark' ? 'text-slate-300' : 'text-slate-700']">Contraseña</label>
                        <div class="relative">
                            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                                autocomplete="current-password" required minlength="6" placeholder="••••••••"
                                class="input-neon w-full pr-12" />
                            <button type="button" @click="showPassword = !showPassword"
                                :class="['absolute inset-y-0 right-2 my-auto h-9 px-3 inline-flex items-center justify-center transition-colors', theme === 'dark' ? 'text-slate-300/80 hover:text-cyan-300' : 'text-slate-600 hover:text-cyan-600']"
                                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="1.5" class="size-5">
                                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="1.5" class="size-5">
                                    <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2" />
                                    <path
                                        d="M9.9 4.2A10.9 10.9 0 0112 4c6 0 10 8 10 8a18.2 18.2 0 01-4.1 5.5M6.8 6.8A18.4 18.4 0 002 12s4 8 10 8a10.9 10.9 0 003.3-.5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                        <!-- Recordatorio y enlace de recuperación -->
                        <label
                            :class="['inline-flex items-center gap-2 select-none', theme === 'dark' ? 'text-slate-400' : 'text-slate-600']">
                            <input v-model="remember" type="checkbox"
                                :class="['h-4 w-4 rounded text-cyan-500 focus:ring-cyan-500/50', theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white']" />
                            Recuérdame
                        </label>
                        <a href="#" class="text-cyan-300 hover:text-cyan-200 transition-colors">¿Olvidaste tu
                            contraseña?</a>
                    </div>

                    <!-- Botón principal: degradado cyan→fucsia con glow -->
                    <button type="submit" class="btn-neon w-full" :disabled="loading">
                        <span v-if="!loading">Entrar</span>
                        <span v-else class="inline-flex items-center justify-center gap-2">
                            <span class="spinner"></span>
                            Procesando
                        </span>
                    </button>
                </form>
            </div>

            <!-- Borde animado: anillo estático con destello que recorre el contorno -->
            <div class="neon-outline pointer-events-none absolute inset-0 rounded-2xl"></div>
        </div>
    </div>

</template>


<script setup lang="ts">
defineOptions({ name: 'LoginView' });

import { ref, onMounted } from 'vue';

const email = ref('');
const password = ref('');
const remember = ref(false);
const showPassword = ref(false);
const loading = ref(false);

type Theme = 'light' | 'dark';
const theme = ref<Theme>('dark');

function detectPreferredTheme(): Theme {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', theme.value); } catch { /* noop */ }
}

onMounted(() => {
    theme.value = detectPreferredTheme();
});

async function onSubmit() {
    if (!email.value || !password.value) return;
    loading.value = true;
    try {
        // Aquí iría tu llamada al backend de autenticación
        await new Promise((r) => setTimeout(r, 900));
        // Puedes redirigir con el router si ya tienes una ruta privada
        // router.push('/dashboard')
        console.info('Login enviado', { email: email.value, remember: remember.value });
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
/* Fondo decorativo (blobs + grid): aporta el efecto neon ambiental */
.neon-blob {
    position: absolute;
    width: 42rem;
    height: 42rem;
    border-radius: 9999px;
    filter: blur(80px);
    animation: floatGlow 12s ease-in-out infinite alternate;
}

@keyframes floatGlow {
    0% {
        transform: translateY(0) translateX(0) scale(1);
        opacity: .6;
    }

    100% {
        transform: translateY(20px) translateX(10px) scale(1.05);
        opacity: .85;
    }
}

.neon-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255, 235, 235, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(217, 70, 239, 0.08) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: radial-gradient(closest-side, rgba(0, 0, 0, .6), transparent 70%);
}

/* Card y bordes neon: efecto vidrio y sombras de color */
.neon-card {
    background: linear-gradient(180deg, rgba(2, 6, 23, .72), rgba(2, 6, 23, .55));
    border-color: rgba(34, 211, 238, 0.35);
    box-shadow:
        0 0 32px rgba(34, 211, 238, 0.12),
        0 0 64px rgba(217, 70, 239, 0.10);
    backdrop-filter: blur(10px);
}

/* Modo claro: tarjeta blanca con leve vidrio y bordes suaves */
.theme-light .neon-card {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.88));
    border-color: rgba(165, 243, 252, 0.45);
    box-shadow:
        0 0 24px rgba(34, 211, 238, 0.10),
        0 0 44px rgba(217, 70, 239, 0.08);
    color: #0f172a;
}

/* Glow exterior alrededor de la tarjeta (estático) */
.neon-outline::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    /* Glow suave en los mismos tonos del botón */
    background: conic-gradient(from 0deg,
            rgba(34, 211, 238, 0.0) 0deg,
            rgba(34, 211, 238, 0.45) 90deg,
            rgba(217, 70, 239, 0.45) 180deg,
            rgba(34, 211, 238, 0.45) 270deg,
            rgba(34, 211, 238, 0.0) 360deg);
    filter: blur(38px);
    opacity: .55;
}

/* Animación auxiliar previa (spin) — ya no se usa para el borde */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Ángulo animable para el destello que recorre el borde */
@property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
}

@keyframes sweep {
    to {
        --angle: 360deg;
    }
}

/* Borde animado con el mismo gradiente del botón */
.neon-outline {
    --g1: #22d3ee;
    --g2: #d946ef;
    --border-size: 2px;
}

/* Anillo del borde (estático) + destello móvil que recorre el contorno */
.neon-outline::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: var(--border-size);
    /* Capa 1: anillo estático con el mismo gradiente del botón
       Capa 2: destello que se desplaza alrededor del borde */
    background:
        conic-gradient(from 0deg, var(--g1), var(--g2), var(--g1)),
        conic-gradient(from var(--angle),
            rgba(255, 255, 255, 0) 0deg,
            rgba(255, 255, 255, 0) 340deg,
            rgba(34, 211, 238, .95) 350deg,
            rgba(217, 70, 239, .95) 360deg);
    /* Máscara para mostrar solo el anillo (sin rellenar el interior) */
    -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
    mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: sweep 4s linear infinite;
    opacity: .9;
}

/* Ajustes de intensidad según tema */
.theme-light .neon-outline::before {
    opacity: .35;
    filter: blur(32px);
}

.theme-dark .neon-outline::after {
    opacity: .95;
}

.theme-light .neon-outline::after {
    opacity: .85;
}

/* Inputs: estilos base y variantes por tema */
.input-neon {
    appearance: none;
    background: rgba(2, 6, 23, .55);
    border: 1px solid rgba(100, 116, 139, .45);
    color: #e2e8f0;
    padding: 0.75rem 0.875rem;
    border-radius: 0.75rem;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background-color .2s;
}

.input-neon::placeholder {
    color: #94a3b8;
}

.input-neon:focus {
    border-color: rgba(34, 211, 238, .85);
    box-shadow:
        0 0 0 3px rgba(34, 211, 238, .15),
        0 0 24px rgba(34, 211, 238, .25);
    background: rgba(2, 6, 23, .7);
}

/* Modo claro: inputs claros */
.theme-light .input-neon {
    background: #ffffff;
    border: 1px solid rgba(203, 213, 225, .9);
    color: #0f172a;
}

.theme-light .input-neon::placeholder {
    color: #64748b;
}

.theme-light .input-neon:focus {
    background: #ffffff;
    border-color: rgba(34, 211, 238, .6);
    box-shadow:
        0 0 0 3px rgba(34, 211, 238, .15),
        0 0 16px rgba(34, 211, 238, .15);
}

/* Botón principal (gradiente y glow) */
.btn-neon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    font-weight: 600;
    color: #0b1020;
    background: linear-gradient(90deg, #22d3ee, #d946ef);
    box-shadow:
        0 0 22px rgba(34, 211, 238, .35),
        0 0 46px rgba(217, 70, 239, .25);
    transition: transform .15s ease, box-shadow .2s ease, filter .2s ease;
}

.btn-neon:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
}

.btn-neon:active {
    transform: translateY(0);
    filter: brightness(0.98);
}

.btn-neon:disabled {
    opacity: .7;
    cursor: not-allowed;
    filter: grayscale(.1) brightness(.9);
}

/* Spinner del botón (pequeño) */
.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(15, 23, 42, .8);
    border-top-color: rgba(2, 6, 23, 0);
    border-right-color: rgba(2, 6, 23, 0);
    border-radius: 9999px;
    animation: spin 0.10s linear infinite;
}
</style>
