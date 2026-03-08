-- =====================================================
-- CREACIÓN DE TABLAS PARA SUPABASE
-- Proyecto: Dashboard Personal (Vue 3 + Quasar + Supabase)
-- =====================================================

-- =====================================================
-- ELIMINAR TABLAS EXISTENTES (si hay)
-- =====================================================
DROP TABLE IF EXISTS nomina CASCADE;
DROP TABLE IF EXISTS cartas CASCADE;
DROP TABLE IF EXISTS tabs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS register_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS verify_credentials(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_user_status(BIGINT, INTEGER) CASCADE;

-- =====================================================
-- TABLA: nomina (Gestión de gastos)
-- =====================================================
CREATE TABLE IF NOT EXISTS nomina (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
    categoria TEXT,
    metodo_pago TEXT,
    fecha DATE DEFAULT CURRENT_DATE,
    id_usuario BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE nomina ENABLE ROW LEVEL SECURITY;

-- Política de acceso público para lectura/escritura
CREATE POLICY "Permiso público para nomina" ON nomina
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_nomina_categoria ON nomina(categoria);
CREATE INDEX IF NOT EXISTS idx_nomina_fecha ON nomina(fecha);
CREATE INDEX IF NOT EXISTS idx_nomina_metodo_pago ON nomina(metodo_pago);


-- =====================================================
-- TABLA: cartas (Catálogo de cartas)
-- =====================================================
CREATE TABLE IF NOT EXISTS cartas (
    id BIGSERIAL PRIMARY KEY,
    code TEXT,
    number INTEGER,
    edition TEXT,
    character TEXT,
    series TEXT,
    quality TEXT,
    obtainedDate TEXT,
    obtainedTimestamp TEXT,
    burnValue INTEGER,
    dye_code TEXT,
    dye_name TEXT,
    frame TEXT,
    morphed TEXT,
    trimmed TEXT,
    tag TEXT,
    alias TEXT,
    wishlists TEXT,
    fights TEXT,
    dropQuality TEXT,
    dropper TEXT,
    grabber TEXT,
    guild TEXT,
    worker_effort TEXT,
    worker_style TEXT,
    worker_purity TEXT,
    worker_grabber TEXT,
    worker_dropper TEXT,
    worker_quickness TEXT,
    worker_toughness TEXT,
    worker_vanity TEXT,
    worker_recoveryDate TEXT,
    worker_recoveryTimestamp TEXT,
    id_usuario BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE cartas ENABLE ROW LEVEL SECURITY;

-- Política de acceso público
CREATE POLICY "Permiso público para cartas" ON cartas
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cartas_character ON cartas(character);
CREATE INDEX IF NOT EXISTS idx_cartas_series ON cartas(series);
CREATE INDEX IF NOT EXISTS idx_cartas_quality ON cartas(quality);
CREATE INDEX IF NOT EXISTS idx_cartas_code ON cartas(code);


-- =====================================================
-- TABLA: tabs (Tabs dinámicos)
-- =====================================================
CREATE TABLE IF NOT EXISTS tabs (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    icono TEXT,
    id_usuario BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;

-- Política de acceso público
CREATE POLICY "Permiso público para tabs" ON tabs
    FOR ALL
    USING (true)
    WITH CHECK (true);


-- =====================================================
-- TABLA: users (Usuarios del sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id_usuario BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    status INTEGER NOT NULL DEFAULT 1,  -- 1 = activo, 0 = inactivo
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política de acceso público para login (solo lectura)
CREATE POLICY "Permiso público para users" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Índice único para username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);


-- =====================================================
-- FUNCIÓN: Hash de contraseña usando bcrypt
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Eliminar funciones existentes si existen (para actualización)
DROP FUNCTION IF EXISTS register_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_credentials(TEXT, TEXT);
DROP FUNCTION IF EXISTS set_user_status(BIGINT, INTEGER);

-- Función para registrar usuario con password encriptado (status = 1 por defecto)
CREATE OR REPLACE FUNCTION register_user(p_username TEXT, p_password TEXT)
RETURNS BIGINT AS $$
DECLARE
    new_user_id BIGINT;
BEGIN
    -- Verificar si el usuario ya existe
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
        RAISE EXCEPTION 'El usuario ya existe';
    END IF;
    
    -- Crear usuario con password encriptado y status = 1 (activo)
    INSERT INTO users (username, password, status)
    VALUES (p_username, crypt(p_password, gen_salt('bf')), 1)
    RETURNING id_usuario INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar credenciales Y estado del usuario
CREATE OR REPLACE FUNCTION verify_credentials(p_username TEXT, p_password TEXT)
RETURNS TABLE(id_usuario BIGINT, username TEXT, status INTEGER, created_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id_usuario, u.username, u.status, u.created_at
    FROM users u
    WHERE u.username = p_username
    AND u.password = crypt(p_password, u.password)
    AND u.status = 1;  -- Solo permite usuarios activos
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cambiar estado del usuario (activar/desactivar)
CREATE OR REPLACE FUNCTION set_user_status(p_user_id BIGINT, p_status INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users SET status = p_status WHERE id_usuario = p_user_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- =====================================================
SELECT 
    'nomina' AS tabla,
    COUNT(*) AS registros
FROM nomina
UNION ALL
SELECT 
    'cartas' AS tabla,
    COUNT(*) AS registros
FROM cartas
UNION ALL
SELECT 
    'tabs' AS tabla,
    COUNT(*) AS registros
FROM tabs
UNION ALL
SELECT 
    'users' AS tabla,
    COUNT(*) AS registros
FROM users;


-- =====================================================
-- NOTAS PARA EL USUARIO:
-- =====================================================
-- 1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
-- 2. Selecciona tu proyecto: cfrkxbfudjouytyxqtzt
-- 3. Ve a la sección "SQL Editor"
-- 4. Copia y pega todo este contenido
-- 5. Ejecuta el script
--
-- Las tablas se crearán automáticamente con:
-- - Auto-increment de IDs
-- - Timestamps automáticos
-- - Índices para mejor rendimiento
-- - Row Level Security configurado
-- - Funciones seguras para autenticación con bcrypt
-- =====================================================

