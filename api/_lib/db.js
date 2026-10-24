import pg from 'pg';

const { Pool } = pg;

let pool = null;
let schemaInitialized = false;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000,
    });
  }
  return pool;
}

/**
 * Inicializa automáticamente las tablas de seguridad, WebAuthn y auditoría en Neon PostgreSQL
 */
export async function ensureSecurityTables() {
  const db = getPool();
  if (!db || schemaInitialized) return;

  try {
    await db.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      ALTER TABLE IF EXISTS usuarios
        ADD COLUMN IF NOT EXISTS is_temp_password BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS ai_queries_hour_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS ai_queries_window_start TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS ai_queries_total INTEGER NOT NULL DEFAULT 0;

      CREATE TABLE IF NOT EXISTS credenciales_webauthn (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
          credential_id TEXT NOT NULL UNIQUE,
          public_key TEXT NOT NULL,
          counter BIGINT NOT NULL DEFAULT 0,
          transports TEXT[] DEFAULT ARRAY['internal'],
          nombre_dispositivo VARCHAR(120) NOT NULL DEFAULT 'Dispositivo Biométrico',
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_used_at TIMESTAMPTZ
      );

      ALTER TABLE credenciales_webauthn ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'credenciales_webauthn' AND policyname = 'policy_credenciales_all'
        ) THEN
          CREATE POLICY policy_credenciales_all ON credenciales_webauthn
            USING (
              usuario_id::text = current_setting('app.current_user_id', true)
              OR current_setting('app.current_user_role', true) IN ('SUPERADMIN', 'ADMIN', 'Superadministrador', 'Administrador')
              OR current_setting('app.bypass_rls', true) = 'on'
            );
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS desafios_webauthn (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
          email VARCHAR(150),
          challenge TEXT NOT NULL UNIQUE,
          proposito VARCHAR(30) NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes'),
          used BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

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
    `);
    schemaInitialized = true;
  } catch (err) {
    console.error('[LUMIA Security DB Init Warning]:', err.message);
  }
}

/**
 * Ejecuta una consulta con contexto RLS configurado para el usuario actual
 */
export async function withRlsContext(user, callback) {
  const db = getPool();
  if (!db) throw new Error('DATABASE_URL no configurada en el servidor');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('app.current_user_id', $1, true)`, [String(user?.id || '')]);
    await client.query(`SELECT set_config('app.current_user_role', $1, true)`, [String(user?.rol || '')]);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Registra un evento en la bitácora de auditoría del servidor (sin guardar contraseñas ni chats)
 */
export async function recordServerAudit({ usuarioId = null, usuarioNombre = 'Sistema', accion, modulo, detalle = {}, ipAddress = null }) {
  const db = getPool();
  if (!db) return;
  try {
    await ensureSecurityTables();
    // Asegurar que jamás se filtre un campo de password o contenido de chat
    const cleanDetalle = { ...detalle };
    delete cleanDetalle.password;
    delete cleanDetalle.newPassword;
    delete cleanDetalle.oldPassword;
    delete cleanDetalle.tempPassword;
    delete cleanDetalle.messageContent;

    await db.query(
      `INSERT INTO auditoria_seguridad (usuario_id, usuario_nombre, accion, modulo, detalle, ip_address)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
      [
        usuarioId && /^[0-9a-fA-F-]{36}$/.test(usuarioId) ? usuarioId : null,
        usuarioNombre,
        accion,
        modulo,
        JSON.stringify(cleanDetalle),
        ipAddress
      ]
    );
  } catch (err) {
    console.error('[LUMIA Audit Error]:', err.message);
  }
}
