-- =====================================================================
-- PATITA ALIADA - ESQUEMA DE BASE DE DATOS COMPLETO (SUPABASE / POSTGRESQL)
-- Sistema de gestión para rescatistas independientes de animales
-- =====================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Función genérica para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 3. TABLAS DE SEGURIDAD, USUARIOS Y PERMISOS GRANULARES
-- =====================================================================

-- Tabla de Roles (con soporte de roles de sistema inmutables)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    es_sistema BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Permisos por Rol (Matriz granular de permisos)
CREATE TABLE IF NOT EXISTS public.permisos_rol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    modulo TEXT NOT NULL, -- 'animales', 'adoptantes', 'adopciones', 'seguimientos', 'salud', 'reportes_calle', 'import_export', 'estadisticas', 'usuarios'
    accion TEXT NOT NULL, -- 'ver', 'crear', 'editar', 'archivar', 'exportar'
    permitido BOOLEAN DEFAULT true,
    datos_sensibles BOOLEAN DEFAULT false, -- Permiso especial para DNI, fotos de DNI y domicilio completo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_rol_modulo_accion UNIQUE (rol_id, modulo, accion)
);

-- Tabla de Perfiles vinculada a Supabase Auth
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    rol_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
    activo BOOLEAN DEFAULT true,
    must_change_password BOOLEAN DEFAULT true,
    creado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ultimo_ingreso TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Auditoría de cambios
CREATE TABLE IF NOT EXISTS public.auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accion TEXT NOT NULL, -- 'crear', 'editar', 'archivar', 'login', 'cambio_password'
    tabla_afectada TEXT NOT NULL,
    registro_id UUID,
    detalle_cambio JSONB DEFAULT '{}'::jsonb,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 4. TABLAS OPERATIVAS PRINCIPALES
-- =====================================================================

-- Secuencia para códigos internos DOG-001, CAT-001, OTH-001
CREATE SEQUENCE IF NOT EXISTS seq_animal_dog START 1;
CREATE SEQUENCE IF NOT EXISTS seq_animal_cat START 1;
CREATE SEQUENCE IF NOT EXISTS seq_animal_oth START 1;

-- Tabla de Animales
CREATE TABLE IF NOT EXISTS public.animales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_interno TEXT UNIQUE NOT NULL,
    nombre_actual TEXT NOT NULL,
    nombre_anterior_apodo TEXT,
    especie TEXT NOT NULL CHECK (especie IN ('perro', 'gato', 'otro')),
    sexo TEXT NOT NULL CHECK (sexo IN ('macho', 'hembra')),
    edad_estimada TEXT CHECK (edad_estimada IN ('cachorro lactante', 'cachorro 2-6 meses', 'joven', 'adulto', 'senior')),
    fecha_nacimiento_aproximada DATE,
    tamano TEXT CHECK (tamano IN ('mini', 'chico', 'mediano', 'grande', 'gigante')),
    pelaje_color_senas_particulares TEXT,
    estado_caso TEXT NOT NULL DEFAULT 'rescatado' CHECK (estado_caso IN ('rescatado', 'en tránsito', 'en adopción', 'adoptado', 'fallecido')),
    fecha_rescate DATE NOT NULL DEFAULT CURRENT_DATE,
    ubicacion_rescate TEXT,
    latitud NUMERIC,
    longitud NUMERIC,
    rescatista_a_cargo UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transito_previo JSONB DEFAULT '{}'::jsonb, -- { nombre, direccion, telefono }
    foto_portada TEXT,
    galeria JSONB DEFAULT '[]'::jsonb, -- [{ id, url, categoria: 'rescate'|'evolucion'|'familia_adoptiva', fecha, notas }]
    -- Conducta y convivencia
    relacion_con_perros TEXT,
    relacion_con_gatos TEXT,
    relacion_con_personas TEXT, -- niños, tímido, miedo a hombres, etc.
    nivel_energia TEXT CHECK (nivel_energia IN ('tranquilo', 'moderado', 'muy activo')),
    manejo_correa_paseos TEXT,
    notas_conducta TEXT, -- ansiedad por separación, reactividad, etc.
    alimentacion_recomendada TEXT,
    archivado BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Adoptantes (cumplimiento Ley 25.326 de Protección de Datos Personales de Argentina)
