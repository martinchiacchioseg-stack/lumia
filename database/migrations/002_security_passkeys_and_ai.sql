-- ============================================================================
-- LUMIA - MIGRACIÓN DE SEGURIDAD, PASSKEYS (WEBAUTHN) Y AUDITORÍA DE IA
-- Cumplimiento Ley Nacional N° 25.326 de Protección de Datos Personales
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ACTUALIZACIÓN DE LA TABLA DE USUARIOS (Cifrado fuerte, caducidad 48h, bloqueo y cupo IA)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS is_temp_password BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_queries_hour_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_queries_window_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_queries_total INTEGER NOT NULL DEFAULT 0;

-- Sincronizar columna legacy debe_cambiar_password con is_temp_password
UPDATE usuarios SET is_temp_password = debe_cambiar_password WHERE debe_cambiar_password IS NOT NULL;

-- 2. TABLA DE CREDENCIALES WEBAUTHN / PASSKEYS (CERO DATOS BIOMÉTRICOS - LEY 25.326)
CREATE TABLE IF NOT EXISTS credenciales_webauthn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL, -- Clave pública COSE codificada en Base64URL
    counter BIGINT NOT NULL DEFAULT 0,
    transports TEXT[] DEFAULT ARRAY['internal'],
    nombre_dispositivo VARCHAR(120) NOT NULL DEFAULT 'Dispositivo Biométrico',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_credenciales_webauthn_usuario ON credenciales_webauthn(usuario_id);
CREATE INDEX IF NOT EXISTS idx_credenciales_webauthn_cred_id ON credenciales_webauthn(credential_id);

-- Habilitar Row Level Security (RLS) en credenciales_webauthn
ALTER TABLE credenciales_webauthn ENABLE ROW LEVEL SECURITY;

-- Política RLS: Cada usuario ve y administra sus propias passkeys; Admin y Superadmin pueden revocar por pérdida de dispositivo
DROP POLICY IF EXISTS policy_credenciales_select ON credenciales_webauthn;
CREATE POLICY policy_credenciales_select ON credenciales_webauthn
    FOR SELECT
    USING (
        usuario_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('SUPERADMIN', 'ADMIN', 'Superadministrador', 'Administrador')
    );

DROP POLICY IF EXISTS policy_credenciales_insert ON credenciales_webauthn;
CREATE POLICY policy_credenciales_insert ON credenciales_webauthn
    FOR INSERT
    WITH CHECK (
        usuario_id::text = current_setting('app.current_user_id', true)
    );

DROP POLICY IF EXISTS policy_credenciales_delete ON credenciales_webauthn;
CREATE POLICY policy_credenciales_delete ON credenciales_webauthn
    FOR DELETE
    USING (
        usuario_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('SUPERADMIN', 'ADMIN', 'Superadministrador', 'Administrador')
    );

DROP POLICY IF EXISTS policy_credenciales_update ON credenciales_webauthn;
CREATE POLICY policy_credenciales_update ON credenciales_webauthn
    FOR UPDATE
    USING (true);

-- 3. TABLA DE DESAFÍOS (CHALLENGES) DE UN SOLO USO PARA WEBAUTHN
CREATE TABLE IF NOT EXISTS desafios_webauthn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    email VARCHAR(150),
    challenge TEXT NOT NULL UNIQUE,
    proposito VARCHAR(30) NOT NULL CHECK (proposito IN ('register', 'authenticate')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes'),
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_desafios_webauthn_challenge ON desafios_webauthn(challenge) WHERE used = FALSE;

-- 4. TABLA DE SESIONES ACTIVAS (SOPORTE COOKIES HTTPONLY, SECURE, SAMESITE)
CREATE TABLE IF NOT EXISTS sesiones_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ip_address VARCHAR(64),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sesiones_auth_token ON sesiones_auth(token_hash) WHERE revoked = FALSE;

-- 5. TABLA DE AUDITORÍA INMUTABLE DE SEGURIDAD Y CONSUMO IA (SIN CONTRASEÑAS NI CHATS)
CREATE TABLE IF NOT EXISTS auditoria_seguridad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_nombre VARCHAR(150),
    accion VARCHAR(120) NOT NULL,
    modulo VARCHAR(80) NOT NULL,
    detalle JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_seguridad_fecha ON auditoria_seguridad(created_at DESC);
