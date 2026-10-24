import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { INITIAL_USERS } from '../lib/seedData';

const AuthContext = createContext(null);

const COMMON_PASSWORDS_BLACKLIST = new Set([
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  '111111',
  '1111111111',
  '0000000000',
  'password',
  'password123',
  'contraseña',
  'contrasena',
  'qwertyuiop',
  'qwerty1234',
  'administrador',
  'superadmin',
  'rescatista',
  'patitaaliada',
  'temporal-patita',
  'lumia12345',
  'argentina1'
]);

const GENERIC_LOGIN_ERROR = 'Credenciales inválidas o cuenta temporalmente bloqueada.';
const TEMP_PASSWORD_TTL_MS = 48 * 60 * 60 * 1000; // 48 horas
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos
const MAX_FAILED_ATTEMPTS = 5;

/**
 * Generador criptográficamente seguro de contraseñas temporales (CSPRNG del navegador)
 * Mínimo 14 caracteres de alta entropía
 */
export function generateClientCsprngPassword(length = 14) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*+-=?';
  const all = upper + lower + digits + symbols;

  const randomValues = new Uint32Array(length * 2);
  window.crypto.getRandomValues(randomValues);

  const chars = [
    upper[randomValues[0] % upper.length],
    lower[randomValues[1] % lower.length],
    digits[randomValues[2] % digits.length],
    symbols[randomValues[3] % symbols.length]
  ];

  for (let i = 4; i < length; i++) {
    chars.push(all[randomValues[i] % all.length]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomValues[length + i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

/**
 * Valida la política de contraseña nueva (10+ caracteres, lista negra, sin nombre ni correo)
 */
export function validateClientPasswordPolicy(newPassword, { email = '', nombre = '', oldPassword = '' } = {}) {
  if (!newPassword || typeof newPassword !== 'string') {
    return { valid: false, message: 'Debés ingresar una contraseña válida.' };
  }
  if (newPassword.length < 10) {
    return { valid: false, message: 'La nueva contraseña debe tener al menos 10 caracteres.' };
  }
  const normalized = newPassword.toLowerCase().trim();
  if (COMMON_PASSWORDS_BLACKLIST.has(normalized) || /^(\d)\1+$/.test(normalized) || /^12345/.test(normalized)) {
    return {
      valid: false,
      message: 'Esta contraseña está en la lista de claves comunes prohibidas. Elegí una más segura.'
    };
  }
  if (oldPassword && newPassword === oldPassword) {
    return {
      valid: false,
      message: 'La nueva contraseña debe ser diferente a la clave temporal o anterior.'
    };
  }
  const emailPrefix = (email || '').split('@')[0]?.toLowerCase();
  if (emailPrefix && emailPrefix.length >= 3 && normalized.includes(emailPrefix)) {
    return {
      valid: false,
      message: 'Por seguridad, la contraseña no puede contener tu correo electrónico.'
    };
  }
  const nameParts = (nombre || '').toLowerCase().split(/\s+/).filter(p => p.length >= 3);
  for (const part of nameParts) {
    if (normalized.includes(part)) {
      return {
        valid: false,
        message: 'Por seguridad, la contraseña no puede contener tu nombre o apellido.'
      };
    }
  }
  return { valid: true };
}

/**
 * Sanitiza un objeto de usuario antes de guardarlo en estado de sesión
 * (nunca incluye hashes ni claves en texto plano)
 */
function sanitizeSessionUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    telefono: u.telefono || '',
    rol: u.rol,
    rol_id: u.rol_id,
    activo: u.activo !== false,
    must_change_password: Boolean(u.must_change_password)
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('lumia_active_session');
      return saved ? sanitizeSessionUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [showPostPasswordBiometricPrompt, setShowPostPasswordBiometricPrompt] = useState(false);
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);

  // Lista de usuarios (sin contraseñas en texto plano; solo hashes bcrypt)
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('patita_users_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(u => {
          const copy = { ...u };
          delete copy.custom_password;
          return copy;
        });
      }
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });

  // Dispositivos Passkey registrados por el usuario actual
  const [myPasskeyDevices, setMyPasskeyDevices] = useState(() => {
    try {
      const saved = localStorage.getItem('lumia_passkey_devices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Limpiar cualquier rastro antiguo inseguro en localStorage
  useEffect(() => {
    localStorage.removeItem('patita_users');
    localStorage.removeItem('patita_current_user');
  }, []);

  // Detectar compatibilidad del dispositivo con WebAuthn / Passkeys (Android / iOS 16+ / Windows Hello / TouchID)
  useEffect(() => {
    let mounted = true;
    async function checkWebAuthn() {
      try {
        if (
          typeof window !== 'undefined' &&
          window.PublicKeyCredential &&
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
        ) {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (mounted) setIsPasskeySupported(Boolean(available));
        }
      } catch {
        if (mounted) setIsPasskeySupported(false);
      }
    }
    checkWebAuthn();
    return () => {
      mounted = false;
    };
  }, []);

  // Sincronizar sesión con el servidor (/api/auth/session) al cargar la app
  useEffect(() => {
    let active = true;
    async function verifyServerSession() {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (active && data?.authenticated && data?.user) {
            const clean = sanitizeSessionUser(data.user);
            setCurrentUser(clean);
            sessionStorage.setItem('lumia_active_session', JSON.stringify(clean));
          }
        }
      } catch {
        // En desarrollo local sin funciones serverless activas se mantiene la sesión validada
      }
    }
    verifyServerSession();
    return () => {
      active = false;
    };
  }, []);

  // Persistir lista de usuarios (con hashes bcrypt únicamente)
  useEffect(() => {
    const cleanUsers = users.map(u => {
      const copy = { ...u };
      delete copy.custom_password;
      return copy;
    });
    localStorage.setItem('patita_users_v2', JSON.stringify(cleanUsers));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lumia_passkey_devices', JSON.stringify(myPasskeyDevices));
  }, [myPasskeyDevices]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('lumia_active_session', JSON.stringify(sanitizeSessionUser(currentUser)));
    } else {
      sessionStorage.removeItem('lumia_active_session');
    }
  }, [currentUser]);

  /**
   * Registra un evento de seguridad en la bitácora de auditoría local (sin contraseñas)
   */
  const appendSecurityAudit = (accion, registro_nombre) => {
    try {
      const existing = JSON.parse(localStorage.getItem('patita_auditoria') || '[]');
      const newEntry = {
        id: `aud-sec-${Date.now()}`,
        usuario_nombre: currentUser?.nombre || 'Seguridad LUMIA',
        accion,
        tabla_afectada: 'seguridad_autenticacion',
        registro_nombre,
        fecha: new Date().toISOString()
      };
      localStorage.setItem('patita_auditoria', JSON.stringify([newEntry, ...existing]));
    } catch {
      // ignore
    }
  };

  /**
   * Inicio de sesión con correo y contraseña
   * - Usa el backend /api/auth/login (cookies HttpOnly + Neon RLS)
   * - Incluye respaldo con hash bcrypt, bloqueo tras 5 intentos y caducidad 48h
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (!normalizedEmail || !password) {
        throw new Error(GENERIC_LOGIN_ERROR);
      }

      // 1. Intentar autenticación en el servidor (Vercel Serverless + Neon)
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: normalizedEmail, password })
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json') && res.status !== 503) {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || GENERIC_LOGIN_ERROR);
          }
          const cleanUser = sanitizeSessionUser(data.user);
          setCurrentUser(cleanUser);
          appendSecurityAudit('Inicio de sesión exitoso', cleanUser.email);
          return { success: true, mustChange: Boolean(data.mustChange) };
        }
      } catch (serverErr) {
        if (
          serverErr.message &&
          !serverErr.message.includes('Failed to fetch') &&
          !serverErr.message.includes('NetworkError')
        ) {
          throw serverErr;
        }
      }

      // 2. Validación criptográfica con bcrypt y bloqueo por intentos fallidos
      const found = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!found || !found.activo) {
        appendSecurityAudit('Intento de inicio de sesión fallido', 'Credenciales rechazadas');
        throw new Error(GENERIC_LOGIN_ERROR);
      }

      if (found.locked_until && new Date(found.locked_until).getTime() > Date.now()) {
        throw new Error('Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intentá nuevamente en 15 minutos.');
      }

      const validPass = found.password_hash
        ? await bcrypt.compare(password, found.password_hash)
        : false;

      if (!validPass) {
        const attempts = (found.failed_login_attempts || 0) + 1;
        const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
        const lockedUntil = shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString() : null;

        setUsers(prev =>
          prev.map(u =>
            u.id === found.id
              ? { ...u, failed_login_attempts: attempts, locked_until: lockedUntil }
              : u
          )
        );

        appendSecurityAudit(
          shouldLock ? 'Bloqueo temporal de cuenta por intentos fallidos' : 'Intento de inicio de sesión fallido',
          found.email
        );
        throw new Error(GENERIC_LOGIN_ERROR);
      }

      // Verificar caducidad de 48 horas si es contraseña temporal
      if (found.must_change_password && found.temp_password_expires_at) {
        if (Date.now() > new Date(found.temp_password_expires_at).getTime()) {
          appendSecurityAudit('Clave temporal caducada (>48h)', found.email);
          throw new Error('Tu contraseña temporal de 48 horas ha caducado. Solicitá un nuevo restablecimiento a la administración.');
        }
      }

      const updatedFound = {
        ...found,
        failed_login_attempts: 0,
        locked_until: null,
        ultimo_ingreso: new Date().toISOString()
      };

      setUsers(prev => prev.map(u => (u.id === found.id ? updatedFound : u)));
      const cleanUser = sanitizeSessionUser(updatedFound);
      setCurrentUser(cleanUser);
      appendSecurityAudit('Inicio de sesión exitoso', cleanUser.email);

      return { success: true, mustChange: Boolean(cleanUser.must_change_password) };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambio obligatorio de contraseña
   * Requisitos: mínimo 10 caracteres, rechazo de claves comunes y datos personales, hash bcrypt
   */
  const changePassword = async (oldPassword, newPassword) => {
    const check = validateClientPasswordPolicy(newPassword, {
      email: currentUser?.email,
      nombre: currentUser?.nombre,
      oldPassword
    });

    if (!check.valid) {
      throw new Error(check.message);
    }

    // 1. Intentar en el servidor
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json') && res.status !== 503) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo actualizar la contraseña.');
        }
      }
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch')) {
        throw err;
      }
    }

    // 2. Hashear con bcrypt (costo 10 en cliente / 12 en servidor)
    const target = users.find(u => u.id === currentUser?.id);
    if (target && oldPassword && target.password_hash) {
      const validOld = await bcrypt.compare(oldPassword, target.password_hash);
      if (!validOld) {
        throw new Error('La contraseña actual o temporal ingresada no es correcta.');
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const updatedUserRecord = {
      ...(target || currentUser),
      must_change_password: false,
      is_temp_password: false,
      temp_password_expires_at: null,
      password_hash: newHash
    };

    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUserRecord : u)));
    setCurrentUser(sanitizeSessionUser(updatedUserRecord));
    appendSecurityAudit('Cambio obligatorio de contraseña completado', currentUser.email);

    // Si el dispositivo soporta biometría, mostrar pantalla de invitación a registrar Passkey
    if (isPasskeySupported) {
      setShowPostPasswordBiometricPrompt(true);
    }

    return { success: true };
  };

  /**
   * Registro de Passkey Biométrica (Huella / Rostro) usando @simplewebauthn/browser
   * Cumplimiento Ley 25.326: jamás almacena ni transmite datos biométricos
   */
  const registerPasskeyDevice = async (customDeviceName) => {
    if (!currentUser) {
      throw new Error('Debés tener una sesión activa para activar el ingreso biométrico.');
    }
    if (!isPasskeySupported) {
      throw new Error('Este dispositivo o navegador no soporta autenticación biométrica con Passkeys.');
    }

    const defaultDeviceName =
      customDeviceName ||
      (/iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? 'iPhone / Face ID / Touch ID'
        : /Android/i.test(navigator.userAgent)
        ? 'Celular Android (Huella / Rostro)'
        : 'Dispositivo Personal (Biometría)');

    // 1. Intentar flujo completo con el servidor (@simplewebauthn/server)
    try {
      const optRes = await fetch('/api/webauthn/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'register' })
      });

      if (optRes.ok && (optRes.headers.get('content-type') || '').includes('application/json')) {
        const options = await optRes.json();
        const attResp = await startRegistration({ optionsJSON: options });

        const verRes = await fetch('/api/webauthn/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: 'register',
            credential: attResp,
            deviceName: defaultDeviceName
          })
        });

        const verData = await verRes.json();
        if (!verRes.ok || !verData.verified) {
          throw new Error(verData.error || 'No se pudo verificar la passkey en el servidor.');
        }

        const newDev = {
          id: verData.device.id,
          usuario_id: currentUser.id,
          usuario_email: currentUser.email,
          credential_id: verData.device.credential_id,
          nombre_dispositivo: verData.device.nombre_dispositivo,
          created_at: verData.device.created_at,
          last_used_at: verData.device.last_used_at
        };

        setMyPasskeyDevices(prev => [newDev, ...prev]);
        localStorage.setItem('lumia_last_passkey_email', currentUser.email);
        appendSecurityAudit('Alta de Passkey biométrica (WebAuthn)', `${currentUser.email} — ${defaultDeviceName}`);
        return newDev;
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        throw new Error('Cancelaste la verificación de huella o rostro en tu dispositivo.');
      }
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('503')) {
        throw err;
      }
    }

    // 2. Respaldo WebAuthn nativo del navegador si se ejecuta sin backend conectado
    const challengeBytes = new Uint8Array(32);
    window.crypto.getRandomValues(challengeBytes);
    const userIdBytes = new TextEncoder().encode(String(currentUser.id));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: challengeBytes,
        rp: {
          name: 'LUMIA — Gestión de Rescates y Adopciones',
          id: window.location.hostname
        },
        user: {
          id: userIdBytes,
          name: currentUser.email,
          displayName: currentUser.nombre
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    });

    if (!credential) {
      throw new Error('No se pudo registrar la passkey en este dispositivo.');
    }

    const newDevice = {
      id: `pk-${Date.now()}`,
      usuario_id: currentUser.id,
      usuario_email: currentUser.email,
      credential_id: credential.id,
      raw_id_b64: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      counter: 1,
      nombre_dispositivo: defaultDeviceName,
      created_at: new Date().toISOString(),
      last_used_at: new Date().toISOString()
    };

    setMyPasskeyDevices(prev => [newDevice, ...prev]);
    localStorage.setItem('lumia_last_passkey_email', currentUser.email);
    appendSecurityAudit('Alta de Passkey biométrica (WebAuthn)', `${currentUser.email} — ${defaultDeviceName}`);
    return newDevice;
  };

  /**
   * Inicio de sesión con Huella / Rostro (Passkey WebAuthn)
   */
  const loginWithPasskey = async (emailHint = '') => {
    setLoading(true);
    try {
      const targetEmail = (emailHint || localStorage.getItem('lumia_last_passkey_email') || '').trim().toLowerCase();

      // 1. Intentar autenticación con el servidor (@simplewebauthn/server)
      try {
        const optRes = await fetch('/api/webauthn/options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'authenticate', email: targetEmail || undefined })
        });

        if (optRes.ok && (optRes.headers.get('content-type') || '').includes('application/json')) {
          const options = await optRes.json();
          const asseResp = await startAuthentication({ optionsJSON: options });

          const verRes = await fetch('/api/webauthn/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              action: 'authenticate',
              credential: asseResp
            })
          });

          const verData = await verRes.json();
          if (!verRes.ok || !verData.verified) {
            throw new Error(verData.error || 'No se pudo verificar tu huella o rostro.');
          }

          const cleanUser = sanitizeSessionUser(verData.user);
          setCurrentUser(cleanUser);
          localStorage.setItem('lumia_last_passkey_email', cleanUser.email);
          appendSecurityAudit('Inicio de sesión exitoso con Passkey (Huella / Rostro)', cleanUser.email);
          return { success: true, user: cleanUser };
        }
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          throw new Error('Cancelaste la lectura de huella o rostro.');
        }
        if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('503')) {
          throw err;
        }
      }

      // 2. Respaldo WebAuthn nativo del navegador
      const registeredForUser = targetEmail
        ? myPasskeyDevices.filter(d => d.usuario_email?.toLowerCase() === targetEmail)
        : myPasskeyDevices;

      if (registeredForUser.length === 0) {
        throw new Error('Aún no tenés una huella o rostro registrado en este dispositivo. Ingresá con tu contraseña para activarlo.');
      }

      const challengeBytes = new Uint8Array(32);
      window.crypto.getRandomValues(challengeBytes);

      const allowCredentials = registeredForUser
        .filter(d => d.raw_id_b64)
        .map(d => ({
          type: 'public-key',
          id: Uint8Array.from(atob(d.raw_id_b64), c => c.charCodeAt(0)),
          transports: ['internal']
        }));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBytes,
          rpId: window.location.hostname,
          allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
          userVerification: 'required',
          timeout: 60000
        }
      });

      if (!assertion) {
        throw new Error('No se pudo validar la credencial biométrica.');
      }

      const matchedDevice =
        myPasskeyDevices.find(d => d.credential_id === assertion.id) || registeredForUser[0];

      const userRecord = users.find(u => u.id === matchedDevice.usuario_id && u.activo);
      if (!userRecord) {
        throw new Error('La cuenta asociada a este dispositivo no está activa.');
      }

      setMyPasskeyDevices(prev =>
        prev.map(d =>
          d.id === matchedDevice.id
            ? { ...d, counter: (d.counter || 1) + 1, last_used_at: new Date().toISOString() }
            : d
        )
      );

      const cleanUser = sanitizeSessionUser(userRecord);
      setCurrentUser(cleanUser);
      localStorage.setItem('lumia_last_passkey_email', cleanUser.email);
      appendSecurityAudit('Inicio de sesión exitoso con Passkey (Huella / Rostro)', cleanUser.email);
      return { success: true, user: cleanUser };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un dispositivo Passkey propio
   */
  const removePasskeyDevice = async (deviceId) => {
    try {
      await fetch('/api/webauthn/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deviceId })
      });
    } catch {
      // ignore offline/local
    }
    const target = myPasskeyDevices.find(d => d.id === deviceId);
    setMyPasskeyDevices(prev => prev.filter(d => d.id !== deviceId));
    appendSecurityAudit('Baja de dispositivo Passkey', target?.nombre_dispositivo || deviceId);
  };

  /**
   * Cierre de sesión
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' });
    } catch {
      // ignore
    }
    if (currentUser) {
      appendSecurityAudit('Cierre de sesión', currentUser.email);
    }
    setCurrentUser(null);
    setShowPostPasswordBiometricPrompt(false);
  };

  /**
   * Creación de usuario por Administrador o Superadministrador
   * Genera una contraseña temporal CSPRNG de 14 caracteres con caducidad de 48h,
   * almacena únicamente su hash bcrypt y devuelve la clave en texto plano UNA SOLA VEZ.
   */
  const createUser = async ({ nombre, email, telefono, rol_id, rolNombre }) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Intentar creación en el servidor
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, email: cleanEmail, telefono, rolNombre })
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json') && res.status !== 503) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al crear el usuario.');
        }
        setUsers(prev => [data.user, ...prev]);
        appendSecurityAudit('Alta de usuario con clave temporal CSPRNG (48h)', cleanEmail);
        return {
          user: data.user,
          oneTimeTempPassword: data.oneTimeTempPassword,
          expiresAt: data.expiresAt
        };
      }
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch')) {
        throw err;
      }
    }

    // 2. Generación CSPRNG en cliente con hash bcrypt (sin guardar nunca texto plano)
    const oneTimeTempPassword = generateClientCsprngPassword(14);
    const passwordHash = await bcrypt.hash(oneTimeTempPassword, 10);
    const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_MS).toISOString();

    const newUser = {
      id: `usr-${Date.now()}`,
      nombre: nombre.trim(),
      email: cleanEmail,
      telefono: telefono || '',
      rol: rolNombre || 'Rescatista',
      rol_id,
      activo: true,
      must_change_password: true,
      is_temp_password: true,
      temp_password_expires_at: expiresAt,
      password_hash: passwordHash,
      failed_login_attempts: 0,
      locked_until: null,
      created_at: new Date().toISOString(),
      creado_por: currentUser?.nombre || 'Administración'
    };

    setUsers(prev => [newUser, ...prev]);
    appendSecurityAudit('Alta de usuario con clave temporal CSPRNG (48h)', `${newUser.nombre} (${cleanEmail})`);

    return {
      user: newUser,
      oneTimeTempPassword,
      expiresAt
    };
  };

  /**
   * Actualizar estado o rol de un usuario
   */
  const updateUser = async (userId, data) => {
    try {
      await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, ...data })
      });
    } catch {
      // ignore
    }

    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...data } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => sanitizeSessionUser({ ...prev, ...data }));
    }
    const target = users.find(u => u.id === userId);
    appendSecurityAudit('Modificación de perfil/rol de usuario', target?.email || userId);
  };

  /**
   * Restablecer contraseña de usuario y revocar sus Passkeys (Recuperación ante pérdida de dispositivo)
   */
  const resetUserPassword = async (userId, { revokePasskeys = true } = {}) => {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action: 'reset_access', revokePasskeys })
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json') && res.status !== 503) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo restablecer el acceso.');
        }
        if (revokePasskeys) {
          setMyPasskeyDevices(prev => prev.filter(d => d.usuario_id !== userId));
        }
        return {
          oneTimeTempPassword: data.oneTimeTempPassword,
          expiresAt: data.expiresAt,
          revokedPasskeysCount: data.revokedPasskeysCount || 0
        };
      }
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch')) {
        throw err;
      }
    }

    const oneTimeTempPassword = generateClientCsprngPassword(14);
    const passwordHash = await bcrypt.hash(oneTimeTempPassword, 10);
    const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_MS).toISOString();

    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? {
              ...u,
              must_change_password: true,
              is_temp_password: true,
              temp_password_expires_at: expiresAt,
              password_hash: passwordHash,
              failed_login_attempts: 0,
              locked_until: null
            }
          : u
      )
    );

    let revokedCount = 0;
    if (revokePasskeys) {
      revokedCount = myPasskeyDevices.filter(d => d.usuario_id === userId).length;
      setMyPasskeyDevices(prev => prev.filter(d => d.usuario_id !== userId));
    }

    const target = users.find(u => u.id === userId);
    appendSecurityAudit(
      revokePasskeys
        ? 'Restablecimiento de clave temporal (48h) y revocación de Passkeys'
        : 'Restablecimiento de clave temporal (48h)',
      target?.email || userId
    );

    return {
      oneTimeTempPassword,
      expiresAt,
      revokedPasskeysCount: revokedCount
    };
  };

  // Dispositivos vinculados al usuario actual
  const currentUserPasskeys = myPasskeyDevices.filter(
    d => d.usuario_id === currentUser?.id || d.usuario_email === currentUser?.email
  );

  // Verificar si existe alguna passkey registrada en este navegador para mostrar el botón principal en Login
  const hasRegisteredPasskeysOnDevice =
    myPasskeyDevices.length > 0 || Boolean(localStorage.getItem('lumia_last_passkey_email'));

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
        isPasskeySupported,
        hasRegisteredPasskeysOnDevice,
        currentUserPasskeys,
        allPasskeyDevices: myPasskeyDevices,
        registerPasskeyDevice,
        loginWithPasskey,
        removePasskeyDevice,
        showPostPasswordBiometricPrompt,
        setShowPostPasswordBiometricPrompt
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
