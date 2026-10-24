import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { Logo } from '../common/Logo';
import { 
  Download, 
  Copy, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Smartphone, 
  Layers, 
  PhoneCall, 
  MapPin, 
  Check, 
  ExternalLink 
} from 'lucide-react';

export function ModalFlyerRedes({ isOpen, onClose, animal }) {
  const { configPortal } = useData();
  const flyerRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Opciones configurables del flyer
  const [formato, setFormato] = useState('cuadrado'); // 'cuadrado' | 'stories'
  const [titulo, setTitulo] = useState('¡EN ADOPCIÓN RESPONSABLE!');
  const [subtitulo, setSubtitulo] = useState('Busco una familia que me ame para siempre');
  const [contactoNombre, setContactoNombre] = useState(configPortal?.nombre_guardia || 'Génesis (Rescatista a Cargo)');
  const [contactoTelefono, setContactoTelefono] = useState(configPortal?.telefono_guardia || '+54 9 11 9988-7766');
  const [zona, setZona] = useState(animal?.ubicacion_rescate || configPortal?.zona_cobertura || 'CABA / Gran Buenos Aires');
  const [mostrarSalud, setMostrarSalud] = useState(true);
  const [requisitoTexto, setRequisitoTexto] = useState('Compromiso de seguimiento y cuidados veterinarios.');

  if (!animal) return null;

  const photoUrl = animal.foto_portada || animal.foto_portada_url || 
    (animal.especie === 'gato' 
      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80');

  // Descargar el flyer generado como PNG de alta resolución
  const handleDownloadImage = async () => {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2, // 2x para resolución retina / 1080px nítido
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF'
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `LUMIA_Flyer_${animal.nombre_actual || 'Mascota'}_${animal.codigo_interno || 'ADOP'}.png`;
      link.click();
    } catch (err) {
      console.error('Error al generar imagen del flyer:', err);
      alert('Hubo un error al generar la imagen. Podés hacer captura de pantalla o copiar el texto.');
    } finally {
      setDownloading(false);
    }
  };

  // Generar texto optimizado para Instagram / Facebook
  const socialText = `🐾 ${titulo.toUpperCase()} 🐾
¡Hola! Me llamo ${animal.nombre_actual || 'esta hermosura'} (${animal.codigo_interno || 'LUMIA'}).

📌 Sobre mí:
• Especie: ${animal.especie === 'gato' ? 'Gatito/a 🐱' : 'Perrito/a 🐶'}
• Sexo: ${animal.sexo || 'Hembra'}
• Edad aproximada: ${animal.edad_estimada || animal.edad_estimada_categoria || 'Joven'}
• Tamaño: ${animal.tamano || 'Mediano'}
• Señas: ${animal.pelaje_color_senas_particulares || animal.color_pelaje_senas || 'Hermoso pelaje mestizo'}
• Carácter: ${animal.relacion_con_personas || animal.notas_conducta || 'Súper cariñoso/a, sociable y juguetón/a.'}

🩺 Salud:
${mostrarSalud ? '✅ Desparasitado/a\n✅ Plan sanitario al día\n✅ Castrado/a o con compromiso de castración formal' : 'En plan sanitario preventivo.'}

🏡 Requisitos de Adopción:
${requisitoTexto}
📍 Zona: ${zona}

📲 Contacto directo con la rescatista a cargo:
${contactoNombre} 👉 ${contactoTelefono}
Formulario web de postulación: ${window.location.origin}/?portal=adopciones

¡Ayudanos a difundir compartiendo este post! Un like y un RT pueden cambiarle la vida. 🧡
.
#AdoptaNoCompres #LUMIA #PatitaAliada #AdopcionResponsable #RescateAnimal #PerrosEnAdopcion #GatosEnAdopcion`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(socialText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(socialText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Generador de Flyer para Redes Sociales • ${animal.nombre_actual}`}
      subtitle="Creá y descargá piezas gráficas listas para publicar en Instagram, Facebook o WhatsApp"
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panel Izquierdo: Opciones y personalización */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          {/* Selector de Formato */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Formato de Publicación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormato('cuadrado')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  formato === 'cuadrado' 
                    ? 'bg-lumia-500 text-white border-lumia-600 shadow-sm' 
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Post (1:1 Cuadrado)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormato('stories')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  formato === 'stories' 
                    ? 'bg-lumia-500 text-white border-lumia-600 shadow-sm' 
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Story / Estado (9:16)</span>
              </button>
            </div>
          </div>

          {/* Título de impacto */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Título de Impacto (Gancho)
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-stone-800 focus:ring-2 focus:ring-lumia-500"
              placeholder="Ej: ¡EN ADOPCIÓN RESPONSABLE!"
            />
          </div>

          {/* Subtítulo */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Lema o Subtítulo
            </label>
            <input
              type="text"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 focus:ring-2 focus:ring-lumia-500"
              placeholder="Ej: Busco una familia que me ame"
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Rescatista a Cargo
              </label>
              <input
                type="text"
                value={contactoNombre}
                onChange={(e) => setContactoNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={contactoTelefono}
                onChange={(e) => setContactoTelefono(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 font-mono"
              />
            </div>
          </div>

          {/* Zona */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Zona de Rescate / Entrega
            </label>
            <input
              type="text"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800"
            />
          </div>

          {/* Requisitos breves */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Requisitos Breves
            </label>
            <input
              type="text"
              value={requisitoTexto}
              onChange={(e) => setRequisitoTexto(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800"
            />
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="w-full py-3 px-4 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-sm shadow-md shadow-lumia-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generando imagen PNG...' : 'Descargar Flyer (PNG 1080px)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyText}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold border border-stone-300 transition-all flex items-center justify-center gap-1.5"
              >
                {copiedText ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                <span>{copiedText ? '¡Copiado!' : 'Copiar Texto Post'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Previsualización del Flyer (Canvas) */}
        <div className="lg:col-span-7 flex flex-col items-center bg-stone-100 p-4 rounded-3xl border border-stone-200 overflow-x-auto">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
            Vista Previa en Tiempo Real ({formato === 'cuadrado' ? '1:1 Post' : '9:16 Stories'})
          </p>

          {/* Contenedor del Flyer capturable */}
          <div
            ref={flyerRef}
            className={`bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-lumia-500 flex flex-col justify-between transition-all ${
              formato === 'cuadrado' 
                ? 'w-[360px] h-[360px] sm:w-[420px] sm:h-[420px]' 
                : 'w-[320px] h-[520px] sm:w-[350px] sm:h-[570px]'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Header del Flyer con Logo LUMIA muy visible */}
            <div className="bg-gradient-to-r from-lumia-500 via-lumia-600 to-[#A6381D] px-4 py-2.5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-xl shadow-sm">
                  <Logo variant="icon-only" size="sm" className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-xs tracking-wider leading-none">LUMIA</p>
                  <p className="text-[8px] font-bold tracking-tight text-lumia-100 uppercase">
                    Libreta Única de Mascotas
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold tracking-wider">
                {animal.codigo_interno || 'ADOP-001'}
              </span>
            </div>

            {/* Cuerpo del Flyer */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between overflow-hidden">
              {/* Encabezado del caso */}
              <div className="text-center">
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-lumia-100 text-lumia-800 uppercase tracking-wider mb-1">
                  {titulo}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-tight">
                  {animal.nombre_actual || 'Mascota'}
                </h2>
                <p className="text-[10px] sm:text-xs text-stone-500 font-medium line-clamp-1">
                  {subtitulo}
                </p>
              </div>

              {/* Imagen central destacada */}
              <div className="my-2 relative rounded-2xl overflow-hidden border-2 border-lumia-100 shadow-md bg-stone-100 flex-1 max-h-[190px] sm:max-h-[220px]">
                <img
                  src={photoUrl}
                  alt={animal.nombre_actual}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-xl bg-stone-900/80 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold">
                    {animal.especie === 'gato' ? '🐱 Gato' : '🐶 Perro'} • {animal.sexo}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-lumia-600/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold">
                    {animal.edad_estimada || animal.edad_estimada_categoria || 'Joven'}
                  </span>
                </div>
              </div>

              {/* Rasgos y Salud */}
              <div className="space-y-1.5 text-[10px] sm:text-[11px] text-stone-700">
                <p className="line-clamp-2 leading-tight">
                  <strong className="text-stone-900">Personalidad:</strong> {animal.relacion_con_personas || animal.notas_conducta || 'Muy cariñoso/a, ideal para familia.'}
                </p>
                {mostrarSalud && (
                  <div className="flex flex-wrap gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-800">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">✓ Castrado/a</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">✓ Vacunado/a</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">✓ Desparasitado/a</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Flyer con Contacto */}
            <div className="bg-stone-50 border-t border-stone-200 px-3 py-2 flex items-center justify-between text-stone-800 text-[10px] sm:text-[11px] shrink-0">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-lumia-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-stone-900 leading-tight">{contactoTelefono}</p>
                  <p className="text-[9px] text-stone-500 font-medium leading-none">{contactoNombre}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-1 text-stone-500">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="text-[9px] font-semibold">{zona}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalFlyerRedes;
