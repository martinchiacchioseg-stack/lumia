import { getPool } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/security.js';

let syncTableInitialized = false;

/**
 * Asegura la infraestructura de sincronización por deltas y tablas maestras en Neon PostgreSQL
 */
export async function ensureSyncInfrastructure(db) {
  if (syncTableInitialized || !db) return;
  try {
    await db.query(`
      CREATE SEQUENCE IF NOT EXISTS patita_sync_rev_seq START 1;

      CREATE TABLE IF NOT EXISTS patita_records (
        collection VARCHAR(64) NOT NULL,
        id VARCHAR(128) NOT NULL,
        data JSONB NOT NULL,
        sync_revision BIGINT NOT NULL DEFAULT nextval('patita_sync_rev_seq'),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (collection, id)
      );

      ALTER TABLE patita_records 
        ADD COLUMN IF NOT EXISTS sync_revision BIGINT NOT NULL DEFAULT nextval('patita_sync_rev_seq');

      CREATE INDEX IF NOT EXISTS idx_patita_records_rev 
        ON patita_records (sync_revision ASC);

      CREATE INDEX IF NOT EXISTS idx_patita_records_coll_active
        ON patita_records (collection, updated_at DESC)
        WHERE deleted = false;
    `);
    syncTableInitialized = true;
  } catch (err) {
    console.error('[Sync DB Init Warning]:', err.message);
  }
}

/**
 * Enmascara datos personales de adoptantes en cumplimiento con la Ley 25.326
 */
