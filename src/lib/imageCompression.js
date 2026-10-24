/**
 * Utilidad de compresión de imágenes en el cliente (Navegador).
 * Reduce la resolución a un máximo de 1200px en el lado mayor
 * y comprime a JPEG con calidad 80% (0.8) para optimizar la velocidad
 * de subida y no consumir datos innecesarios en móviles.
 */
export async function compressImage(file, maxDimension = 1200, quality = 0.8) {
  if (!file) {
    throw new Error('No se proporcionó ningún archivo de imagen para comprimir.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo de imagen en el dispositivo.'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('El archivo seleccionado no es una imagen válida o compatible.'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Redimensionar si supera el tamaño máximo permitido
          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('No se pudo inicializar el contexto de procesamiento 2D.');
          }

          // Mejorar calidad de interpolación
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fondo blanco en caso de PNGs transparentes
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          // Exportar en JPEG al 80%
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Calcular tamaño aproximado del Base64
          const base64Content = compressedDataUrl.split(',')[1] || compressedDataUrl;
          const approximateBytes = Math.round((base64Content.length * 3) / 4);

          resolve({
            dataUrl: compressedDataUrl,
            base64: base64Content,
            mimeType: 'image/jpeg',
            width,
            height,
            originalSize: file.size,
            compressedSize: approximateBytes,
            ratio: file.size > 0 ? ((approximateBytes / file.size) * 100).toFixed(1) + '%' : '100%'
          });
        } catch (canvasErr) {
          reject(canvasErr);
        }
      };

      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
}
