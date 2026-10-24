/**
 * Servicio de sincronización en tiempo real con Neon PostgreSQL (Patita Aliada / LUMIA)
 */

export async function fetchServerData() {
  try {
    const res = await fetch('/api/data/sync', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return { success: false, status: res.status };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[Sync Service] Sin conexión al servidor o modo local:', err.message);
    return { success: false, offline: true, error: err.message };
  }
}

export async function syncItemUpsert(collection, item) {
  if (!collection || !item || !item.id) return { success: false };

  try {
    const res = await fetch('/api/data/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPSERT',
        collection,
        item
      })
    });

    if (!res.ok) {
      return { success: false, status: res.status };
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Sync Service] Error al guardar ${collection}/${item.id} en el servidor:`, err.message);
    return { success: false, offline: true, error: err.message };
  }
}

export async function syncItemDelete(collection, id) {
  if (!collection || !id) return { success: false };

  try {
    const res = await fetch('/api/data/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'DELETE',
        collection,
        id: String(id)
      })
    });

    if (!res.ok) {
      return { success: false, status: res.status };
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Sync Service] Error al eliminar ${collection}/${id} en el servidor:`, err.message);
    return { success: false, offline: true, error: err.message };
  }
}

export async function syncBatchUpsert(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return { success: true, count: 0 };

  try {
    const res = await fetch('/api/data/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'BATCH_UPSERT',
        batch: entries
      })
    });

    if (!res.ok) {
      return { success: false, status: res.status };
    }

    return await res.json();
  } catch (err) {
    console.warn('[Sync Service] Error en sincronización masiva:', err.message);
    return { success: false, offline: true, error: err.message };
  }
}
