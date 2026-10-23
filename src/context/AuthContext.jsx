import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_USERS } from '../lib/seedData';
import { ROLES_INICIALES } from '../lib/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('patita_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('patita_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Guardar usuarios en storage local para persistir cambios en demo
  useEffect(() => {
    localStorage.setItem('patita_users', JSON.stringify(users));
  }, [users]);

  // Guardar usuario autenticado
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('patita_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('patita_current_user');
    }
  }, [currentUser]);

  // Escuchar cambios de sesión de Supabase si está configurado
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Cargar perfil desde public.perfiles
        const { data: profile } = await supabase
          .from('perfiles')
          .select('*, roles(nombre)')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: profile.id,
            nombre: profile.nombre,
            email: profile.email,
            telefono: profile.telefono,
            rol: profile.roles?.nombre || 'Rescatista',
            rol_id: profile.rol_id,
            activo: profile.activo,
            must_change_password: profile.must_change_password,
          });
        }
      } else {
        // setCurrentUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  /**
   * Inicio de sesión
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true };
      } else {
        // Validación local para demo y cuentas iniciales solicitadas
        const normalizedEmail = email.trim().toLowerCase();
        
        // Comprobación de credenciales iniciales
        if (normalizedEmail === 'martinchiacchio.seg@gmail.com') {
          const user = users.find(u => u.email === normalizedEmail) || INITIAL_USERS[0];
          // Permitir contraseña inicial o la que haya configurado
          const validPass = user.custom_password ? user.custom_password === password : password === 'Chiacchio@1938';
          if (!validPass) {
            throw new Error('Contraseña incorrecta para el Superadministrador.');
          }
          setCurrentUser(user);
          return { success: true, mustChange: user.must_change_password };
        }

        if (normalizedEmail === 'genesisbustamante88@gmail.com') {
          const user = users.find(u => u.email === normalizedEmail) || INITIAL_USERS[1];
          const validPass = user.custom_password ? user.custom_password === password : password === '123456';
          if (!validPass) {
            throw new Error('Contraseña incorrecta para la Administradora.');
          }
          setCurrentUser(user);
          return { success: true, mustChange: user.must_change_password };
        }

        // Cualquier otro usuario creado en la app
        const found = users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (!found) {
          throw new Error('No existe una cuenta registrada con ese correo electrónico.');
        }
        if (!found.activo) {
          throw new Error('Esta cuenta ha sido desactivada. Consultá con la administradora.');
        }

        const validPass = found.custom_password ? found.custom_password === password : password === '123456';
        if (!validPass) {
          throw new Error('Contraseña incorrecta.');
        }

        setCurrentUser(found);
        return { success: true, mustChange: found.must_change_password };
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambio obligatorio de contraseña
   * Requisitos: 8+ caracteres, distinta a 123456, distinta a la anterior
   */
  const changePassword = async (oldPassword, newPassword) => {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
    }
    if (newPassword === '123456') {
      throw new Error('Por seguridad no podés usar "123456" como nueva contraseña.');
    }
    if (oldPassword && newPassword === oldPassword) {
      throw new Error('La nueva contraseña debe ser diferente a la anterior.');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      // Actualizar bandera en perfiles
      await supabase.from('perfiles').update({ must_change_password: false }).eq('id', currentUser.id);
    }

    // Actualizar estado local
    const updatedUser = {
      ...currentUser,
      must_change_password: false,
      custom_password: newPassword
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    return { success: true };
  };

  /**
   * Cierre de sesión
   */
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  /**
   * Creación de usuario por administrador
   */
  const createUser = async ({ nombre, email, telefono, rol_id, rolNombre }) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      nombre,
      email: email.trim().toLowerCase(),
      telefono: telefono || '',
      rol: rolNombre || 'Rescatista',
      rol_id,
      activo: true,
      must_change_password: true,
      custom_password: 'temporal-patita',
      created_at: new Date().toISOString(),
      creado_por: currentUser?.nombre || 'Administrador'
    };

    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  /**
   * Actualizar usuario
   */
  const updateUser = async (userId, data) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...data }));
    }
  };

  /**
   * Restablecer contraseña de usuario (por admin)
   */
  const resetUserPassword = async (userId) => {
    const tempPass = 'temporal' + Math.floor(1000 + Math.random() * 9000);
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      must_change_password: true,
      custom_password: tempPass
    } : u));
    return tempPass;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        users,
        login,
        logout,
        changePassword,
        createUser,
        updateUser,
        resetUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
