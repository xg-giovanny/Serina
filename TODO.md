# TODO: Sistema de Autenticación con Supabase

## Tasks
- [x] 1. Actualizar SQL con tabla users (contraseña encriptada con bcrypt)
- [x] 2. Crear authService.js - Servicio de autenticación
- [x] 3. Crear authStore.js - Estado de sesión con Pinia
- [x] 4. Crear Login.vue - Página de inicio de sesión
- [x] 5. Crear Register.vue - Página de registro
- [x] 6. Actualizar router/index.js con middleware de protección
- [x] 7. Actualizar MainLayout.vue con logout y estado de usuario

## Notes
- Usar bcrypt para hash de contraseñas
- Almacenar sesión en localStorage
- Redirigir a login si no hay sesión activa

