// Definición de Módulos, Acciones y Roles del sistema Patita Aliada

export const MODULOS = [
  { id: 'animales', label: 'Animales Rescatados', icon: 'Dog' },
  { id: 'adoptantes', label: 'Adoptantes y Familias', icon: 'Users' },
  { id: 'adopciones', label: 'Adopciones y Contratos', icon: 'HeartHandshake' },
  { id: 'seguimientos', label: 'Seguimientos Posadopción', icon: 'ClipboardCheck' },
  { id: 'salud', label: 'Libreta Sanitaria / Salud', icon: 'Stethoscope' },
  { id: 'reportes_calle', label: 'Reportes de Calle', icon: 'MapPin' },
  { id: 'import_export', label: 'Importación y Exportación', icon: 'FileSpreadsheet' },
  { id: 'estadisticas', label: 'Estadísticas e Informes', icon: 'BarChart3' },
  { id: 'usuarios', label: 'Usuarios y Permisos', icon: 'ShieldCheck' },
];

export const ACCIONES = [
  { id: 'ver', label: 'Ver' },
  { id: 'crear', label: 'Crear' },
  { id: 'editar', label: 'Editar' },
  { id: 'archivar', label: 'Archivar' },
  { id: 'exportar', label: 'Exportar' },
];

export const PERMISO_DATOS_SENSIBLES = 'ver_datos_sensibles_adoptantes';

// Roles predefinidos editables
export const ROLES_INICIALES = [
  {
    id: 'rol-superadmin',
    nombre: 'Superadministrador',
    descripcion: 'Dueño técnico del sistema. Acceso irrestricto a datos, roles y configuración.',
    es_sistema: true,
    permisos: {
      // Superadmin tiene todo garantizado
    }
  },
  {
    id: 'rol-admin',
    nombre: 'Administrador',
    descripcion: 'Rescatista responsable de la operación. Gestión completa operativa y de usuarios.',
    es_sistema: true,
    permisos: {
      animales: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      adoptantes: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      adopciones: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      seguimientos: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      salud: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      reportes_calle: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      import_export: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      estadisticas: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      usuarios: { ver: true, crear: true, editar: true, archivar: true, exportar: true },
      [PERMISO_DATOS_SENSIBLES]: true,
    }
  },
  {
    id: 'rol-rescatista',
    nombre: 'Rescatista',
    descripcion: 'Gestiona sus propios casos asignados, fichas veterinarias y controles posadopción.',
    es_sistema: false,
    permisos: {
      animales: { ver: true, crear: true, editar: true, archivar: false, exportar: true },
      adoptantes: { ver: true, crear: true, editar: false, archivar: false, exportar: false },
      adopciones: { ver: true, crear: true, editar: true, archivar: false, exportar: true },
      seguimientos: { ver: true, crear: true, editar: true, archivar: false, exportar: true },
      salud: { ver: true, crear: true, editar: true, archivar: false, exportar: true },
      reportes_calle: { ver: true, crear: true, editar: true, archivar: false, exportar: false },
      estadisticas: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      [PERMISO_DATOS_SENSIBLES]: false,
    }
  },
  {
    id: 'rol-colaboradora',
    nombre: 'Colaboradora',
    descripcion: 'Carga reportes de animales en la calle y consulta su estado de rescate.',
    es_sistema: false,
    permisos: {
      animales: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      reportes_calle: { ver: true, crear: true, editar: false, archivar: false, exportar: false },
      [PERMISO_DATOS_SENSIBLES]: false,
    }
  },
  {
    id: 'rol-solo-lectura',
    nombre: 'Solo lectura',
    descripcion: 'Visualización de fichas y métricas sin permisos de modificación ni borrado.',
    es_sistema: false,
    permisos: {
      animales: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      adoptantes: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      adopciones: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      seguimientos: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      salud: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      reportes_calle: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      estadisticas: { ver: true, crear: false, editar: false, archivar: false, exportar: false },
      [PERMISO_DATOS_SENSIBLES]: false,
    }
  }
];

/**
 * Evalúa si un usuario tiene permiso para un módulo y acción determinada
 */
export function can(user, modulo, accion = 'ver', roleList = ROLES_INICIALES) {
  if (!user || !user.activo) return false;

  // Superadministrador tiene acceso absoluto
  if (user.rol === 'Superadministrador' || user.rol_id === 'rol-superadmin') {
    return true;
  }

  // Administrador tiene acceso a todo excepto configuraciones exclusivas del superadmin
  if (user.rol === 'Administrador' || user.rol_id === 'rol-admin') {
    if (modulo === 'usuarios' && accion === 'superadmin') return false;
    return true;
  }

  // Buscar rol en la lista
  const role = roleList.find(r => r.id === user.rol_id || r.nombre === user.rol);
  if (!role || !role.permisos) return false;

  const modPerms = role.permisos[modulo];
  if (!modPerms) return false;

  return Boolean(modPerms[accion]);
}

/**
 * Evalúa si el usuario puede ver datos sensibles de adoptantes (DNI, fotos DNI, dirección completa)
 */
export function canViewSensitiveData(user, roleList = ROLES_INICIALES) {
  if (!user || !user.activo) return false;
  if (user.rol === 'Superadministrador' || user.rol === 'Administrador') return true;
  
  const role = roleList.find(r => r.id === user.rol_id || r.nombre === user.rol);
  if (!role || !role.permisos) return false;

  return Boolean(role.permisos[PERMISO_DATOS_SENSIBLES]);
}
