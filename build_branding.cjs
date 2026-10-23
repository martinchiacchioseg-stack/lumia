const fs = require('fs');
const path = require('path');

const brandingDir = path.join(__dirname, 'src', 'assets', 'branding');
const outputJs = path.join(__dirname, 'src', 'lib', 'brandingAssets.js');

const finalPng = path.join(brandingDir, 'lumia_final_transparente.png');
const whiteWebp = path.join(brandingDir, 'image_20261022_225441.webp');
const miniTextWebp = path.join(brandingDir, 'lumia_mini_texto_transparente.webp');

const finalBase64 = 'data:image/png;base64,' + fs.readFileSync(finalPng).toString('base64');
const whiteBase64 = 'data:image/webp;base64,' + fs.readFileSync(whiteWebp).toString('base64');
const miniTextBase64 = 'data:image/webp;base64,' + fs.readFileSync(miniTextWebp).toString('base64');

const content = `// IDENTIDAD VISUAL OFICIAL LUMIA
// LIBRETA ÚNICA DE MASCOTAS, INFORMES Y ADOPCIONES
// Color corporativo oficial: #C94A2A (terracota vívido)

export const LUMIA_COLORS = {
  primary: '#C94A2A', // Terracota vívido oficial
  primaryDark: '#A6381D',
  primaryLight: '#FAF0ED',
  primaryBorder: '#E8A392',
  textDark: '#2B2321',
  textMuted: '#6E625F',
  backgroundCard: '#FFFFFF',
  borderLight: '#E8DFDC',
};

// Rutas estáticas optimizadas para componentes React y Vite
export const LUMIA_ASSETS = {
  logoFinalTransparente: '/assets/branding/lumia_final_transparente.png',
  logoOficialBlanco: '/assets/branding/image_20261022_225441.webp',
  logoMiniTexto: '/assets/branding/lumia_mini_texto_transparente.webp',
};

// Base64 empaquetado para inyección inmediata en PDFs (jspdf / canvas) sin latencia de red
export const LUMIA_LOGO_BASE64 = "${finalBase64}";
export const LUMIA_LOGO_WHITE_BASE64 = "${whiteBase64}";
export const LUMIA_MINI_TEXT_BASE64 = "${miniTextBase64}";
`;

fs.writeFileSync(outputJs, content, 'utf-8');
console.log('brandingAssets.js creado con éxito!');