function sanitizeAdopterForRole(item, role) {
  const isPrivileged = role === 'Superadministrador' || role === 'Administrador';
  if (isPrivileged || !item) return item;

  const sanitized = { ...item };
  if (sanitized.dni_cuit && typeof sanitized.dni_cuit === 'string') {
    sanitized.dni_cuit = sanitized.dni_cuit.length > 4 ? `***${sanitized.dni_cuit.slice(-4)}` : '***';
  }
  sanitized.direccion_numero = '***';
  sanitized.direccion_piso_depto = '***';
  sanitized.foto_dni_frente = null;
  sanitized.foto_dni_dorso = null;
  sanitized._is_masked = true;
  return sanitized;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = getPool();
  if (!db) {
    return res.status(200).json({
      success: false,
      offline: true,
      message: 'Base de datos Neon PostgreSQL no conectada. Operando en modo local.'
    });
  }

  try {
    await ensureSyncInfrastructure(db);
    const currentUser = await getAuthenticatedUser(req);
    const userRole = currentUser?.rol || 'Voluntario';

    // =========================================================================
    // GET: Sincronización Incremental por Deltas (since_revision)
    // =========================================================================
    if (req.method === 'GET') {
      const sinceRevision = parseInt(req.query.since || '0', 10) || 0;

      // Obtener la revisión más alta actual
      const currentRevResult = await db.query(`SELECT COALESCE(MAX(sync_revision), 0) AS max_rev FROM patita_records;`);
      const currentRev = parseInt(currentRevResult.rows[0]?.max_rev || '0', 10);

      // Si el cliente pide desde 0 (carga inicial completa)
      // o desde sinceRevision (delta incremental)
      const query = sinceRevision === 0
        ? `SELECT collection, id, data, sync_revision, updated_at, deleted
           FROM patita_records
           WHERE deleted = false
           ORDER BY sync_revision ASC;`
        : `SELECT collection, id, data, sync_revision, updated_at, deleted
           FROM patita_records
           WHERE sync_revision > $1
           ORDER BY sync_revision ASC;`;

      const params = sinceRevision === 0 ? [] : [sinceRevision];
      const { rows } = await db.query(query, params);

      // Si es delta, retornamos las mutaciones (creados, actualizados y eliminados)
      const isDelta = sinceRevision > 0;
      const collections = {
        animales: [],
        adoptantes: [],
        adopciones: [],
        seguimientos: [],
        eventos_salud: [],
        reportes_calle: [],
        mensajes_sistema: [],
        noticias: [],
        auditoria: [],
        config_portal: null
      };

      const deletedItems = [];

      for (const row of rows) {
        if (row.deleted) {
          deletedItems.push({ collection: row.collection, id: row.id, sync_revision: row.sync_revision });
          continue;
        }

        let item = { ...row.data, id: row.id, sync_revision: row.sync_revision, server_updated_at: row.updated_at };
        if (row.collection === 'adoptantes') {
          item = sanitizeAdopterForRole(item, userRole);
        }

        if (row.collection === 'config_portal') {
          collections.config_portal = item;
        } else if (collections[row.collection]) {
          collections[row.collection].push(item);
        } else {
          collections[row.collection] = [item];
        }
      }

      return res.status(200).json({
        success: true,
        isDelta,
        sinceRevision,
        currentRevision: currentRev,
        serverTime: new Date().toISOString(),
        mutationsCount: rows.length,
        collections,
        deleted: deletedItems
      });
    }

    // =========================================================================
    // POST: Sincronización de mutaciones desde el cliente (UPSERT, DELETE, BATCH)
    // =========================================================================
    if (req.method === 'POST') {
      const { action, collection, item, id, batch } = req.body || {};

      // 1. Operación BATCH
      if (action === 'BATCH_UPSERT' && Array.isArray(batch)) {
        let upsertedCount = 0;
        for (const entry of batch) {
          if (!entry.collection || !entry.item || !entry.item.id) continue;
          await db.query(`
            INSERT INTO patita_records (collection, id, data, sync_revision, created_at, updated_at, deleted)
            VALUES ($1, $2, $3::jsonb, nextval('patita_sync_rev_seq'), NOW(), NOW(), false)
            ON CONFLICT (collection, id)
            DO UPDATE SET
              data = EXCLUDED.data,
              sync_revision = nextval('patita_sync_rev_seq'),
              updated_at = NOW(),
              deleted = false;
          `, [entry.collection, String(entry.item.id), JSON.stringify(entry.item)]);
          upsertedCount++;
        }

        const revRes = await db.query(`SELECT currval('patita_sync_rev_seq') AS curr_rev;`);
        return res.status(200).json({
          success: true,
          action: 'BATCH_UPSERT',
          count: upsertedCount,
          currentRevision: parseInt(revRes.rows[0]?.curr_rev || '0', 10),
          serverTime: new Date().toISOString()
        });
      }

      // 2. Operación DELETE
      if (action === 'DELETE') {
        const targetId = id || item?.id;
        if (!collection || !targetId) {
          return res.status(400).json({ error: 'Faltan parámetros collection o id para eliminar.' });
        }

        await db.query(`
          UPDATE patita_records
          SET deleted = true, sync_revision = nextval('patita_sync_rev_seq'), updated_at = NOW()
          WHERE collection = $1 AND id = $2;
        `, [collection, String(targetId)]);

        const revRes = await db.query(`SELECT currval('patita_sync_rev_seq') AS curr_rev;`);
        return res.status(200).json({
          success: true,
          action: 'DELETE',
          collection,
          id: String(targetId),
          currentRevision: parseInt(revRes.rows[0]?.curr_rev || '0', 10),
          serverTime: new Date().toISOString()
        });
      }

      // 3. Operación UPSERT
      if (action === 'UPSERT' || !action) {
        if (!collection || !item || !item.id) {
          return res.status(400).json({ error: 'Faltan parámetros collection o item con id.' });
        }

        const itemId = String(item.id);
        await db.query(`
          INSERT INTO patita_records (collection, id, data, sync_revision, created_at, updated_at, deleted)
          VALUES ($1, $2, $3::jsonb, nextval('patita_sync_rev_seq'), NOW(), NOW(), false)
          ON CONFLICT (collection, id)
          DO UPDATE SET
            data = EXCLUDED.data,
            sync_revision = nextval('patita_sync_rev_seq'),
            updated_at = NOW(),
            deleted = false;
        `, [collection, itemId, JSON.stringify(item)]);

        const revRes = await db.query(`SELECT currval('patita_sync_rev_seq') AS curr_rev;`);
        return res.status(200).json({
          success: true,
          action: 'UPSERT',
          collection,
          id: itemId,
          currentRevision: parseInt(revRes.rows[0]?.curr_rev || '0', 10),
          serverTime: new Date().toISOString()
        });
      }

      return res.status(400).json({ error: 'Acción no reconocida.' });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (err) {
    console.error('[Delta Sync Error]:', err);
    return res.status(500).json({ error: 'Error en sincronización incremental.', details: err.message });
  }
}
