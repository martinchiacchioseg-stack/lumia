import React, { createContext, useContext, useState, useEffect } from 'react';
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

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { currentUser } = useAuth();

  // Estados principales de datos
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

  // Guardar en localStorage
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

  /**
   * Registrar evento en la bitácora de auditoría
   */
  const logAudit = (accion, tabla_afectada, registro_nombre) => {
    const newLog = {
      id: `aud-${Date.now()}`,
      usuario_nombre: currentUser?.nombre || 'Usuario del sistema',
      accion,
      tabla_afectada,
      registro_nombre,
      fecha: new Date().toISOString()
    };
    setAuditoria(prev => [newLog, ...prev]);
  };

  /**
   * Generar código interno único (DOG-003, CAT-002, etc.)
   */
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
      id: `anim-${Date.now()}`,
      codigo_interno,
      archivado: false,
      created_at: new Date().toISOString(),
      galeria: data.galeria || []
    };
    setAnimales(prev => [newAnimal, ...prev]);
    logAudit('Registro de rescate', 'animales', `${newAnimal.nombre_actual} (${codigo_interno})`);
    return newAnimal;
  };

  const updateAnimal = (id, data) => {
    setAnimales(prev => prev.map(a => a.id === id ? { ...a, ...data, updated_at: new Date().toISOString() } : a));
    const current = animales.find(a => a.id === id);
    logAudit('Modificación de ficha', 'animales', current?.nombre_actual || id);
  };

  const archiveAnimal = (id) => {
    setAnimales(prev => prev.map(a => a.id === id ? { ...a, archivado: true } : a));
    const current = animales.find(a => a.id === id);
    logAudit('Archivado de animal', 'animales', current?.nombre_actual || id);
  };

  // =================== ADOPTANTES ===================
  const addAdoptante = (data) => {
    const newAdopter = {
      ...data,
      id: `adop-${Date.now()}`,
      archivado: false,
      created_at: new Date().toISOString()
    };
    setAdoptantes(prev => [newAdopter, ...prev]);
    logAudit('Alta de adoptante', 'adoptantes', newAdopter.nombre_apellido);
    return newAdopter;
  };

  const updateAdoptante = (id, data) => {
    setAdoptantes(prev => prev.map(a => a.id === id ? { ...a, ...data, updated_at: new Date().toISOString() } : a));
    const current = adoptantes.find(a => a.id === id);
    logAudit('Actualización de adoptante', 'adoptantes', current?.nombre_apellido || id);
  };

  const archiveAdoptante = (id) => {
    setAdoptantes(prev => prev.map(a => a.id === id ? { ...a, archivado: true } : a));
    const current = adoptantes.find(a => a.id === id);
    logAudit('Archivado de adoptante', 'adoptantes', current?.nombre_apellido || id);
  };

  // =================== ADOPCIONES Y CALENDARIO AUTOMÁTICO ===================
  const addAdopcion = (data) => {
    const newAdoption = {
      ...data,
      id: `adopcion-${Date.now()}`,
      estado_adopcion: 'activo en seguimiento',
      created_at: new Date().toISOString()
    };

    // Actualizar estado del animal a adoptado
    updateAnimal(data.animal_id, { estado_caso: 'adoptado' });

    // Generar calendario de seguimientos automáticamente:
    // 48-72 hs, 15 días, 1 mes, 3 meses, 6 meses, 1 año
    const fEntrega = new Date(data.fecha_entrega || new Date());
    const addDays = (d, days) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy.toISOString().split('T')[0];
    };

    const scheduledFollowups = [
      {
        id: `seg-${Date.now()}-1`,
        adopcion_id: newAdoption.id,
        fecha_contacto: addDays(fEntrega, 3),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control inicial a las 48-72 hs: chequeo de adaptación inmediata, apetito y descanso.',
        proxima_fecha_seguimiento: addDays(fEntrega, 15),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: `seg-${Date.now()}-2`,
        adopcion_id: newAdoption.id,
        fecha_contacto: addDays(fEntrega, 15),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control a los 15 días: finalización de período crítico de adaptación y paseos con correa.',
        proxima_fecha_seguimiento: addDays(fEntrega, 30),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: `seg-${Date.now()}-3`,
        adopcion_id: newAdoption.id,
        fecha_contacto: addDays(fEntrega, 30),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control al 1er mes: rutina afianzada y verificación de compromiso de castración si aplica.',
        proxima_fecha_seguimiento: addDays(fEntrega, 90),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: `seg-${Date.now()}-4`,
        adopcion_id: newAdoption.id,
        fecha_contacto: addDays(fEntrega, 90),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control a los 3 meses: control general y refuerzo de vacunas.',
        proxima_fecha_seguimiento: addDays(fEntrega, 180),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: `seg-${Date.now()}-5`,
        adopcion_id: newAdoption.id,
        fecha_contacto: addDays(fEntrega, 180),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control semestral: fotos actualizadas y bienestar.',
        proxima_fecha_seguimiento: addDays(fEntrega, 365),
        completado: false,
        created_at: new Date().toISOString()
      },
      {
        id: `seg-${Date.now()}-6`,
        adopcion_id: newAdoption.id,
        fecha_contacto: addDays(fEntrega, 365),
        tipo_contacto: 'WhatsApp',
        estado_general: 'normal',
        observaciones: 'Control al 1er año de adopción: consolidación total del vínculo.',
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

    return newAdoption;
  };

  const updateAdopcion = (id, data) => {
    setAdopciones(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    logAudit('Actualización de adopción', 'adopciones', `Adopción #${id}`);
  };

  // =================== SEGUIMIENTOS ===================
  const addSeguimiento = (data) => {
    const newSeg = {
      ...data,
      id: `seg-${Date.now()}`,
      created_at: new Date().toISOString(),
      completado: true
    };
    setSeguimientos(prev => [newSeg, ...prev]);
    logAudit('Registro de seguimiento posadopción', 'seguimientos', `Control ${data.fecha_contacto} (${data.estado_general})`);
    return newSeg;
  };

  const updateSeguimiento = (id, data) => {
    setSeguimientos(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  // =================== EVENTOS DE SALUD ===================
  const addEventoSalud = (data) => {
    const newEvent = {
      ...data,
      id: `salud-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setEventosSalud(prev => [newEvent, ...prev]);
    const anim = animales.find(a => a.id === data.animal_id);
    logAudit('Registro de evento veterinario', 'eventos_salud', `${data.tipo_evento} - ${anim?.nombre_actual || ''}`);
    return newEvent;
  };

  const updateEventoSalud = (id, data) => {
    setEventosSalud(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteEventoSalud = (id) => {
    setEventosSalud(prev => prev.filter(e => e.id !== id));
  };

  // =================== REPORTES DE CALLE ===================
  const addReporteCalle = (data) => {
    const newReport = {
      ...data,
      id: `rep-${Date.now()}`,
      estado_reporte: 'nuevo',
      created_at: new Date().toISOString()
    };
    setReportesCalle(prev => [newReport, ...prev]);
    logAudit('Nuevo reporte de calle recibido', 'reportes_calle', newReport.direccion_aproximada || 'Alerta comunitaria');
    return newReport;
  };

  const updateReporteCalle = (id, data) => {
    setReportesCalle(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    logAudit('Actualización de reporte de calle', 'reportes_calle', `Reporte #${id}`);
  };

  // Convertir reporte de calle directamente a ficha de animal rescatado
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

    // Actualizar reporte con estado resuelto y vínculo
    updateReporteCalle(reporteId, {
      estado_reporte: 'resuelto',
      animal_id: newAnimal.id,
      fecha_resolucion: new Date().toISOString(),
      rescatista_asignada: currentUser?.id
    });

    return newAnimal;
  };

  // Carga masiva (Importación)
  const bulkImportAnimals = (importedList) => {
    const prepared = importedList.map((item, idx) => ({
      ...item,
      id: `anim-imp-${Date.now()}-${idx}`,
      codigo_interno: item.codigo_interno || generateAnimalCode(item.especie || 'perro'),
      archivado: false,
      created_at: new Date().toISOString()
    }));
    setAnimales(prev => [...prepared, ...prev]);
    logAudit('Importación masiva de animales', 'animales', `${prepared.length} registros`);
    return prepared.length;
  };

  const bulkImportAdopters = (importedList) => {
    const prepared = importedList.map((item, idx) => ({
      ...item,
      id: `adop-imp-${Date.now()}-${idx}`,
      archivado: false,
      created_at: new Date().toISOString()
    }));
    setAdoptantes(prev => [...prepared, ...prev]);
    logAudit('Importación masiva de adoptantes', 'adoptantes', `${prepared.length} registros`);
    return prepared.length;
  };

  /**
   * Gestión de Noticias y Publicaciones del Administrador
   */
  const addNoticia = (noticiaData) => {
    const newNoticia = {
      id: `noticia-${Date.now()}`,
      ...noticiaData,
      fecha: new Date().toLocaleDateString('es-AR'),
      autor: currentUser?.nombre || 'Administración',
      publicado: true,
      created_at: new Date().toISOString()
    };
    setNoticias(prev => [newNoticia, ...prev]);
    logAudit('Publicación de noticia', 'noticias', newNoticia.titulo);
    return newNoticia;
  };

  const updateNoticia = (id, data) => {
    setNoticias(prev => prev.map(n => n.id === id ? { ...n, ...data, updated_at: new Date().toISOString() } : n));
    logAudit('Actualización de noticia', 'noticias', data.titulo || id);
  };

  const deleteNoticia = (id) => {
    const found = noticias.find(n => n.id === id);
    setNoticias(prev => prev.filter(n => n.id !== id));
    logAudit('Eliminación de noticia', 'noticias', found?.titulo || id);
  };

  const toggleNoticiaPublicada = (id) => {
    setNoticias(prev => prev.map(n => {
      if (n.id === id) {
        const nuevoEstado = !n.publicado;
        logAudit(nuevoEstado ? 'Publicación de noticia en portal' : 'Despublicación de noticia del portal', 'noticias', n.titulo);
        return { ...n, publicado: nuevoEstado };
      }
      return n;
    }));
  };

  /**
   * Configuración del Portal Público (Superadministrador)
   */
  const updateConfigPortal = (newConfig) => {
    setConfigPortal(prev => {
      const updated = { ...prev, ...newConfig, updated_at: new Date().toISOString() };
      logAudit('Actualización de configuración del portal público', 'configuracion', 'Portal Público');
      return updated;
    });
  };

  /**
   * Gestión de Mensajes Oficiales del Sistema (Superadmin a Administrador)
   */
  const addMensajeSistema = (msgData) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
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
    return newMsg;
  };

  const marcarMensajeLeido = (id) => {
    setMensajesSistema(prev => prev.map(m => m.id === id ? { ...m, leido: true } : m));
  };

  const deleteMensajeSistema = (id) => {
    setMensajesSistema(prev => prev.filter(m => m.id !== id));
    logAudit('Eliminación de mensaje del sistema', 'mensajes_sistema', id);
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
