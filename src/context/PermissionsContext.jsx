import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ROLES_INICIALES, can, canViewSensitiveData, PERMISO_DATOS_SENSIBLES } from '../lib/permissions';

const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('patita_roles');
    return saved ? JSON.parse(saved) : ROLES_INICIALES;
  });

  useEffect(() => {
    localStorage.setItem('patita_roles', JSON.stringify(roles));
  }, [roles]);

  /**
   * Helper para verificar permisos del usuario activo
   */
  const hasPermission = (modulo, accion = 'ver') => {
    return can(currentUser, modulo, accion, roles);
  };

  /**
   * Helper para verificar acceso a DNI y datos sensibles
   */
  const canAccessSensitiveData = () => {
    return canViewSensitiveData(currentUser, roles);
  };

  /**
   * Guardar o actualizar rol personalizado
   */
  const saveRole = (roleData) => {
    if (roleData.id) {
      setRoles(prev => prev.map(r => r.id === roleData.id ? { ...r, ...roleData } : r));
    } else {
      const newRole = {
        ...roleData,
        id: `rol-custom-${Date.now()}`,
        es_sistema: false,
      };
      setRoles(prev => [...prev, newRole]);
    }
  };

  /**
   * Eliminar rol (solo si no es de sistema)
   */
  const deleteRole = (roleId) => {
    setRoles(prev => prev.filter(r => r.id !== roleId || r.es_sistema));
  };

  return (
    <PermissionsContext.Provider
      value={{
        roles,
        hasPermission,
        canAccessSensitiveData,
        saveRole,
        deleteRole,
        PERMISO_DATOS_SENSIBLES
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionsContext);
