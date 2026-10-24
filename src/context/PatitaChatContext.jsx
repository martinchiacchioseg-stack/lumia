import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PatitaChatContext = createContext(null);

export const PATITA_INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-init',
  role: 'model',
  text: '¡Hola! Soy Patita Aliada 🐾 Estoy para darte una mano con lo que necesites en tu trabajo de rescate: primeros auxilios, leyes y denuncias, publicaciones de adopción, cuidados, organización... o simplemente para escucharte cuando el día se pone pesado. ¿Qué pasa hoy?',
  timestamp: new Date().toISOString()
};

export function PatitaChatProvider({ children }) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [messages, setMessages] = useState([PATITA_INITIAL_WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [animalContext, setAnimalContext] = useState(null);
  const [remainingQuota, setRemainingQuota] = useState(30);

  // Monitorear conectividad
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setIsOpen(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reiniciar contexto al cambiar de usuario o cerrar sesión
  useEffect(() => {
    setMessages([PATITA_INITIAL_WELCOME_MESSAGE]);
    setAnimalContext(null);
  }, [currentUser?.id]);

  const canUseChat =
    Boolean(currentUser) &&
    currentUser.rol !== 'Solo lectura' &&
    currentUser.rol !== 'VOLUNTARIO';

  const resetConversation = () => {
    setMessages([PATITA_INITIAL_WELCOME_MESSAGE]);
    setAnimalContext(null);
  };

  /**
   * Abre el chat pre-cargando la ficha de un animal (solo datos clínicos/conducta, sin datos sensibles)
   */
  const openChatWithAnimal = (animal) => {
    if (!animal) return;
    setAnimalContext({
      codigo_interno: animal.codigo_interno,
      nombre_actual: animal.nombre_actual,
      especie: animal.especie,
      sexo: animal.sexo,
      edad_estimada: animal.edad_estimada,
      tamano: animal.tamano,
      estado_caso: animal.estado_caso,
      pelaje_color_senas_particulares: animal.pelaje_color_senas_particulares || animal.color_pelaje_senas,
      notas_conducta: animal.notas_conducta,
      relacion_con_perros: animal.relacion_con_perros,
      relacion_con_gatos: animal.relacion_con_gatos,
      relacion_con_personas: animal.relacion_con_personas
    });
    setIsOpen(true);
  };

  /**
   * Enviar mensaje a Patita Aliada (vía /api/ai/chat)
   */
  const sendMessage = async (userText) => {
    if (!userText || !userText.trim() || loading) return;

    const trimmed = userText.trim();
    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome-init')
        .map(m => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-lumia-user-id': currentUser?.id || '',
          'x-lumia-role': currentUser?.rol || ''
        },
        credentials: 'include',
        body: JSON.stringify({
          message: trimmed,
          history,
          animalContext
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No pude responderte en este momento.');
      }

      if (typeof data.remainingInHour === 'number') {
        setRemainingQuota(data.remainingInHour);
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        text: err.message || 'Perdón, tuve un problema de conexión. Probá de nuevo en unos segundos.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatitaChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isOnline,
        canUseChat,
        messages,
        loading,
        animalContext,
        setAnimalContext,
        remainingQuota,
        sendMessage,
        resetConversation,
        openChatWithAnimal
      }}
    >
      {children}
    </PatitaChatContext.Provider>
  );
}

export const usePatitaChat = () => useContext(PatitaChatContext);
