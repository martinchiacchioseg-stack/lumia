import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  INITIAL_ANIMALS,
  INITIAL_ADOPTERS,
  INITIAL_ADOPTIONS,
  INITIAL_FOLLOWUPS,
  INITIAL_HEALTH_EVENTS,
  INITIAL_STREET_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NEWS,
  INITIAL_SYSTEM_MESSAGES,
  INITIAL_PORTAL_CONFIG
} from '../lib/seedData';
import {
  fetchServerData,
  syncItemUpsert,
  syncItemDelete,
  syncBatchUpsert
} from '../services/dataSyncService';
import { generateEntityId, sanitizeAdopterRecord } from '../lib/idSecurityUtils';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const userRole = currentUser?.rol || 'Voluntario';

  // Cursor de revisión para sincronización incremental
  const [lastRevision, setLastRevision] = useState(() => {
    return parseInt(localStorage.getItem('patita_sync_rev') || '0', 10);
  });

  // Estados principales de datos con persistencia en caché local
  const [animales, setAnimales] = useState(() => {
    const saved = localStorage.getItem('patita_animales');
    return saved ? JSON.parse(saved) : INITIAL_ANIMALS;
  });

  const [adoptantes, setAdoptantes] = useState(() => {
    const saved = localStorage.getItem('patita_adoptantes');
    return saved ? JSON.parse(saved) : INITIAL_ADOPTERS;
  });

  const [adopciones, setAdopciones] = useState(() => {
    const saved = localStorage.getItem('patita_adopciones');
    return saved ? JSON.parse(saved) : INITIAL_ADOPTIONS;
  });

  const [seguimientos, setSeguimientos] = useState(() => {
    const saved = localStorage.getItem('patita_seguimientos');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS;
  });

  const [eventosSalud, setEventosSalud] = useState(() => {
    const saved = localStorage.getItem('patita_eventos_salud');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_EVENTS;
  });

  const [reportesCalle, setReportesCalle] = useState(() => {
    const saved = localStorage.getItem('patita_reportes_calle');
    return saved ? JSON.parse(saved) : INITIAL_STREET_REPORTS;
  });

  const [auditoria, setAuditoria] = useState(() => {
    const saved = localStorage.getItem('patita_auditoria');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [noticias, setNoticias] = useState(() => {
    const saved = localStorage.getItem('patita_noticias');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  const [mensajesSistema, setMensajesSistema] = useState(() => {
    const saved = localStorage.getItem('patita_mensajes_sistema');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_MESSAGES;
  });

  const [configPortal, setConfigPortal] = useState(() => {
    const saved = localStorage.getItem('patita_config_portal');
    return saved ? JSON.parse(saved) : INITIAL_PORTAL_CONFIG;
  });

  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const stateRef = useRef({
    animales,
    adoptantes,
    adopciones,
    seguimientos,
    eventosSalud,
    reportesCalle,
    auditoria,
    noticias,
    mensajesSistema,
    configPortal,
    lastRevision
  });

  useEffect(() => {
    stateRef.current = {
      animales,
      adoptantes,
      adopciones,
      seguimientos,
      eventosSalud,
      reportesCalle,
      auditoria,
      noticias,
      mensajesSistema,
      configPortal,
      lastRevision
    };
  }, [animales, adoptantes, adopciones, seguimientos, eventosSalud, reportesCalle, auditoria, noticias, mensajesSistema, configPortal, lastRevision]);

  // Persistencia local en localStorage (Caché Offline)
  useEffect(() => { localStorage.setItem('patita_animales', JSON.stringify(animales)); }, [animales]);
  useEffect(() => { localStorage.setItem('patita_adoptantes', JSON.stringify(adoptantes)); }, [adoptantes]);
  useEffect(() => { localStorage.setItem('patita_adopciones', JSON.stringify(adopciones)); }, [adopciones]);
  useEffect(() => { localStorage.setItem('patita_seguimientos', JSON.stringify(seguimientos)); }, [seguimientos]);
  useEffect(() => { localStorage.setItem('patita_eventos_salud', JSON.stringify(eventosSalud)); }, [eventosSalud]);
  useEffect(() => { localStorage.setItem('patita_reportes_calle', JSON.stringify(reportesCalle)); }, [reportesCalle]);
  useEffect(() => { localStorage.setItem('patita_auditoria', JSON.stringify(auditoria)); }, [auditoria]);
  useEffect(() => { localStorage.setItem('patita_noticias', JSON.stringify(noticias)); }, [noticias]);
  useEffect(() => { localStorage.setItem('patita_mensajes_sistema', JSON.stringify(mensajesSistema)); }, [mensajesSistema]);
  useEffect(() => { localStorage.setItem('patita_config_portal', JSON.stringify(configPortal)); }, [configPortal]);
  useEffect(() => { localStorage.setItem('patita_sync_rev', String(lastRevision)); }, [lastRevision]);

  const isSyncingRef = useRef(false);

  /**
   * Sincronización Incremental por Deltas
   */
  const syncWithServer = useCallback(async (isManual = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const currentRev = stateRef.current.lastRevision;
      const res = await fetchServerData(currentRev);

      if (!res.success) {
        setSyncStatus(res.offline ? 'offline' : 'error');
        isSyncingRef.current = false;
        return;
      }

      const serverCols = res.collections || {};
      const deletedList = res.deleted || [];
      const newRev = res.currentRevision || currentRev;

      // Aplicar eliminaciones lógicas
      if (deletedList.length > 0) {
        const deletedIds = new Set(deletedList.map(d => d.id));
        setAnimales(prev => prev.filter(a => !deletedIds.has(a.id)));
        setAdoptantes(prev => prev.filter(a => !deletedIds.has(a.id)));
        setAdopciones(prev => prev.filter(a => !deletedIds.has(a.id)));
        setSeguimientos(prev => prev.filter(s => !deletedIds.has(s.id)));
        setEventosSalud(prev => prev.filter(e => !deletedIds.has(e.id)));
        setReportesCalle(prev => prev.filter(r => !deletedIds.has(r.id)));
        setNoticias(prev => prev.filter(n => !deletedIds.has(n.id)));
        setMensajesSistema(prev => prev.filter(m => !deletedIds.has(m.id)));
      }

      // Fusión de mutaciones incrementales
      const mergeCollection = (currentList, deltaList) => {
        if (!deltaList || deltaList.length === 0) return currentList;
        const deltaMap = new Map(deltaList.map(item => [item.id, item]));
        const updated = currentList.map(item => deltaMap.has(item.id) ? { ...item, ...deltaMap.get(item.id) } : item);
        const existingIds = new Set(currentList.map(item => item.id));
        const brandNew = deltaList.filter(item => !existingIds.has(item.id));
        return [...updated, ...brandNew];
      };

      if (res.isDelta) {
        if (serverCols.animales?.length) setAnimales(prev => mergeCollection(prev, serverCols.animales));
        if (serverCols.adoptantes?.length) setAdoptantes(prev => mergeCollection(prev, serverCols.adoptantes));
        if (serverCols.adopciones?.length) setAdopciones(prev => mergeCollection(prev, serverCols.adopciones));
        if (serverCols.seguimientos?.length) setSeguimientos(prev => mergeCollection(prev, serverCols.seguimientos));
        if (serverCols.eventos_salud?.length) setEventosSalud(prev => mergeCollection(prev, serverCols.eventos_salud));
        if (serverCols.reportes_calle?.length) setReportesCalle(prev => mergeCollection(prev, serverCols.reportes_calle));
        if (serverCols.mensajes_sistema?.length) setMensajesSistema(prev => mergeCollection(prev, serverCols.mensajes_sistema));
        if (serverCols.noticias?.length) setNoticias(prev => mergeCollection(prev, serverCols.noticias));
      } else {
        // Carga completa inicial
        if (serverCols.animales) setAnimales(serverCols.animales);
        if (serverCols.adoptantes) setAdoptantes(serverCols.adoptantes);
        if (serverCols.adopciones) setAdopciones(serverCols.adopciones);
        if (serverCols.seguimientos) setSeguimientos(serverCols.seguimientos);
        if (serverCols.eventos_salud) setEventosSalud(serverCols.eventos_salud);
        if (serverCols.reportes_calle) setReportesCalle(serverCols.reportes_calle);
        if (serverCols.mensajes_sistema) setMensajesSistema(serverCols.mensajes_sistema);
        if (serverCols.noticias) setNoticias(serverCols.noticias);
      }

      if (serverCols.config_portal) {
        setConfigPortal(serverCols.config_portal);
      }

      setLastRevision(newRev);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('[DataContext Delta Sync Error]:', err);
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Polling incremental cada 25 segundos y en visibilidad
  useEffect(() => {
    syncWithServer(false);
    const interval = setInterval(() => syncWithServer(false), 25000);
    const onFocus = () => syncWithServer(false);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncWithServer(false);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [syncWithServer]);

  const logAudit = (accion, tabla_afectada, registro_nombre) => {
    const newLog = {
      id: generateEntityId('aud'),
      usuario_nombre: currentUser?.nombre || 'Usuario del sistema',
      accion,
      tabla_afectada,
      registro_nombre,
      fecha: new Date().toISOString()
    };
    setAuditoria(prev => [newLog, ...prev]);
    syncItemUpsert('auditoria', newLog);
  };

  const generateAnimalCode = (especie) => {
    const prefix = especie === 'gato' ? 'CAT' : especie === 'perro' ? 'DOG' : 'OTH';
    const existing = animales.filter(a => a.codigo_interno && a.codigo_interno.startsWith(prefix));
    const nextNum = existing.length + 1;
    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  };

  // =================== ANIMALES ===================
  const addAnimal = (data) => {
    const codigo_interno = data.codigo_interno || generateAnimalCode(data.especie || 'perro');
    const newAnimal = {
      ...data,
      id: generateEntityId('anim'),
      codigo_interno,
      archivado: false,
      created_at: new Date().toISOString(),
      galeria: data.galeria || []
    };
    setAnimales(prev => [newAnimal, ...prev]);
    logAudit('Registro de rescate', 'animales', `${newAnimal.nombre_actual} (${codigo_interno})`);
    syncItemUpsert('animales', newAnimal);
    return newAnimal;
  };

  const updateAnimal = (id, data) => {
    setAnimales(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...data, updated_at: new Date().toISOString() };
        syncItemUpsert('animales', updated);
        return updated;
      }
      return a;
    }));
    const current = animales.find(a => a.id === id);
    logAudit('Modificación de ficha', 'animales', current?.nombre_actual || id);
  };

  const archiveAnimal = (id) => {
    setAnimales(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, archivado: true, updated_at: new Date().toISOString() };
        syncItemUpsert('animales', updated);
        return updated;
      }
      return a;
    }));
    const current = animales.find(a => a.id === id);
    logAudit('Archivado de animal', 'animales', current?.nombre_actual || id);
  };

  // =================== ADOPTANTES (Ley 25.326) ===================
  const addAdoptante = (data) => {
    const newAdopter = {
      ...data,
      id: generateEntityId('adop'),
      archivado: false,
      created_at: new Date().toISOString()
    };
    setAdoptantes(prev => [newAdopter, ...prev]);
    logAudit('Alta de adoptante', 'adoptantes', newAdopter.nombre_apellido);
    syncItemUpsert('adoptantes', newAdopter);
    return newAdopter;
  };

  const updateAdoptante = (id, data) => {
    setAdoptantes(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...data, updated_at: new Date().toISOString() };
        syncItemUpsert('adoptantes', updated);
        return updated;
      }
      return a;
    }));
    const current = adoptantes.find(a => a.id === id);
    logAudit('Actualización de adoptante', 'adoptantes', current?.nombre_apellido || id);
  };

  const archiveAdoptante = (id) => {
    setAdoptantes(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, archivado: true, updated_at: new Date().toISOString() };
        syncItemUpsert('adoptantes', updated);
        return updated;
      }
      return a;
    }));
    const current = adoptantes.find(a => a.id === id);
    logAudit('Archivado de adoptante', 'adoptantes', current?.nombre_apellido || id);
  };

  // =================== ADOPCIONES Y CALENDARIO AUTOMÁTICO ===================
  const addAdopcion = (data) => {
    const adoptionId = generateEntityId('adopcion');
    const newAdoption = {
      ...data,
      id: adoptionId,
      estado_adopcion: 'activo en seguimiento',
      created_at: new Date().toISOString()
    };

    updateAnimal(data.animal_id, { estado_caso: 'adoptado' });

    const fEntrega = new Date(data.fecha_entrega || new Date());
    const addDays = (d, days) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy.toISOString().split('T')[0];
    };

    const scheduledFollowups = [
      {
        id: generateEntityId('seg'),
        adopcion_id: adoptionId,
        fecha_contacto: addDays(fEntrega, 3),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control inicial 48-72 hs: chequeo de adaptación, apetito y descanso.',
        proxima_fecha_seguimiento: addDays(fEntrega, 15),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: generateEntityId('seg'),
        adopcion_id: adoptionId,
        fecha_contacto: addDays(fEntrega, 15),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control 15 días: finalización de período crítico de adaptación y correa.',
        proxima_fecha_seguimiento: addDays(fEntrega, 30),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: generateEntityId('seg'),
        adopcion_id: adoptionId,
        fecha_contacto: addDays(fEntrega, 30),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control 1er mes: rutina afianzada y compromiso de castración si aplica.',
        proxima_fecha_seguimiento: addDays(fEntrega, 90),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: generateEntityId('seg'),
        adopcion_id: adoptionId,
        fecha_contacto: addDays(fEntrega, 90),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control 3 meses: control general y refuerzo de vacunas.',
        proxima_fecha_seguimiento: addDays(fEntrega, 180),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: generateEntityId('seg'),
        adopcion_id: adoptionId,
        fecha_contacto: addDays(fEntrega, 180),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control semestral: fotos actualizadas y bienestar.',
        proxima_fecha_seguimiento: addDays(fEntrega, 365),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: generateEntityId('seg'),
        adopcion_id: adoptionId,
        fecha_contacto: addDays(fEntrega, 365),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control 1er año: consolidación total del vínculo.',
        proxima_fecha_seguimiento: null,
        completado: false,
        created_at: new Date().toISOString()
      }
    ];

    setAdopciones(prev => [newAdoption, ...prev]);
    setSeguimientos(prev => [...scheduledFollowups, ...prev]);

    const anim = animales.find(a => a.id === data.animal_id);
    const adop = adoptantes.find(ad => ad.id === data.adoptante_id);
    logAudit('Nueva adopción concretada', 'adopciones', `${anim?.nombre_actual || ''} adoptado/a por ${adop?.nombre_apellido || ''}`);

    syncItemUpsert('adopciones', newAdoption);
    syncBatchUpsert(scheduledFollowups.map(item => ({ collection: 'seguimientos', item })));
    return newAdoption;
  };

  const updateAdopcion = (id, data) => {
    setAdopciones(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...data, updated_at: new Date().toISOString() };
        syncItemUpsert('adopciones', updated);
        return updated;
      }
      return a;
    }));
    logAudit('Actualización de adopción', 'adopciones', `Adopción #${id}`);
  };

  // =================== SEGUIMIENTOS ===================
  const addSeguimiento = (data) => {
    const newSeg = {
      ...data,
      id: generateEntityId('seg'),
      created_at: new Date().toISOString(),
      completado: true
    };
    setSeguimientos(prev => [newSeg, ...prev]);
    logAudit('Registro de seguimiento posadopción', 'seguimientos', `Control ${data.fecha_contacto} (${data.estado_general})`);
    syncItemUpsert('seguimientos', newSeg);
    return newSeg;
  };

  const updateSeguimiento = (id, data) => {
    setSeguimientos(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...data, updated_at: new Date().toISOString() };
        syncItemUpsert('seguimientos', updated);
        return updated;
      }
      return s;
    }));
  };

  // =================== EVENTOS DE SALUD ===================
  const addEventoSalud = (data) => {
    const newEvent = {
      ...data,
      id: generateEntityId('salud'),
      created_at: new Date().toISOString()
    };
    setEventosSalud(prev => [newEvent, ...prev]);
    const anim = animales.find(a => a.id === data.animal_id);
    logAudit('Registro de evento veterinario', 'eventos_salud', `${data.tipo_evento} - ${anim?.nombre_actual || ''}`);
    syncItemUpsert('eventos_salud', newEvent);
    return newEvent;
  };

  const updateEventoSalud = (id, data) => {
    setEventosSalud(prev => prev.map(e => {
      if (e.id === id) {
        const updated = { ...e, ...data, updated_at: new Date().toISOString() };
        syncItemUpsert('eventos_salud', updated);
        return updated;
      }
      return e;
    }));
  };

  const deleteEventoSalud = (id) => {
    setEventosSalud(prev => prev.filter(e => e.id !== id));
    syncItemDelete('eventos_salud', id);
  };

  // =================== REPORTES DE CALLE ===================
  const addReporteCalle = (data) => {
    const newReport = {
      ...data,
      id: generateEntityId('rep'),
      estado_reporte: 'nuevo',
      created_at: new Date().toISOString()
    };
    setReportesCalle(prev => [newReport, ...prev]);
    logAudit('Nuevo reporte de calle recibido', 'reportes_calle', newReport.direccion_aproximada || 'Alerta comunitaria');
    syncItemUpsert('reportes_calle', newReport);
    return newReport;
  };

  const updateReporteCalle = (id, data) => {
    setReportesCalle(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...data, updated_at: new Date().toISOString() };
        syncItemUpsert('reportes_calle', updated);
        return updated;
      }
      return r;
    }));
    logAudit('Actualización de reporte de calle', 'reportes_calle', `Reporte #${id}`);
  };

  const convertReportToAnimal = (reporteId) => {
    const reporte = reportesCalle.find(r => r.id === reporteId);
    if (!reporte) return null;

    const newAnimal = addAnimal({
      nombre_actual: `Rescatado ${reporte.direccion_aproximada?.split(',')[0] || 'Calle'}`,
      especie: 'perro',
      sexo: 'hembra',
      estado_caso: 'rescatado',
      fecha_rescate: new Date().toISOString().split('T')[0],
      ubicacion_rescate: reporte.direccion_aproximada,
      latitud: reporte.latitud,
      longitud: reporte.longitud,
      foto_portada: reporte.fotos?.[0] || '',
      galeria: reporte.fotos ? reporte.fotos.map((url, idx) => ({
        id: `g-${idx}`,
        url,
        categoria: 'rescate',
        fecha: new Date().toISOString().split('T')[0],
        notas: 'Foto tomada en el reporte inicial de calle'
      })) : [],
      notas_conducta: reporte.descripcion,
      rescatista_a_cargo: currentUser?.id
    });

    updateReporteCalle(reporteId, {
      estado_reporte: 'resuelto',
      animal_id: newAnimal.id,
      fecha_resolucion: new Date().toISOString(),
      rescatista_asignada: currentUser?.id
    });

    return newAnimal;
  };

  const bulkImportAnimals = (importedList) => {
    const prepared = importedList.map((item, idx) => ({
      ...item,
      id: generateEntityId('anim_imp'),
      codigo_interno: item.codigo_interno || generateAnimalCode(item.especie || 'perro'),
      archivado: false,
      created_at: new Date().toISOString()
    }));
    setAnimales(prev => [...prepared, ...prev]);
    logAudit('Importación masiva de animales', 'animales', `${prepared.length} registros`);
    syncBatchUpsert(prepared.map(item => ({ collection: 'animales', item })));
    return prepared.length;
  };

  const bulkImportAdopters = (importedList) => {
    const prepared = importedList.map((item, idx) => ({
      ...item,
      id: generateEntityId('adop_imp'),
      archivado: false,
      created_at: new Date().toISOString()
    }));
    setAdoptantes(prev => [...prepared, ...prev]);
    logAudit('Importación masiva de adoptantes', 'adoptantes', `${prepared.length} registros`);
    syncBatchUpsert(prepared.map(item => ({ collection: 'adoptantes', item })));
    return prepared.length;
  };

  const addNoticia = (noticiaData) => {
    const newNoticia = {
      id: generateEntityId('noticia'),
      ...noticiaData,
      fecha: new Date().toLocaleDateString('es-AR'),
      autor: currentUser?.nombre || 'Administración',
      publicado: true,
      created_at: new Date().toISOString()
    };
    setNoticias(prev => [newNoticia, ...prev]);
    logAudit('Publicación de noticia', 'noticias', newNoticia.titulo);
    syncItemUpsert('noticias', newNoticia);
    return newNoticia;
  };

  const updateNoticia = (id, data) => {
    setNoticias(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, ...data, updated_at: new Date().toISOString() };
        syncItemUpsert('noticias', updated);
        return updated;
      }
      return n;
    }));
    logAudit('Actualización de noticia', 'noticias', data.titulo || id);
  };

  const deleteNoticia = (id) => {
    const found = noticias.find(n => n.id === id);
    setNoticias(prev => prev.filter(n => n.id !== id));
    logAudit('Eliminación de noticia', 'noticias', found?.titulo || id);
    syncItemDelete('noticias', id);
  };

  const toggleNoticiaPublicada = (id) => {
    setNoticias(prev => prev.map(n => {
      if (n.id === id) {
        const nuevoEstado = !n.publicado;
        const updated = { ...n, publicado: nuevoEstado, updated_at: new Date().toISOString() };
        logAudit(nuevoEstado ? 'Publicación de noticia en portal' : 'Despublicación de noticia del portal', 'noticias', n.titulo);
        syncItemUpsert('noticias', updated);
        return updated;
      }
      return n;
    }));
  };

  const updateConfigPortal = (newConfig) => {
    setConfigPortal(prev => {
      const updated = { ...prev, ...newConfig, updated_at: new Date().toISOString() };
      logAudit('Actualización de configuración del portal público', 'configuracion', 'Portal Público');
      syncItemUpsert('config_portal', { id: 'singleton', ...updated });
      return updated;
    });
  };

  const addMensajeSistema = (msgData) => {
    const newMsg = {
      id: generateEntityId('msg'),
      remitente_nombre: currentUser?.nombre || 'Superadministrador Técnico',
      remitente_rol: currentUser?.rol || 'Superadministrador',
      remitente_email: currentUser?.email || 'martinchiacchio.seg@gmail.com',
      destinatario: msgData.destinatario || 'Administración y Coordinación de Rescate',
      asunto: msgData.asunto || 'Comunicado Oficial del Sistema',
      categoria: msgData.categoria || 'Aviso General',
      prioridad: msgData.prioridad || 'Media',
      fecha: new Date().toLocaleDateString('es-AR'),
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      leido: false,
      resumen: msgData.resumen || '',
      contenido_detallado: msgData.contenido_detallado || [],
      created_at: new Date().toISOString()
    };
    setMensajesSistema(prev => [newMsg, ...prev]);
    logAudit('Envío de mensaje del sistema', 'mensajes_sistema', newMsg.asunto);
    syncItemUpsert('mensajes_sistema', newMsg);
    return newMsg;
  };

  const marcarMensajeLeido = (id) => {
    setMensajesSistema(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, leido: true };
        syncItemUpsert('mensajes_sistema', updated);
        return updated;
      }
      return m;
    }));
  };

  const deleteMensajeSistema = (id) => {
    setMensajesSistema(prev => prev.filter(m => m.id !== id));
    logAudit('Eliminación de mensaje del sistema', 'mensajes_sistema', id);
    syncItemDelete('mensajes_sistema', id);
  };

  return (
    <DataContext.Provider
      value={{
        animales,
        adoptantes,
        adopciones,
        seguimientos,
        eventosSalud,
        reportesCalle,
        auditoria,
        noticias,
        mensajesSistema,
        configPortal,
        syncStatus,
        lastSyncTime,
        lastRevision,
        syncWithServer,
        addAnimal,
        updateAnimal,
        archiveAnimal,
        addAdoptante,
        updateAdoptante,
        archiveAdoptante,
        addAdopcion,
        updateAdopcion,
        addSeguimiento,
        updateSeguimiento,
        addEventoSalud,
        updateEventoSalud,
        deleteEventoSalud,
        addReporteCalle,
        updateReporteCalle,
        convertReportToAnimal,
        bulkImportAnimals,
        bulkImportAdopters,
        addNoticia,
        updateNoticia,
        deleteNoticia,
        toggleNoticiaPublicada,
        updateConfigPortal,
        addMensajeSistema,
        marcarMensajeLeido,
        deleteMensajeSistema,
        logAudit,
        generateAnimalCode
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
