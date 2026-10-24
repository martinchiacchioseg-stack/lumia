import React, { useState } from 'react';
import { useAuth, validateClientPasswordPolicy } from '../../context/AuthContext';
import { ShieldAlert, CheckCircle2, KeyRound, Fingerprint, Sparkles } from 'lucide-react';

export function ForcePasswordChangeModal() {
  const {
    currentUser,
    changePassword,
    isPasskeySupported,
    registerPasskeyDevice,
    showPostPasswordBiometricPrompt,
    setShowPostPasswordBiometricPrompt
  } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const mustChange = Boolean(currentUser?.must_change_password);

  // Solo se muestra si debe cambiar su contraseña temporal o si acaba de cambiarla y se le ofrece activar biometría
  if (!currentUser || (!mustChange && !showPostPasswordBiometricPrompt)) {
    return null;
  }

  const policyCheck = validateClientPasswordPolicy(newPassword, {
    email: currentUser?.email,
    nombre: currentUser?.nombre,
    oldPassword
  });

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!policyCheck.valid) {
      setError(policyCheck.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateBiometrics = async () => {
    setError('');
    setLoading(true);
    try {
      await registerPasskeyDevice();
      setBiometricSuccess(true);
      setTimeout(() => {
        setBiometricSuccess(false);
        setShowPostPasswordBiometricPrompt(false);
      }, 1800);
    } catch (err) {
      setError(err.message || 'No se pudo registrar el acceso biométrico en este dispositivo.');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: PANTALLA INMEDIATA POST-CAMBIO DE CONTRASEÑA PARA ACTIVAR HUELLA / ROSTRO
  if (!mustChange && showPostPasswordBiometricPrompt && isPasskeySupported) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-lumia-100 text-lumia-600 flex items-center justify-center mx-auto shadow-sm">
            <Fingerprint className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Contraseña actualizada con éxito
            </span>
            <h3 className="font-extrabold text-stone-900 text-lg sm:text-xl leading-snug">
              ¿Querés ingresar con tu huella o reconocimiento facial la próxima vez?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Podés vincular este dispositivo para entrar en un toque de forma rápida y segura. 
              Cumpliendo la <strong>Ley 25.326</strong>, LUMIA nunca recibe ni almacena tus datos biométricos: la validación se hace dentro de tu teléfono o computadora.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {biometricSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>¡Listo! Tu huella / rostro quedó activado en este dispositivo.</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleActivateBiometrics}
                className="flex-1 py-3 px-4 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-sm shadow-md shadow-lumia-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{loading ? 'Activando...' : 'Activar'}</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setShowPostPasswordBiometricPrompt(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition-all"
              >
                Ahora no
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PASO 1: CAMBIO OBLIGATORIO DE CONTRASEÑA TEMPORAL
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200">
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg">Cambio obligatorio de contraseña</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Las claves temporales caducan a las 48 horas y son de un solo uso. Definí tu contraseña personal definitiva.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Contraseña temporal recibida
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Ingresá la clave temporal con la que entraste"
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nueva contraseña definitiva
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 10 caracteres"
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500"
            />
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <CheckCircle2 className={`w-3.5 h-3.5 ${newPassword.length >= 10 ? 'text-emerald-500' : 'text-stone-300'}`} />
                <span>Mínimo 10 caracteres</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <CheckCircle2 className={`w-3.5 h-3.5 ${newPassword.length >= 10 && policyCheck.valid ? 'text-emerald-500' : 'text-stone-300'}`} />
                <span>No es una clave común ni contiene tu nombre o correo</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí tu nueva contraseña"
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-4 rounded-2xl text-white font-bold text-sm bg-lumia-500 hover:bg-lumia-600 shadow-lg shadow-lumia-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Guardar Contraseña Definitiva</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