CREATE TABLE IF NOT EXISTS public.adoptantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_apellido TEXT NOT NULL,
    dni_cuit TEXT NOT NULL,
    telefono_whatsapp TEXT NOT NULL,
    telefono_secundario TEXT,
    direccion_calle TEXT,
    direccion_numero TEXT,
    direccion_entrecalles TEXT,
    direccion_piso_depto TEXT,
    direccion_barrio TEXT,
    direccion_localidad TEXT,
    direccion_provincia TEXT DEFAULT 'Buenos Aires',
    tipo_vivienda TEXT CHECK (tipo_vivienda IN ('casa con patio cerrado', 'casa con cerco abierto', 'departamento', 'campo')),
    condicion_vivienda TEXT CHECK (condicion_vivienda IN ('propietario', 'inquilino con permiso para mascotas')),
    redes_sociales JSONB DEFAULT '{}'::jsonb, -- { instagram, facebook, twitter }
    foto_dni_frente TEXT, -- Storage privado (requiere permiso de datos sensibles)
    foto_dni_dorso TEXT,  -- Storage privado (requiere permiso de datos sensibles)
    consentimiento_datos BOOLEAN DEFAULT true, -- Ley 25.326
    archivado BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Adopciones (Nexo animal-adoptante con historial)
CREATE TABLE IF NOT EXISTS public.adopciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES public.animales(id) ON DELETE RESTRICT,
    adoptante_id UUID NOT NULL REFERENCES public.adoptantes(id) ON DELETE RESTRICT,
    fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    modalidad_entrega TEXT NOT NULL CHECK (modalidad_entrega IN ('llevado al domicilio', 'retirado por el adoptante')),
    periodo_adaptacion_dias INTEGER DEFAULT 21,
    contrato_firmado TEXT, -- PDF o foto almacenada
    compromiso_castracion BOOLEAN DEFAULT false,
    fecha_limite_castracion DATE,
    estado_adopcion TEXT NOT NULL DEFAULT 'activo en seguimiento' CHECK (estado_adopcion IN ('activo en seguimiento', 'adopción consolidada', 'devolución / rescate recuperado')),
    observaciones TEXT,
    archivado BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Seguimientos (Bitácora posadopción con semáforo)
CREATE TABLE IF NOT EXISTS public.seguimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adopcion_id UUID NOT NULL REFERENCES public.adopciones(id) ON DELETE CASCADE,
    fecha_contacto DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_contacto TEXT NOT NULL CHECK (tipo_contacto IN ('WhatsApp', 'llamada', 'visita presencial', 'control programado')),
    foto_video_recibido TEXT,
    estado_general TEXT NOT NULL DEFAULT 'normal' CHECK (estado_general IN ('excelente', 'normal', 'regular', 'alerta')),
    observaciones TEXT,
    proxima_fecha_seguimiento DATE,
    completado BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Eventos de Salud (Historia Clínica Digital / Libreta Sanitaria)
CREATE TABLE IF NOT EXISTS public.eventos_salud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES public.animales(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_evento TEXT NOT NULL CHECK (tipo_evento IN (
        'vacuna antirrábica',
        'múltiple/séxtuple/triple felina',
        'otras vacunas',
        'castración/esterilización',
        'desparasitación interna',
        'desparasitación externa',
        'consulta',
        'cirugía',
        'diagnóstico',
        'tratamiento',
        'estudio'
    )),
    producto_o_detalle TEXT NOT NULL,
    profesional_veterinaria TEXT,
    lugar TEXT,
    diagnostico_enfermedad TEXT,
    medicacion_cronica BOOLEAN DEFAULT false,
    detalle_medicacion_cronica TEXT,
    fecha_proximo_refuerzo_o_vencimiento DATE,
    adjuntos JSONB DEFAULT '[]'::jsonb, -- [{ url, nombre, tipo }]
    archivado BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Reportes de Calle (Alertas Comunitarias)
CREATE TABLE IF NOT EXISTS public.reportes_calle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reportante_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fotos JSONB DEFAULT '[]'::jsonb,
    descripcion TEXT NOT NULL,
    latitud NUMERIC,
    longitud NUMERIC,
    direccion_aproximada TEXT,
    nivel_urgencia TEXT NOT NULL DEFAULT 'medio' CHECK (nivel_urgencia IN ('bajo', 'medio', 'alto', 'crítico')),
    estado_reporte TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado_reporte IN ('nuevo', 'tomado', 'en rescate', 'resuelto', 'descartado')),
    rescatista_asignada UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fecha_resolucion TIMESTAMPTZ,
    animal_id UUID REFERENCES public.animales(id) ON DELETE SET NULL,
    archivado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 5. TRIGGERS AUTOMÁTICOS
-- =====================================================================

