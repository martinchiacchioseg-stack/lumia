import React, { useState } from 'react';
import { useAuth, validateClientPasswordPolicy } from '../../context/AuthContext';
import { formatDate } from '../../lib/formatters';
import { 
  Fingerprint, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Trash2, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Plus, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  Mail,
  Phone,
  Shield,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export function ConfiguracionView() {
  const { 
    currentUser, 
    isPasskeySupported, 
    currentUserPasskeys, 
    registerPasskeyDevice, 
    removePasskeyDevice, 
    changePassword,
    loading 
  } = useAuth();

  // Estados de enrolamiento biométrico
  const [isRegistering, setIsRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState('');
  const [biometricError, setBiometricError] = useState('');

  // Estados de cambio de contraseña
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Detectar nombre sugerido según el navegador/sistema
  const getSuggestedName = () => {
    if (typeof navigator === 'undefined') return 'Dispositivo Personal';
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return 'iPhone (Face ID / Touch ID)';
    if (/iPad/i.test(ua)) return 'iPad (Touch ID / Face ID)';
    if (/Android/i.test(ua)) return 'Celular Android (Huella dactilar)';
    if (/Windows/i.test(ua)) return 'PC Windows (Windows Hello)';
    if (/Macintosh/i.test(ua)) return 'Mac (Touch ID)';
    return 'Mi Dispositivo';
  };

  const handleOpenAddModal = () => {
    setDeviceName(getSuggestedName());
    setBiometricError('');
    setShowAddDeviceModal(true);
  };

  const handleRegisterBiometrics = async (e) => {
    e.preventDefault();
    setBiometricError('');
    setIsRegistering(true);
    try {
      const name = deviceName.trim() || getSuggestedName();
      await registerPasskeyDevice(name);
      setShowAddDeviceModal(false);
      setBiometricSuccess(`¡Dispositivo "${name}" vinculado con éxito! Ya podés ingresar usando tu huella o rostro.`);
      setTimeout(() => setBiometricSuccess(''), 5000);
    } catch (err) {
      setBiometricError(err.message || 'No se pudo completar el registro biométrico.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRemoveDevice = async (device) => {
    const confirmDelete = window.confirm(
      `¿Desvincular "${device.nombre_dispositivo || 'este dispositivo'}"?\n\nYa no podrás usar la huella o el reconocimiento facial de este dispositivo para ingresar a LUMIA hasta que lo vuelvas a registrar.`
    );
    if (!confirmDelete) return;

    try {
      await removePasskeyDevice(device.credential_id);
      setBiometricSuccess('Dispositivo biométrico desvinculado correctamente.');
      setTimeout(() => setBiometricSuccess(''), 4000);
    } catch (err) {
      setBiometricError(err.message || 'Error al desvincular el dispositivo.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const policyCheck = validateClientPasswordPolicy(newPassword, {
      email: currentUser?.email,
      nombre: currentUser?.nombre,
      oldPassword
    });

    if (!policyCheck.valid) {
      setPasswordError(policyCheck.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess('¡Contraseña actualizada exitosamente!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(err.message || 'Error al actualizar la contraseña. Verificá tu contraseña actual.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const hasBiometrics = currentUserPasskeys && currentUserPasskeys.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Encabezado Principal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2.5 rounded-2xl bg-lumia-50 text-lumia-600 border border-lumia-100">
              <Fingerprint className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Configuración y Seguridad
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Administrá tus datos biométricos, dispositivos vinculados y credenciales de acceso
              </p>
            </div>
          </div>
        </div>

        {/* Resumen del Usuario */}
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200/80 px-4 py-3 rounded-2xl">
          <div className="w-11 h-11 rounded-2xl bg-lumia-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-lumia-500/20">
            {currentUser?.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 leading-tight">{currentUser?.nombre}</p>
            <p className="text-[11px] text-stone-500 truncate max-w-[200px]">{currentUser?.email}</p>
            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-lumia-100 text-lumia-800">
              <Shield className="w-2.5 h-2.5" />
              {currentUser?.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Notificaciones globales de éxito / error */}
      {biometricSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{biometricSuccess}</span>
        </div>
      )}
      {biometricError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{biometricError}</span>
        </div>
      )}

      {/* SECCIÓN 1: ACCESO BIOMÉTRICO (HUELLA / ROSTRO / PASSEKEYS) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-lumia-50 text-lumia-600 border border-lumia-100 shrink-0">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">Acceso Biométrico (Passkeys FIDO2)</h2>
                {hasBiometrics ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Activado ({currentUserPasskeys.length})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Sin activar
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Ingresá a LUMIA usando tu huella dactilar, reconocimiento facial (Face ID) o Windows Hello, sin necesidad de escribir contraseñas.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-3 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs shadow-md shadow-lumia-500/30 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Vincular huella o rostro</span>
          </button>
        </div>

        {/* Lista de dispositivos vinculados */}
        <div>
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
            Tus dispositivos biométricos registrados
          </h3>

          {currentUserPasskeys.length === 0 ? (
            <div className="p-8 rounded-2xl border-2 border-dashed border-stone-200 text-center bg-stone-50/50">
              <Fingerprint className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">Aún no vinculaste ningún dispositivo</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
                Hacé click en "Vincular huella o rostro" para habilitar el ingreso instantáneo desde este teléfono o computadora.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lumia-50 text-lumia-700 hover:bg-lumia-100 border border-lumia-200 text-xs font-bold transition-all"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Activar en este dispositivo</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentUserPasskeys.map((dev) => (
                <div
                  key={dev.credential_id || dev.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-lumia-200 hover:shadow-sm transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-lumia-600 shrink-0 shadow-xs">
                      {/iPhone|Android|Celular/i.test(dev.nombre_dispositivo) ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Laptop className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 leading-tight">
                        {dev.nombre_dispositivo || 'Dispositivo Biométrico'}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate max-w-[160px]">
                        ID: {dev.credential_id?.slice(0, 16)}...
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          Registrado: {formatDate(dev.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDevice(dev)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Desvincular este dispositivo biométrico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Garantía Legal Ley 25.326 */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-lumia-600 shrink-0 mt-0.5" />
          <div className="text-xs text-stone-600 leading-relaxed">
            <span className="font-bold text-stone-800">Privacidad y Protección de Datos Personales (Ley 25.326):</span>{' '}
            LUMIA jamás almacena ni tiene acceso a tu huella digital o rostro. La verificación biométrica se realiza exclusivamente dentro del chip de seguridad de tu propio dispositivo (Secure Enclave o TPM). Al servidor solo se envía una firma matemática pública FIDO2 que autentica tu identidad.
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ACTUALIZAR CONTRASEÑA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-start gap-3 pb-4 border-b border-stone-100">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Cambiar Contraseña</h2>
            <p className="text-xs text-stone-500 mt-1">
              La contraseña debe tener un mínimo de 10 caracteres y no puede contener tu nombre ni secuencias comunes.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Ingresá tu contraseña actual"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500 focus:border-lumia-500 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Nueva Contraseña
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 10 caracteres"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500 focus:border-lumia-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la nueva contraseña"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500 focus:border-lumia-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading || !oldPassword || !newPassword || !confirmPassword}
              className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordLoading ? 'Guardando...' : 'Actualizar Contraseña'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 3: PERFIL Y DATOS DE LA CUENTA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
          <div className="p-3 rounded-2xl bg-stone-100 text-stone-600 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Datos Personales y Rol</h2>
            <p className="text-xs text-stone-500 mt-0.5">Información registrada en el sistema de gestión</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center gap-2 text-stone-400 text-xs font-bold mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Nombre Completo</span>
            </div>
            <p className="text-sm font-bold text-stone-900">{currentUser?.nombre}</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center gap-2 text-stone-400 text-xs font-bold mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Correo Electrónico</span>
            </div>
            <p className="text-sm font-bold text-stone-900 truncate">{currentUser?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center gap-2 text-stone-400 text-xs font-bold mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Rol Asignado</span>
            </div>
            <p className="text-sm font-bold text-lumia-700">{currentUser?.rol}</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center gap-2 text-stone-400 text-xs font-bold mb-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Teléfono de Contacto</span>
            </div>
            <p className="text-sm font-bold text-stone-900">{currentUser?.telefono || 'Sin registrar'}</p>
          </div>
        </div>
      </div>

      {/* MODAL PARA VINCULAR DISPOSITIVO BIOMÉTRICO */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-lumia-50 text-lumia-600 border border-lumia-100 flex items-center justify-center mx-auto shadow-sm">
                <Fingerprint className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-stone-900 tracking-tight">
                Vincular Huella o Rostro
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Asignale un nombre a este dispositivo y presioná "Escanear ahora". Tu navegador te pedirá confirmar con tu huella, rostro o PIN del sistema.
              </p>
            </div>

            {biometricError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{biometricError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterBiometrics} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nombre descriptivo del dispositivo
                </label>
                <input
                  type="text"
                  required
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Ej: Celular Samsung / iPhone / PC Trabajo"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500 focus:border-lumia-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-lumia-600 shrink-0 mt-0.5" />
                <span>
                  La próxima vez que ingreses, podrás tocar el botón "Ingresar con Huella o Rostro" y acceder directamente.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isRegistering}
                  onClick={() => setShowAddDeviceModal(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegistering || !deviceName.trim()}
                  className="px-5 py-3 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs shadow-md shadow-lumia-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isRegistering ? 'Esperando sensor biométrico...' : 'Escanear Huella / Rostro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
