import { getPool } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/security.js';

let syncTableInitialized = false;

/**
 * Asegura la existencia de la tabla central de sincronización en Neon PostgreSQL
 */
export async function ensureSyncTable(db) {
  if (syncTableInitialized || !db) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS patita_records (
        collection VARCHAR(64) NOT NULL,
        id VARCHAR(128) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (collection, id)
      );

      CREATE INDEX IF NOT EXISTS idx_patita_records_coll_active
        ON patita_records (collection, updated_at DESC)
        WHERE deleted = false;

      CREATE INDEX IF NOT EXISTS idx_patita_records_updated
        ON patita_records (updated_at DESC);
    `);
    syncTableInitialized = true;
  } catch (err) {
    console.error('[Sync DB Init Warning]:', err.message);
  }
}

export default async function handler(req, res) {
  // CORS / Headers
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
      message: 'Base de datos Neon PostgreSQL no configurada en este entorno. Operando en caché local.'
    });
  }

  try {
    await ensureSyncTable(db);

    // =========================================================================
    // GET: Recuperar todas las entidades activas agrupadas por colección
    // =========================================================================
    if (req.method === 'GET') {
      const { rows } = await db.query(`
        SELECT collection, id, data, updated_at
        FROM patita_records
        WHERE deleted = false
        ORDER BY collection, updated_at ASC;
      `);

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

      for (const row of rows) {
        const item = { ...row.data, id: row.id, server_updated_at: row.updated_at };
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
        serverTime: new Date().toISOString(),
        totalRecords: rows.length,
        collections
      });
    }

    // =========================================================================
    // POST: Sincronizar cambios (UPSERT, DELETE, BATCH)
    // =========================================================================
    if (req.method === 'POST') {
      const { action, collection, item, id, batch } = req.body || {};

      // 1. Operación BATCH (subida masiva inicial o recuperación)
      if (action === 'BATCH_UPSERT' && Array.isArray(batch)) {
        let upsertedCount = 0;
        for (const entry of batch) {
          if (!entry.collection || !entry.item || !entry.item.id) continue;
          await db.query(`
            INSERT INTO patita_records (collection, id, data, created_at, updated_at, deleted)
            VALUES ($1, $2, $3::jsonb, NOW(), NOW(), false)
            ON CONFLICT (collection, id)
            DO UPDATE SET
              data = EXCLUDED.data,
              updated_at = NOW(),
              deleted = false;
          `, [entry.collection, String(entry.item.id), JSON.stringify(entry.item)]);
          upsertedCount++;
        }

        return res.status(200).json({
          success: true,
          action: 'BATCH_UPSERT',
          count: upsertedCount,
          serverTime: new Date().toISOString()
        });
      }

      // 2. Operación DELETE (marcado lógico)
      if (action === 'DELETE') {
        const targetId = id || item?.id;
        if (!collection || !targetId) {
          return res.status(400).json({ error: 'Faltan parámetros collection o id para eliminar.' });
        }

        await db.query(`
          UPDATE patita_records
          SET deleted = true, updated_at = NOW()
          WHERE collection = $1 AND id = $2;
        `, [collection, String(targetId)]);

        return res.status(200).json({
          success: true,
          action: 'DELETE',
          collection,
          id: String(targetId),
          serverTime: new Date().toISOString()
        });
      }

      // 3. Operación UPSERT (creación o actualización individual)
      if (action === 'UPSERT' || !action) {
        if (!collection || !item || !item.id) {
          return res.status(400).json({ error: 'Faltan parámetros collection o item con id válido.' });
        }

        const itemId = String(item.id);
        await db.query(`
          INSERT INTO patita_records (collection, id, data, created_at, updated_at, deleted)
          VALUES ($1, $2, $3::jsonb, NOW(), NOW(), false)
          ON CONFLICT (collection, id)
          DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = NOW(),
            deleted = false;
        `, [collection, itemId, JSON.stringify(item)]);

        return res.status(200).json({
          success: true,
          action: 'UPSERT',
          collection,
          id: itemId,
          serverTime: new Date().toISOString()
        });
      }

      return res.status(400).json({ error: 'Acción de sincronización desconocida.' });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (err) {
    console.error('[Sync Handler Error]:', err);
    return res.status(500).json({
      error: 'Error al sincronizar datos con el servidor Neon PostgreSQL.',
      details: err.message
    });
  }
}
