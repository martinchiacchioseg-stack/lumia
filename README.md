# 🐾 Patita Aliada — Sistema de Gestión para Rescatistas Independientes

Sistema web progresivo (PWA), mobile-first y listo para producción, diseñado para centralizar la gestión de animales rescatados, historias clínicas, adoptantes, seguimiento posadopción con alertas inteligentes y reportes comunitarios en la vía pública en Argentina.

---

## 🚀 Inicio Rápido (Modo Local / Demostración)

La aplicación incluye un proveedor local de datos con almacenamiento persistente (`localStorage`) y las cuentas iniciales ya configuradas, lo que permite probar el 100% de la funcionalidad de inmediato sin dependencias previas:

```bash
# 1. Acceder al directorio
cd patita-aliada

# 2. Instalar dependencias (ya instaladas)
npm install

# 3. Iniciar el servidor de desarrollo Vite
npm run dev
```

Abre tu navegador en `http://localhost:5173`.

---

## 🔑 Cuentas Iniciales para Pruebas

En la pantalla de inicio de sesión se encuentran disponibles botones de acceso directo para autocompletar estas credenciales:

1. **Superadministrador (Dueño técnico):**
   - **Email:** `martinchiacchio.seg@gmail.com`
   - **Contraseña inicial:** `Chiacchio@1938`
   - **Comportamiento:** Requiere cambio obligatorio de contraseña en el primer ingreso. Acceso total a auditoría, usuarios y configuración.

2. **Administradora (Rescatista operativa):**
   - **Email:** `genesisbustamante88@gmail.com`
   - **Contraseña temporal:** `123456`
   - **Comportamiento:** Requiere cambio obligatorio de contraseña en el primer ingreso (mínimo 8 caracteres, no puede ser `123456` ni igual a la anterior). Gestión de animales, adopciones, seguimientos y creación de usuarios.

---

## ☁️ Conexión con Supabase (PostgreSQL en la Nube)

### Paso 1: Crear el Proyecto en Supabase
1. Ingresá a [Supabase](https://supabase.com) y creá un nuevo proyecto.
2. Seleccioná una región cercana (por ejemplo `sa-east-1` en San Pablo).

### Paso 2: Ejecutar las Migraciones SQL
1. En el panel de Supabase, andá a **SQL Editor** -> **New Query**.
2. Pegá y ejecutá el contenido del archivo:
   `supabase/migrations/20261022_schema_completo.sql`
   *(Crea las tablas, enums, triggers de updated_at, función de generación automática del calendario de 6 controles posadopción, funciones de RLS y buckets de Storage)*.

### Paso 3: Ejecutar el Seed de Cuentas y Casos
1. Abrí otra pestaña en el **SQL Editor**.
2. Pegá y ejecutá el contenido de:
   `supabase/seed/seed_cuentas_iniciales.sql`
   *(Crea los roles del sistema, la matriz de permisos iniciales, las dos cuentas requeridas hasheadas con bcrypt, 3 animales de prueba, 2 adoptantes, seguimientos y reportes de calle)*.

### Paso 4: Configurar Variables de Entorno
Copiá el archivo `.env.example` como `.env` y completá las claves obtenidas en **Project Settings -> API**:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Reiniciá el servidor (`npm run dev`) y verás en el encabezado de la app la confirmación **"Supabase Conectado"**.

---

## 🚀 Despliegue en Vercel

1. Subí este proyecto a un repositorio de GitHub / GitLab.
2. Ingresá a [Vercel](https://vercel.com) y hacé click en **"Add New Project"**.
3. Importá el repositorio `patita-aliada`.
4. En **Environment Variables**, agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Hacé click en **"Deploy"**.
6. El archivo `vercel.json` incluido ya maneja las rutas SPA y el Service Worker para que funcione como PWA instalable en celulares.

---

## 📱 Funcionalidades Destacadas

- **PWA Mobile-First:** Diseñada para usarse cómodamente con una sola mano desde el celular en la calle o refugio.
- **Calendario Posadopción Automatizado:** Al entregar un animal en adopción, el sistema genera automáticamente 6 controles programados (48-72 hs, 15 días, 1 mes, 3 meses, 6 meses y 1 año).
- **Semáforo de Seguimiento:** Destaca en rojo los casos con alertas de convivencia o salud.
- **Botón Directo de WhatsApp (`wa.me`):** Redacta mensajes cordiales en tono rescatista solicitando fotos y novedades, listos para enviar en un toque.
- **Protección de Datos Sensibles (Ley 25.326):** DNI, fotos de DNI y domicilio exacto quedan ocultos para usuarios sin el permiso explícito.
- **Reportes de Calle con Mapa Interactivo:** Geolocalización automática por GPS celular, fotos y botón "Convertir a Ficha de Rescate" que copia toda la información en un segundo.
- **Libreta Sanitaria Digital Imprimible:** Generá e imprimí la ficha médica limpia y ordenada para entregar a la familia adoptante.
- **Importador CSV con Validación:** Permite migrar planillas de Excel previas sin duplicar ni romper datos.
