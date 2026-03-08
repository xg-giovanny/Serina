-- =====================================================
-- CREACIÓN DE TABLAS PARA SUPABASE - VERSION SEGURA
-- Proyecto: Dashboard Serina (Vue 3 + PrimeVue + Supabase)
-- =====================================================

-- =====================================================
-- ELIMINAR TABLAS EXISTENTES (si hay)
-- =====================================================
DROP TABLE IF EXISTS nomina CASCADE;
DROP TABLE IF EXISTS cartas CASCADE;
DROP TABLE IF EXISTS tabs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS register_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS verify_credentials(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_user_status(BIGINT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS check_login_attempts(TEXT) CASCADE;
DROP FUNCTION IF EXISTS record_login_attempt(TEXT, BOOLEAN) CASCADE;

-- =====================================================
-- EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Índice único para username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);


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
    id_usuario BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_nomina_usuario ON nomina(id_usuario);
CREATE INDEX IF NOT EXISTS idx_nomina_categoria ON nomina(categoria);
CREATE INDEX IF NOT EXISTS idx_nomina_fecha ON nomina(fecha);


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
    id_usuario BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cartas_usuario ON cartas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_cartas_character ON cartas(character);
CREATE INDEX IF NOT EXISTS idx_cartas_series ON cartas(series);
CREATE INDEX IF NOT EXISTS idx_cartas_quality ON cartas(quality);


-- =====================================================
-- TABLA: tabs (Tabs dinámicos)
-- =====================================================
CREATE TABLE IF NOT EXISTS tabs (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    icono TEXT,
    id_usuario BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_tabs_usuario ON tabs(id_usuario);


-- =====================================================
-- TABLA: login_attempts (Control de intentos de login)
-- =====================================================
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_attempt TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);


-- =====================================================
-- FUNCIONES DE AUTENTICACIÓN
-- =====================================================

-- Función para verificar intentos de login (max 3 intentos)
CREATE OR REPLACE FUNCTION check_login_attempts(p_username TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    attempt_record RECORD;
    is_allowed BOOLEAN := true;
BEGIN
    SELECT * INTO attempt_record 
    FROM login_attempts 
    WHERE username = p_username;
    
    IF FOUND THEN
        IF attempt_record.locked_until IS NOT NULL AND attempt_record.locked_until > NOW() THEN
            is_allowed := false;
        END IF;
    END IF;
    
    RETURN is_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Función para registrar intento de login
CREATE OR REPLACE FUNCTION record_login_attempt(p_username TEXT, p_success BOOLEAN)
RETURNS VOID AS $$
DECLARE
    attempt_record RECORD;
    MAX_ATTEMPTS CONSTANT INTEGER := 3;
    LOCK_DURATION CONSTANT INTERVAL := '15 minutes';
BEGIN
    SELECT * INTO attempt_record 
    FROM login_attempts 
    WHERE username = p_username;
    
    IF FOUND THEN
        IF p_success THEN
            UPDATE login_attempts 
            SET attempts = 0, 
                locked_until = NULL, 
                last_attempt = NOW()
            WHERE username = p_username;
        ELSE
            UPDATE login_attempts 
            SET attempts = attempts + 1, 
                last_attempt = NOW(),
                locked_until = CASE 
                    WHEN attempts + 1 >= MAX_ATTEMPTS THEN NOW() + LOCK_DURATION
                    ELSE NULL
                END
            WHERE username = p_username;
        END IF;
    ELSE
        IF p_success THEN
            INSERT INTO login_attempts (username, attempts, locked_until, last_attempt)
            VALUES (p_username, 0, NULL, NOW());
        ELSE
            INSERT INTO login_attempts (username, attempts, locked_until, last_attempt)
            VALUES (p_username, 1, NULL, NOW());
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Función para registrar usuario con password encriptado
CREATE OR REPLACE FUNCTION register_user(p_username TEXT, p_password TEXT)
RETURNS BIGINT AS $$
DECLARE
    new_user_id BIGINT;
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
        RAISE EXCEPTION 'El usuario ya existe';
    END IF;
    
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
    AND u.status = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Función para cambiar estado del usuario
CREATE OR REPLACE FUNCTION set_user_status(p_user_id BIGINT, p_status INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users SET status = p_status WHERE id_usuario = p_user_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'Tablas creadas correctamente' AS resultado;

