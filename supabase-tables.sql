-- =====================================================
-- CREACIÓN DE TABLAS PARA SUPABASE
-- Proyecto: Dashboard Personal (Vue 3 + Quasar + Supabase)
-- =====================================================

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
FROM tabs;


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
-- =====================================================