-- Triggers de actualización de timestamps
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_permisos_rol_updated_at BEFORE UPDATE ON public.permisos_rol FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_perfiles_updated_at BEFORE UPDATE ON public.perfiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_animales_updated_at BEFORE UPDATE ON public.animales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_adoptantes_updated_at BEFORE UPDATE ON public.adoptantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_adopciones_updated_at BEFORE UPDATE ON public.adopciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_seguimientos_updated_at BEFORE UPDATE ON public.seguimientos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_eventos_salud_updated_at BEFORE UPDATE ON public.eventos_salud FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reportes_calle_updated_at BEFORE UPDATE ON public.reportes_calle FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función y trigger: Generación automática del calendario de seguimientos posadopción
-- (48-72 hs, 15 días, 1 mes, 3 meses, 6 meses y 1 año)
CREATE OR REPLACE FUNCTION generar_calendario_seguimientos()
RETURNS TRIGGER AS $$
DECLARE
    f_entrega DATE;
BEGIN
    f_entrega := NEW.fecha_entrega;

    -- Control 1: 48-72 horas (3 días)
    INSERT INTO public.seguimientos (adopcion_id, fecha_contacto, tipo_contacto, estado_general, observaciones, proxima_fecha_seguimiento, completado, created_by)
    VALUES (NEW.id, f_entrega + INTERVAL '3 days', 'WhatsApp', 'normal', 'Control inicial a las 48-72 hs: chequeo de adaptación inmediata, apetito y descanso.', f_entrega + INTERVAL '15 days', false, NEW.created_by);

    -- Control 2: 15 días
    INSERT INTO public.seguimientos (adopcion_id, fecha_contacto, tipo_contacto, estado_general, observaciones, proxima_fecha_seguimiento, completado, created_by)
    VALUES (NEW.id, f_entrega + INTERVAL '15 days', 'WhatsApp', 'normal', 'Control a los 15 días: finalización del período inicial de adaptación y paseos con correa.', f_entrega + INTERVAL '30 days', false, NEW.created_by);

    -- Control 3: 1 mes
    INSERT INTO public.seguimientos (adopcion_id, fecha_contacto, tipo_contacto, estado_general, observaciones, proxima_fecha_seguimiento, completado, created_by)
    VALUES (NEW.id, f_entrega + INTERVAL '30 days', 'WhatsApp', 'normal', 'Control a los 30 días: consolidación de rutinas de alimentación y convivencia.', f_entrega + INTERVAL '90 days', false, NEW.created_by);

    -- Control 4: 3 meses
    INSERT INTO public.seguimientos (adopcion_id, fecha_contacto, tipo_contacto, estado_general, observaciones, proxima_fecha_seguimiento, completado, created_by)
    VALUES (NEW.id, f_entrega + INTERVAL '90 days', 'WhatsApp', 'normal', 'Control a los 3 meses: revisión de salud, vacunas al día y castración.', f_entrega + INTERVAL '180 days', false, NEW.created_by);

    -- Control 5: 6 meses
    INSERT INTO public.seguimientos (adopcion_id, fecha_contacto, tipo_contacto, estado_general, observaciones, proxima_fecha_seguimiento, completado, created_by)
    VALUES (NEW.id, f_entrega + INTERVAL '180 days', 'WhatsApp', 'normal', 'Control semestral: revisión general y fotos familiares.', f_entrega + INTERVAL '365 days', false, NEW.created_by);

    -- Control 6: 1 año
    INSERT INTO public.seguimientos (adopcion_id, fecha_contacto, tipo_contacto, estado_general, observaciones, proxima_fecha_seguimiento, completado, created_by)
    VALUES (NEW.id, f_entrega + INTERVAL '365 days', 'WhatsApp', 'normal', 'Control al 1er año de adopción: aniversario de rescate y adopción plena.', NULL, false, NEW.created_by);

    -- Actualizar estado del animal a 'adoptado'
    UPDATE public.animales SET estado_caso = 'adoptado' WHERE id = NEW.animal_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_adopciones_generar_seguimientos
AFTER INSERT ON public.adopciones
FOR EACH ROW
EXECUTE FUNCTION generar_calendario_seguimientos();

-- =====================================================================
-- 6. FUNCIONES DE VALIDACIÓN DE PERMISOS PARA RLS
-- =====================================================================

