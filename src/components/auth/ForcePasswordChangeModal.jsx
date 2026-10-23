import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';

export function ForcePasswordChangeModal() {
  const { currentUser, changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Solo se muestra si el usuario logueado tiene la bandera must_change_password
  if (!currentUser || !currentUser.must_change_password) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword === '123456') {
      setError('No podés usar "123456". Elegí una contraseña más segura.');
      return;
    }

    if (oldPassword && newPassword === oldPassword) {
      setError('La nueva contraseña debe ser diferente a la anterior.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

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
              Por seguridad, en tu primer ingreso debés establecer tu contraseña definitiva.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Contraseña actual o temporal
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Ingresá la contraseña con la que entraste"
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
            />
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <CheckCircle2 className={`w-3.5 h-3.5 ${newPassword.length >= 8 ? 'text-emerald-500' : 'text-stone-300'}`} />
                <span>Al menos 8 caracteres</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <CheckCircle2 className={`w-3.5 h-3.5 ${newPassword && newPassword !== '123456' ? 'text-emerald-500' : 'text-stone-300'}`} />
                <span>Distinta a 123456</span>
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
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-4 rounded-2xl text-white font-bold text-sm bg-patita-600 hover:bg-patita-700 shadow-lg shadow-patita-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Guardar Contraseña y Continuar</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
