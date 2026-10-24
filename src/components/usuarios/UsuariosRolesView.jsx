import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { MODULOS, ACCIONES, PERMISO_DATOS_SENSIBLES } from '../../lib/permissions';
import { formatDate } from '../../lib/formatters';
import { downloadManualAdministradorPdf } from '../../services/manualPdfService';
import { ModalCompartirDossier } from '../superadmin/ModalCompartirDossier';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  KeyRound, 
  Check, 
  X, 
  Lock, 
  Edit, 
  Trash2, 
  Power, 
  Info,
  ShieldAlert,
  Download,
  Sparkles,
  Share2
} from 'lucide-react';

export function UsuariosRolesView() {
  const { currentUser, users, createUser, updateUser, resetUserPassword } = useAuth();
  const { roles, saveRole, deleteRole } = usePermissions();

  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'roles'
  const [downloadingManual, setDownloadingManual] = useState(false);
  const [showSuperadminShare, setShowSuperadminShare] = useState(false);

  // Modales
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [tempPasswordModal, setTempPasswordModal] = useState({ isOpen: false, email: '', pass: '' });

  // Formulario nuevo usuario
  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol_id: roles.find(r => r.nombre === 'Rescatista')?.id || roles[0]?.id
  });

  const isSuperadmin = currentUser?.rol === 'Superadministrador';

  // Filtrar usuarios: el admin normal no puede modificar al superadministrador
  const visibleUsers = users.filter(u => {
    if (!isSuperadmin && u.rol === 'Superadministrador') {
      return false; // El administrador no ve ni puede alterar al superadministrador técnico
    }
    return true;
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.nombre || !userForm.email) return;

    const selectedRole = roles.find(r => r.id === userForm.rol_id);
    const result = await createUser({
      ...userForm,
      rolNombre: selectedRole?.nombre || 'Rescatista'
    });

    setShowNewUserModal(false);
    setUserForm({
      nombre: '',
      email: '',
      telefono: '',
      rol_id: roles.find(r => r.nombre === 'Rescatista')?.id || roles[0]?.id
    });

    // Mostrar contraseña temporal CSPRNG UNA SOLA VEZ
    setTempPasswordModal({
      isOpen: true,
      email: result.user?.email || userForm.email,
      pass: result.oneTimeTempPassword,
      revokedPasskeys: 0
    });
  };

  const handleResetPassword = async (user) => {
    if (
      !window.confirm(
        `¿Restablecer el acceso de ${user.nombre} (${user.email})?\n\nSe revocarán todas sus Passkeys biométricas registradas (por pérdida o cambio de dispositivo) y se generará una nueva clave temporal aleatoria válida por 48 horas.`
      )
    ) {
      return;
    }
    const result = await resetUserPassword(user.id, { revokePasskeys: true });
    setTempPasswordModal({
      isOpen: true,
      email: user.email,
      pass: result.oneTimeTempPassword,
      revokedPasskeys: result.revokedPasskeysCount || 0
    });
  };

  const handleToggleUserActive = (user) => {
    updateUser(user.id, { activo: !user.activo });
  };

  // Editor de rol
  const handleOpenRoleEditor = (role = null) => {
    if (role) {
      setEditingRole(JSON.parse(JSON.stringify(role)));
    } else {
      // Nuevo rol en blanco
      const blankPerms = {};
      MODULOS.forEach(m => {
        blankPerms[m.id] = { ver: true, crear: false, editar: false, archivar: false, exportar: false };
      });
      blankPerms[PERMISO_DATOS_SENSIBLES] = false;

      setEditingRole({
        nombre: '',
        descripcion: '',
        es_sistema: false,
        permisos: blankPerms
      });
    }
    setShowRoleModal(true);
  };

  const handleToggleRolePermission = (moduloId, accionId) => {
    if (!editingRole) return;
    const current = editingRole.permisos?.[moduloId]?.[accionId] || false;
    setEditingRole({
      ...editingRole,
      permisos: {
        ...editingRole.permisos,
        [moduloId]: {
          ...(editingRole.permisos?.[moduloId] || {}),
          [accionId]: !current
        }
      }
    });
  };

  const handleToggleSensitiveData = () => {
    if (!editingRole) return;
    const current = Boolean(editingRole.permisos?.[PERMISO_DATOS_SENSIBLES]);
    setEditingRole({
      ...editingRole,
      permisos: {
        ...editingRole.permisos,
        [PERMISO_DATOS_SENSIBLES]: !current
      }
    });
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!editingRole?.nombre) return;
    saveRole(editingRole);
    setShowRoleModal(false);
  };

  const handleDownloadManual = async () => {
    setDownloadingManual(true);
    try {
      await downloadManualAdministradorPdf();
    } catch (err) {
      console.error(err);
      alert('Error al generar el manual en PDF.');
    } finally {
      setDownloadingManual(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-patita-600" />
            <span>Usuarios, Roles y Permisos Granulares</span>
          </h1>
          <p className="text-xs text-stone-500">
            Control de accesos y matriz visual de permisos por módulo y acción
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Opción de descarga del manual de usuario en PDF */}
          <button
            onClick={handleDownloadManual}
            disabled={downloadingManual}
            className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm border border-stone-300 shadow-sm flex items-center gap-1.5 transition-all"
            title="Descargar Manual Operativo Completo en PDF"
          >
            <Download className="w-4 h-4 text-lumia-600" />
            <span>{downloadingManual ? 'Descargando...' : 'Manual (PDF)'}</span>
          </button>

          {/* Opción exclusiva de Superadministrador para compartir enlace */}
          {isSuperadmin && (
            <button
              onClick={() => setShowSuperadminShare(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
              title="Compartir Enlace Oficial de Funciones del Sistema (Exclusivo Superadmin)"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Compartir Funciones</span>
            </button>
          )}

          {activeTab === 'usuarios' ? (
            <button
              onClick={() => setShowNewUserModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-patita-600/30 flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenRoleEditor(null)}
              className="px-4 py-2.5 rounded-2xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-patita-600/30 flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Crear Rol Personalizado</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs sm:text-sm font-bold gap-3">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'usuarios' ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestión de Usuarios ({visibleUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'roles' ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matriz de Roles y Permisos ({roles.length})</span>
        </button>
      </div>

      {/* ================= PESTAÑA: USUARIOS ================= */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Usuario</th>
                    <th className="py-3.5 px-4">Rol Asignado</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Primer Ingreso</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {visibleUsers.map(user => {
                    const isSelf = user.id === currentUser?.id;
                    const isSuper = user.rol === 'Superadministrador';

                    return (
                      <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs">
                              {user.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">{user.nombre}</p>
                              <p className="text-[11px] text-stone-500">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant={isSuper ? 'danger' : user.rol === 'Administrador' ? 'primary' : 'info'}>
                            {user.rol}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            user.activo ? 'text-emerald-700' : 'text-rose-600'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${user.activo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {user.activo ? 'Activo' : 'Desactivado'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {user.must_change_password ? (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Cambio pendiente
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-medium">✓ Cambiada</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right space-x-1">
                          {/* Desactivar / Activar usuario */}
                          {!isSelf && !isSuper && (
                            <button
                              onClick={() => handleToggleUserActive(user)}
                              className={`p-1.5 rounded-xl transition-colors ${
                                user.activo ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.activo ? 'Desactivar acceso (sin borrar registros)' : 'Reactivar acceso'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}

                          {/* Restablecer Contraseña y Revocar Passkeys */}
                          {!isSuper && (
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="px-2.5 py-1.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                              title="Revocar Passkeys biométricas y emitir nueva clave temporal (48h)"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Restablecer / Revocar Passkeys</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= PESTAÑA: MATRIZ DE ROLES Y PERMISOS ================= */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(role => {
              const isSys = role.es_sistema;
              const hasSens = role.permisos?.[PERMISO_DATOS_SENSIBLES];

              return (
                <div 
                  key={role.id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-stone-900 text-base">{role.nombre}</h3>
                      {isSys && (
                        <Badge variant="default" className="text-[10px]">Rol de Sistema</Badge>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 leading-relaxed min-h-[36px]">
                      {role.descripcion}
                    </p>

                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-medium">Datos Sensibles Adoptantes:</span>
                        <span className={`font-bold ${hasSens ? 'text-emerald-700' : 'text-stone-400'}`}>
                          {hasSens ? '✓ Habilitado' : '✗ Protegido'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenRoleEditor(role)}
                      className="text-xs font-bold text-patita-600 hover:text-patita-700 flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{isSys ? 'Ver Permisos' : 'Editar Permisos'}</span>
                    </button>

                    {!isSys && (
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold p-1"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Nuevo Usuario */}
      {showNewUserModal && (
        <Modal
          isOpen={showNewUserModal}
          onClose={() => setShowNewUserModal(false)}
          title="Alta de Nuevo Usuario del Equipo"
          subtitle="Se le asignará una contraseña temporal y deberá cambiarla en el primer ingreso"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={userForm.nombre}
                onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                placeholder="Ej: Laura Benítez"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="laura@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono / Celular</label>
              <input
                type="text"
                value={userForm.telefono}
                onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })}
                placeholder="+54 9 11 ..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Rol a Asignar</label>
              <select
                value={userForm.rol_id}
                onChange={(e) => setUserForm({ ...userForm, rol_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
              >
                {roles
                  .filter(r => isSuperadmin || r.nombre !== 'Superadministrador')
                  .map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowNewUserModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-xs shadow-md shadow-patita-600/30"
              >
                Crear Usuario
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Matriz de Permisos del Rol */}
      {showRoleModal && editingRole && (
        <Modal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          title={`Configuración de Permisos: ${editingRole.nombre || 'Nuevo Rol'}`}
          subtitle="Tildá o destildá de manera granular las acciones permitidas para este rol"
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSaveRole} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre del Rol *</label>
                <input
                  type="text"
                  required
                  disabled={editingRole.es_sistema}
                  value={editingRole.nombre}
                  onChange={(e) => setEditingRole({ ...editingRole, nombre: e.target.value })}
                  placeholder="Ej: Voluntaria de Tránsito"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 disabled:bg-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Descripción</label>
                <input
                  type="text"
                  disabled={editingRole.es_sistema}
                  value={editingRole.descripcion}
                  onChange={(e) => setEditingRole({ ...editingRole, descripcion: e.target.value })}
                  placeholder="Responsabilidades y alcance"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 disabled:bg-stone-100"
                />
              </div>
            </div>

            {/* Permiso especial de datos sensibles */}
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Ver datos sensibles de adoptantes</h4>
                  <p className="text-[11px] text-amber-800">
                    Permite ver DNI, fotos de DNI y domicilio completo (Ley 25.326).
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                disabled={editingRole.es_sistema}
                checked={Boolean(editingRole.permisos?.[PERMISO_DATOS_SENSIBLES])}
                onChange={handleToggleSensitiveData}
                className="w-5 h-5 text-patita-600 rounded border-stone-300 focus:ring-patita-500"
              />
            </div>

            {/* Matriz Granular por Módulo y Acción */}
            <div className="border border-stone-200 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Módulo</th>
                      {ACCIONES.map(acc => (
                        <th key={acc.id} className="py-2.5 px-3 text-center">{acc.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {MODULOS.map(mod => (
                      <tr key={mod.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-4 font-bold text-stone-800">{mod.label}</td>
                        {ACCIONES.map(acc => {
                          const isChecked = editingRole.es_sistema 
                            ? (editingRole.nombre === 'Superadministrador' || editingRole.nombre === 'Administrador')
                            : Boolean(editingRole.permisos?.[mod.id]?.[acc.id]);

                          return (
                            <td key={acc.id} className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                disabled={editingRole.es_sistema}
                                checked={isChecked}
                                onChange={() => handleToggleRolePermission(mod.id, acc.id)}
                                className="w-4 h-4 text-patita-600 rounded border-stone-300 focus:ring-patita-500 disabled:opacity-50"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Cerrar
              </button>
              {!editingRole.es_sistema && (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-xs shadow-md shadow-patita-600/30"
                >
                  Guardar Permisos
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Aviso de Contraseña Temporal Generada (Se muestra UNA SOLA VEZ) */}
      {tempPasswordModal.isOpen && (
        <Modal
          isOpen={tempPasswordModal.isOpen}
          onClose={() => setTempPasswordModal({ isOpen: false, email: '', pass: '', revokedPasskeys: 0 })}
          title="Clave Temporal de Un Solo Uso (48h)"
          subtitle="Esta contraseña aleatoria se muestra UNA SOLA VEZ y no volverá a ser visible"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-patita-50 border border-patita-200 text-center space-y-2.5">
              <p className="text-xs text-stone-600 font-medium">
                Clave temporal generada para <strong>{tempPasswordModal.email}</strong>:
              </p>
              <div className="py-2.5 px-4 rounded-2xl bg-white border border-patita-300 font-mono font-extrabold text-lg text-patita-700 select-all tracking-wider">
                {tempPasswordModal.pass}
              </div>
              <div className="text-[11px] text-patita-900 space-y-1 text-left bg-white/70 p-3 rounded-2xl border border-patita-200/70">
                <p>⏱️ <strong>Caducidad estricta:</strong> Vence a las <strong>48 horas</strong> de emitida.</p>
                <p>🔒 <strong>Un solo uso:</strong> Al iniciar sesión obligará a definir una clave definitiva de al menos 10 caracteres.</p>
                <p>👁️ <strong>Copiala ahora:</strong> Por seguridad solo se guarda su hash criptográfico y no podrá consultarse después de cerrar esta ventana.</p>
                {tempPasswordModal.revokedPasskeys > 0 && (
                  <p className="text-rose-700 font-bold">
                    ✓ Se revocaron {tempPasswordModal.revokedPasskeys} dispositivo(s) Passkey vinculados previamente.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(tempPasswordModal.pass);
                }}
                className="flex-1 py-2.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs"
              >
                Copiar clave
              </button>
              <button
                type="button"
                onClick={() => setTempPasswordModal({ isOpen: false, email: '', pass: '', revokedPasskeys: 0 })}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal exclusivo de Superadministrador para compartir enlace */}
      {showSuperadminShare && (
        <ModalCompartirDossier
          isOpen={showSuperadminShare}
          onClose={() => setShowSuperadminShare(false)}
        />
      )}
    </div>
  );
}