-- Función para verificar rol del usuario
CREATE OR REPLACE FUNCTION public.get_user_role_name(uid UUID)
RETURNS TEXT AS $$
    SELECT r.nombre
    FROM public.perfiles p
    JOIN public.roles r ON p.rol_id = r.id
    WHERE p.id = uid AND p.activo = true;
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para evaluar si un usuario tiene un permiso específico (módulo + acción)
CREATE OR REPLACE FUNCTION public.has_permission(uid UUID, mod TEXT, acc TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_rol_name TEXT;
    has_perm BOOLEAN;
BEGIN
    SELECT r.nombre INTO user_rol_name
    FROM public.perfiles p
    JOIN public.roles r ON p.rol_id = r.id
    WHERE p.id = uid AND p.activo = true;

    -- Superadministrador y Administrador tienen acceso total operativo
    IF user_rol_name = 'Superadministrador' THEN
        RETURN true;
    END IF;

    IF user_rol_name = 'Administrador' THEN
        -- El administrador tiene permiso para todo excepto gestión técnica del superadmin
        IF mod = 'usuarios' AND acc = 'superadmin' THEN
            RETURN false;
        END IF;
        RETURN true;
    END IF;

    -- Para otros roles, evaluar la matriz de permisos
    SELECT COALESCE(pr.permitido, false) INTO has_perm
    FROM public.perfiles p
    JOIN public.permisos_rol pr ON pr.rol_id = p.rol_id
    WHERE p.id = uid
      AND p.activo = true
      AND pr.modulo = mod
      AND pr.accion = acc;

    RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar acceso a datos sensibles (DNI, fotos, domicilio completo)
CREATE OR REPLACE FUNCTION public.has_sensitive_data_permission(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_rol_name TEXT;
    has_sens BOOLEAN;
BEGIN
    SELECT r.nombre INTO user_rol_name
    FROM public.perfiles p
    JOIN public.roles r ON p.rol_id = r.id
    WHERE p.id = uid AND p.activo = true;

    IF user_rol_name IN ('Superadministrador', 'Administrador') THEN
        RETURN true;
    END IF;

    SELECT COALESCE(pr.datos_sensibles, false) INTO has_sens
    FROM public.perfiles p
    JOIN public.permisos_rol pr ON pr.rol_id = p.rol_id
    WHERE p.id = uid
      AND p.activo = true
      AND pr.modulo = 'adoptantes'
      AND pr.datos_sensibles = true
    LIMIT 1;

    RETURN COALESCE(has_sens, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos_rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoptantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adopciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_salud ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_calle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- Politicas para ROLES
CREATE POLICY "Lectura de roles autenticados" ON public.roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Modificación de roles solo por superadmin y admin" ON public.roles
    FOR ALL TO authenticated USING (
        public.get_user_role_name(auth.uid()) IN ('Superadministrador', 'Administrador')
    );

-- Politicas para PERMISOS_ROL
CREATE POLICY "Lectura de permisos para autenticados" ON public.permisos_rol
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Gestion de permisos por superadmin y admin" ON public.permisos_rol
    FOR ALL TO authenticated USING (
        public.get_user_role_name(auth.uid()) IN ('Superadministrador', 'Administrador')
    );

-- Politicas para PERFILES
CREATE POLICY "Ver perfiles activos" ON public.perfiles
    FOR SELECT TO authenticated USING (
        activo = true OR public.get_user_role_name(auth.uid()) IN ('Superadministrador', 'Administrador')
    );

CREATE POLICY "Editar propio perfil o por admin" ON public.perfiles
    FOR UPDATE TO authenticated USING (
        id = auth.uid() OR public.get_user_role_name(auth.uid()) IN ('Superadministrador', 'Administrador')
    );

-- Politicas para ANIMALES
CREATE POLICY "Ver animales no archivados con permiso" ON public.animales
    FOR SELECT TO authenticated USING (
        (NOT archivado OR public.has_permission(auth.uid(), 'animales', 'archivar'))
        AND public.has_permission(auth.uid(), 'animales', 'ver')
    );

CREATE POLICY "Crear animales con permiso" ON public.animales
    FOR INSERT TO authenticated WITH CHECK (
        public.has_permission(auth.uid(), 'animales', 'crear')
    );

CREATE POLICY "Editar animales con permiso" ON public.animales
    FOR UPDATE TO authenticated USING (
        public.has_permission(auth.uid(), 'animales', 'editar')
    );

CREATE POLICY "Archivar animales con permiso" ON public.animales
    FOR DELETE TO authenticated USING (
        public.has_permission(auth.uid(), 'animales', 'archivar')
    );

-- Politicas para ADOPTANTES
CREATE POLICY "Ver adoptantes con permiso" ON public.adoptantes
    FOR SELECT TO authenticated USING (
        public.has_permission(auth.uid(), 'adoptantes', 'ver')
    );

CREATE POLICY "Crear adoptantes con permiso" ON public.adoptantes
    FOR INSERT TO authenticated WITH CHECK (
        public.has_permission(auth.uid(), 'adoptantes', 'crear')
    );

CREATE POLICY "Editar adoptantes con permiso" ON public.adoptantes
    FOR UPDATE TO authenticated USING (
        public.has_permission(auth.uid(), 'adoptantes', 'editar')
    );

-- Politicas para ADOPCIONES
CREATE POLICY "Ver adopciones con permiso" ON public.adopciones
    FOR SELECT TO authenticated USING (
        public.has_permission(auth.uid(), 'adopciones', 'ver')
    );

CREATE POLICY "Crear adopciones con permiso" ON public.adopciones
    FOR INSERT TO authenticated WITH CHECK (
        public.has_permission(auth.uid(), 'adopciones', 'crear')
    );

CREATE POLICY "Editar adopciones con permiso" ON public.adopciones
    FOR UPDATE TO authenticated USING (
        public.has_permission(auth.uid(), 'adopciones', 'editar')
    );

-- Politicas para SEGUIMIENTOS
CREATE POLICY "Ver seguimientos con permiso" ON public.seguimientos
    FOR SELECT TO authenticated USING (
        public.has_permission(auth.uid(), 'seguimientos', 'ver')
    );

CREATE POLICY "Gestionar seguimientos con permiso" ON public.seguimientos
    FOR ALL TO authenticated USING (
        public.has_permission(auth.uid(), 'seguimientos', 'crear') OR public.has_permission(auth.uid(), 'seguimientos', 'editar')
    );

-- Politicas para EVENTOS DE SALUD
CREATE POLICY "Ver eventos de salud con permiso" ON public.eventos_salud
    FOR SELECT TO authenticated USING (
        public.has_permission(auth.uid(), 'salud', 'ver')
    );

CREATE POLICY "Gestionar salud con permiso" ON public.eventos_salud
    FOR ALL TO authenticated USING (
        public.has_permission(auth.uid(), 'salud', 'crear') OR public.has_permission(auth.uid(), 'salud', 'editar')
    );

-- Politicas para REPORTES DE CALLE
CREATE POLICY "Ver reportes con permiso o propios" ON public.reportes_calle
    FOR SELECT TO authenticated USING (
        public.has_permission(auth.uid(), 'reportes_calle', 'ver') OR reportante_id = auth.uid()
    );

CREATE POLICY "Crear reportes con permiso" ON public.reportes_calle
    FOR INSERT TO authenticated WITH CHECK (
        public.has_permission(auth.uid(), 'reportes_calle', 'crear') OR reportante_id = auth.uid()
    );

CREATE POLICY "Editar reportes con permiso" ON public.reportes_calle
    FOR UPDATE TO authenticated USING (
        public.has_permission(auth.uid(), 'reportes_calle', 'editar') OR reportante_id = auth.uid()
    );

-- Politicas para AUDITORIA
CREATE POLICY "Ver auditoria segun rol" ON public.auditoria
    FOR SELECT TO authenticated USING (
        public.get_user_role_name(auth.uid()) IN ('Superadministrador', 'Administrador')
    );

CREATE POLICY "Insertar auditoria autenticada" ON public.auditoria
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================================
-- 8. CONFIGURACIÓN DE STORAGE BUCKETS (PÚBLICO Y PRIVADO)
-- =====================================================================

-- Buckets de almacenamiento en Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('animales-fotos', 'animales-fotos', true),
    ('adoptantes-dni', 'adoptantes-dni', false),
    ('documentos-adopcion', 'documentos-adopcion', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: animales-fotos es público para lectura
CREATE POLICY "Fotos animales publicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'animales-fotos');

CREATE POLICY "Subir fotos animales autenticados" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'animales-fotos');

-- Storage Policy: adoptantes-dni privado restringido
CREATE POLICY "Ver DNI adoptantes solo con permiso" ON storage.objects
    FOR SELECT TO authenticated USING (
        bucket_id = 'adoptantes-dni' 
        AND public.has_sensitive_data_permission(auth.uid())
    );

CREATE POLICY "Subir DNI adoptantes autorizados" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'adoptantes-dni' 
        AND (public.has_permission(auth.uid(), 'adoptantes', 'crear') OR public.has_permission(auth.uid(), 'adoptantes', 'editar'))
    );
