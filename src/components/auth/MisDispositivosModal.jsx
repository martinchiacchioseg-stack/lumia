import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { formatDate } from '../../lib/formatters';
import {
  Fingerprint,
  Smartphone,
  Trash2,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export function MisDispositivosModal({ isOpen, onClose }) {
  const {
    isPasskeySupported,
    currentUserPasskeys,
    registerPasskeyDevice,
    removePasskeyDevice
  } = useAuth();

  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await registerPasskeyDevice(deviceName.trim() || undefined);
      setDeviceName('');
      setSuccessMsg('¡Dispositivo vinculado! La próxima vez podrás ingresar con tu huella o rostro.');
    } catch (err) {
      setError(err.message || 'No se pudo registrar la passkey en este dispositivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id, nombre) => {
    if (!window.confirm(`¿Querés desvincular el dispositivo "${nombre}"? Ya no podrás usarlo para ingresar con huella o rostro.`)) {
      return;
    }
    await removePasskeyDevice(id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ingreso con Huella o Rostro (Passkeys)"
      subtitle="Administrá los dispositivos autorizados para iniciar sesión en tu cuenta"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Garantía de Privacidad Ley 25.326 */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 space-y-1">
            <p className="font-extrabold">Privacidad Biométrica Protegida (Ley Nacional 25.326)</p>
            <p className="leading-relaxed text-[11px] text-emerald-800">
              LUMIA <strong>nunca recibe, guarda ni transmite</strong> tu huella digital ni los datos de tu rostro. 
              La lectura biométrica se realiza exclusivamente dentro de tu celular o computadora, y el sistema solo guarda una clave criptográfica pública vinculada a tu equipo.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario para activar este dispositivo */}
        {isPasskeySupported ? (
          <form onSubmit={handleRegister} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-lumia-600" />
              <span>Vincular este dispositivo actual</span>
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Nombre (ej: Mi Celular Samsung / iPhone)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500 bg-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{loading ? 'Activando...' : 'Activar Huella / Rostro'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600">
            Este navegador o dispositivo no informa soporte para passkeys biométricas integradas. Podés seguir ingresando normalmente con tu contraseña.
          </div>
        )}

        {/* Lista de dispositivos registrados por el usuario */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">
            Dispositivos Registrados ({currentUserPasskeys.length})
          </h4>

          {currentUserPasskeys.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500">
              No tenés dispositivos biométricos vinculados en este momento.
            </div>
          ) : (
            <div className="space-y-2">
              {currentUserPasskeys.map((dev) => (
                <div
                  key={dev.id}
                  className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-lumia-50 text-lumia-600 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">{dev.nombre_dispositivo}</p>
                      <p className="text-[11px] text-stone-500">
                        Alta: {formatDate(dev.created_at)}
                        {dev.last_used_at ? ` • Último uso: ${formatDate(dev.last_used_at)}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(dev.id, dev.nombre_dispositivo)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Eliminar este dispositivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
