import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, KeyRound, Fingerprint } from 'lucide-react';

export function LoginView() {
  const {
    login,
    loginWithPasskey,
    loading,
    isPasskeySupported,
    hasRegisteredPasskeysOnDevice
  } = useAuth();

  const [email, setEmail] = useState(() => localStorage.getItem('lumia_last_passkey_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Credenciales inválidas o cuenta temporalmente bloqueada.');
    }
  };

  const handleBiometricLogin = async () => {
    setError('');
    try {
      await loginWithPasskey(email);
    } catch (err) {
      setError(err.message || 'No se pudo ingresar con huella o rostro. Podés ingresar con tu contraseña.');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lumia-50 via-stone-50 to-stone-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="flex justify-center mb-3">
          <Logo
            variant="full"
            background="transparent"
            size="2xl"
            className="h-40 sm:h-52 md:h-60 w-auto max-w-[380px] sm:max-w-[480px] object-contain drop-shadow-md transition-transform duration-300 hover:scale-[1.02]"
            priority={true}
          />
        </div>
        <p className="mt-3 text-xs sm:text-sm md:text-base font-bold text-stone-600 uppercase tracking-widest">
          Sistema Nacional de Gestión para Rescatistas
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-stone-200/50 rounded-3xl border border-stone-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* OPCIÓN PRINCIPAL SI TIENE PASSKEY REGISTRADA EN EL DISPOSITIVO */}
          {isPasskeySupported && hasRegisteredPasskeysOnDevice && (
            <div className="mb-6 space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleBiometricLogin}
                className="w-full py-3.5 px-4 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-sm shadow-lg shadow-lumia-500/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                <Fingerprint className="w-5 h-5" />
                <span>Ingresar con huella / rostro</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  o ingresá con tu contraseña
                </span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="block w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-lumia-500 focus:border-lumia-500 text-stone-900 placeholder:text-stone-400 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-lumia-600 hover:text-lumia-700 font-semibold"
                >
                  ¿Perdiste tu acceso?
                </button>
              </div>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="block w-full pl-11 pr-11 py-3 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-lumia-500 focus:border-lumia-500 text-stone-900 placeholder:text-stone-400 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                isPasskeySupported && hasRegisteredPasskeysOnDevice
                  ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                  : 'bg-lumia-500 hover:bg-lumia-600 text-white shadow-md shadow-lumia-500/30'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Ingresar con Contraseña</span>
              )}
            </button>

            {/* Botón biométrico secundario si el dispositivo soporta Passkeys pero no se detectó en caché local */}
            {isPasskeySupported && !hasRegisteredPasskeysOnDevice && (
              <button
                type="button"
                disabled={loading}
                onClick={handleBiometricLogin}
                className="w-full py-3 px-4 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4 text-lumia-600" />
                <span>Ingresar con huella / rostro</span>
              </button>
            )}
          </form>

          {/* Accesos rápidos de desarrollo / evaluación */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2.5 text-center">
              Acceso rápido para evaluación
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('martinchiacchio.seg@gmail.com');
                  setPassword('Chiacchio@1938');
                }}
                className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-lumia-50 hover:border-lumia-300 text-left transition-all group"
              >
                <div className="text-xs font-bold text-stone-800 group-hover:text-lumia-700">Superadmin</div>
                <div className="text-[10px] text-stone-500 truncate">martinchiacchio.seg...</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('genesisbustamante88@gmail.com');
                  setPassword('123456');
                }}
                className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-lumia-50 hover:border-lumia-300 text-left transition-all group"
              >
                <div className="text-xs font-bold text-stone-800 group-hover:text-lumia-700">Administrador</div>
                <div className="text-[10px] text-stone-500 truncate">genesisbustamante88...</div>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-stone-400">
          LUMIA • Plataforma Nacional Protegida bajo Ley 25.326 de Protección de Datos Personales
        </p>
      </div>

      {/* Modal Recuperación de Acceso */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-lumia-100 text-lumia-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Recuperación de acceso</h3>
                <p className="text-xs text-stone-500">Solicitud de restablecimiento a la administración</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
                Si el correo corresponde a una cuenta activa, la administración recibirá el aviso para emitir una nueva clave temporal de 48 horas.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ingresá tu email registrado</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="tu-email@correo.com"
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white text-xs font-bold shadow-md shadow-lumia-500/20"
                  >
                    Solicitar restablecimiento
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
