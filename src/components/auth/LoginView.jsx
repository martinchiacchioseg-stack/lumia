import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';

export function LoginView() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
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
      setError(err.message || 'Error al iniciar sesión. Verificá tus credenciales.');
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
        {/* Logo Oficial LUMIA con subtítulo bold grande y legible */}
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
                  placeholder="ejemplo@gmail.com"
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
                  ¿Te la olvidaste?
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
                  placeholder="••••••••"
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
              className="w-full mt-2 py-3.5 px-4 rounded-2xl text-white font-bold text-sm bg-lumia-500 hover:bg-lumia-600 shadow-md shadow-lumia-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Ingresar al Sistema LUMIA</span>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-stone-400">
          LUMIA • Plataforma Nacional Protegida bajo Ley 25.326 de Protección de Datos Personales
        </p>
      </div>

      {/* Modal Olvidé mi Contraseña */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-lumia-100 text-lumia-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Recuperar contraseña</h3>
                <p className="text-xs text-stone-500">Te enviaremos un correo con las instrucciones</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
                ¡Listo! Si el correo existe en el sistema, te llegará un enlace para restablecer tu contraseña.
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
                    placeholder="tu-email@gmail.com"
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
                    Enviar instrucciones
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
