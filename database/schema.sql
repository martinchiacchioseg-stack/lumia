-- ============================================================================
-- PATITA ALIADA - SISTEMA INTEGRAL DE GESTIÓN DE RESCATES Y ADOPCIONES
-- ESQUEMA COMPLETO DE BASE DE DATOS (POSTGRESQL 14+)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TIPOS ENUM PERSONALIZADOS
-- ============================================================================
CREATE TYPE especie_enum AS ENUM ('Perro', 'Gato', 'Otro');
CREATE TYPE sexo_enum AS ENUM ('Macho', 'Hembra');
CREATE TYPE edad_categoria_enum AS ENUM (
    'Cachorro lactante', 
    'Cachorro 2-6 meses', 
    'Joven', 
    'Adulto', 
    'Senior'
);
CREATE TYPE tamano_enum AS ENUM ('Mini', 'Chico', 'Mediano', 'Grande', 'Gigante');
CREATE TYPE estado_caso_enum AS ENUM (
    'Rescatado', 
    'En transito', 
    'En adopcion', 
    'Adoptado', 
    'Fallecido'
);

CREATE TYPE tipo_vivienda_enum AS ENUM (
    'Casa con patio cerrado', 
    'Casa cerco abierto', 
    'Departamento', 
    'Campo/Quinta'
);
CREATE TYPE condicion_vivienda_enum AS ENUM (
    'Propietario', 
    'Inquilino con permiso'
);
CREATE TYPE estado_adoptante_enum AS ENUM (
    'Apto', 
    'En evaluación', 
    'No apto / Alerta'
);

CREATE TYPE modalidad_entrega_enum AS ENUM (
    'Llevado a domicilio', 
    'Retirado por adoptante'
);
CREATE TYPE estado_adopcion_enum AS ENUM (
    'En adaptacion', 
    'Activa con seguimiento', 
    'Caso cerrado exitoso', 
    'Devolucion / Rescate recuperado'
);

CREATE TYPE tipo_contacto_enum AS ENUM ('WhatsApp', 'Llamada', 'Visita presencial');
CREATE TYPE estado_general_enum AS ENUM ('Excelente', 'Normal', 'Regular', 'Alerta');

CREATE TYPE tipo_evento_salud_enum AS ENUM (
    'Vacuna Antirrabica', 
    'Vacuna Multiple', 
    'Desparasitacion interna', 
    'Desparasitacion externa', 
    'Castracion', 
    'Cirugia/Tratamiento', 
    'Analisis/Estudio', 
    'Consulta general'
);

CREATE TYPE urgencia_reporte_enum AS ENUM (
    'Critica / Atropello', 
    'Herido leve', 
    'Cachorros abandonados', 
    'En peligro', 
    'Avistamiento'
);
CREATE TYPE estado_reporte_enum AS ENUM (
    'Pendiente', 
    'En camino', 
    'Rescatado', 
    'Desestimado'
);

CREATE TYPE rol_usuario_enum AS ENUM (
    'SUPERADMIN',
    'ADMIN',
    'RESCATISTA',
    'HOGAR_TRANSITO',
    'VOLUNTARIO'
);

CREATE TYPE estado_postulacion_enum AS ENUM (
    'Pendiente',
    'En revision',
    'Entrevista agendada',
    'Aprobada',
    'Rechazada'
);

CREATE TYPE estado_pago_enum AS ENUM (
    'Pendiente',
    'Pagado parcial',
    'Pagado total',
    'Condonado / Donado'
);

-- Función para actualizar columnas updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. TABLA: usuarios (RBAC, Autenticación y Control de Contraseña Obligatoria)
-- ============================================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario_enum NOT NULL DEFAULT 'VOLUNTARIO',
    debe_cambiar_password BOOLEAN NOT NULL DEFAULT FALSE,
    telefono VARCHAR(30),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_ingreso TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. TABLA: animales (Ficha 360, señas, chip y estado del caso)
-- ============================================================================
CREATE TABLE animales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_interno VARCHAR(50) NOT NULL UNIQUE,
    numero_chip VARCHAR(50),
    nombre_actual VARCHAR(100) NOT NULL,
    nombre_rescate VARCHAR(100),
    especie especie_enum NOT NULL,
    sexo sexo_enum NOT NULL,
    edad_estimada_categoria edad_categoria_enum NOT NULL,
    fecha_nacimiento_aprox DATE,
    tamano tamano_enum NOT NULL,
    color_pelaje_senas TEXT,
    estado_caso estado_caso_enum NOT NULL DEFAULT 'Rescatado',
    fecha_rescate DATE NOT NULL DEFAULT CURRENT_DATE,
    ubicacion_rescate VARCHAR(255),
    rescatista_a_cargo VARCHAR(120) NOT NULL,
    hogar_transito_actual VARCHAR(150),
    foto_portada_url VARCHAR(500),
    galeria_fotos_url JSONB DEFAULT '[]'::jsonb,
    notas_conducta TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_animales_updated_at BEFORE UPDATE ON animales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. TABLA: adoptantes (Directorio e historial de idoneidad)
-- ============================================================================
CREATE TABLE adoptantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(150) NOT NULL,
    dni_cuit VARCHAR(25) NOT NULL UNIQUE,
    telefono_whatsapp VARCHAR(30) NOT NULL,
    telefono_secundario VARCHAR(30),
    email VARCHAR(120),
    direccion_calle_numero VARCHAR(200) NOT NULL,
    localidad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    tipo_vivienda tipo_vivienda_enum NOT NULL,
    condicion_vivienda condicion_vivienda_enum NOT NULL,
    redes_sociales VARCHAR(255),
    url_dni_adjunto VARCHAR(500),
    estado_adoptante estado_adoptante_enum NOT NULL DEFAULT 'En evaluación',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_adoptantes_updated_at BEFORE UPDATE ON adoptantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TABLA: adopciones (Vínculo formal, período de prueba y contrato)
-- ============================================================================
CREATE TABLE adopciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animales(id) ON DELETE RESTRICT,
    adoptante_id UUID NOT NULL REFERENCES adoptantes(id) ON DELETE RESTRICT,
    fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    modalidad_entrega modalidad_entrega_enum NOT NULL,
    periodo_adaptacion_dias INTEGER NOT NULL DEFAULT 15 CHECK (periodo_adaptacion_dias >= 0),
    url_contrato_firmado VARCHAR(500),
    estado_adopcion estado_adopcion_enum NOT NULL DEFAULT 'En adaptacion',
    observaciones_entrega TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_adopciones_updated_at BEFORE UPDATE ON adopciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. TABLA: seguimientos (Bitácora posadopción con multimedia)
-- ============================================================================
CREATE TABLE seguimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adopcion_id UUID NOT NULL REFERENCES adopciones(id) ON DELETE CASCADE,
    fecha_contacto DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_contacto tipo_contacto_enum NOT NULL DEFAULT 'WhatsApp',
    estado_general estado_general_enum NOT NULL DEFAULT 'Normal',
    url_multimedia_prueba JSONB DEFAULT '[]'::jsonb,
    notas_observaciones TEXT NOT NULL,
    proximo_control_fecha DATE,
    registrado_por VARCHAR(120),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. TABLA: eventos_salud (Libreta sanitaria y vencimientos)
-- ============================================================================
CREATE TABLE eventos_salud (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    tipo_evento tipo_evento_salud_enum NOT NULL,
    fecha_aplicacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_proximo_vencimiento DATE,
    veterinaria_profesional VARCHAR(150),
    producto_medicamento VARCHAR(150),
    dosis_lote VARCHAR(80),
    url_comprobante_estudio VARCHAR(500),
    observaciones TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. TABLA: reportes_calle (Rescates exprés comunitarios en tiempo real)
-- ============================================================================
CREATE TABLE reportes_calle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_reporta VARCHAR(120) NOT NULL,
    fecha_hora_reporte TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ubicacion_geolocalizacion VARCHAR(255) NOT NULL,
    latitud NUMERIC(10, 8),
    longitud NUMERIC(11, 8),
    foto_reporte_url VARCHAR(500),
    urgencia urgencia_reporte_enum NOT NULL DEFAULT 'En peligro',
    descripcion_situacion TEXT NOT NULL,
    estado_reporte estado_reporte_enum NOT NULL DEFAULT 'Pendiente',
    animal_asignado_id UUID REFERENCES animales(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. TABLA (MEJORA): gastos_caso (Control contable y deudas veterinarias)
-- ============================================================================
CREATE TABLE gastos_caso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    concepto VARCHAR(200) NOT NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto >= 0),
    veterinaria_proveedor VARCHAR(150),
    fecha_gasto DATE NOT NULL DEFAULT CURRENT_DATE,
    estado_pago estado_pago_enum NOT NULL DEFAULT 'Pendiente',
    url_factura_recibo VARCHAR(500),
    notas TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. TABLA (MEJORA): postulaciones_adopcion (Embudo público desde redes)
-- ============================================================================
CREATE TABLE postulaciones_adopcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    postulante_nombre VARCHAR(150) NOT NULL,
    postulante_email VARCHAR(120) NOT NULL,
    postulante_telefono VARCHAR(30) NOT NULL,
    localidad VARCHAR(100) NOT NULL,
    convive_con_animales BOOLEAN NOT NULL DEFAULT FALSE,
    tipo_vivienda VARCHAR(80) NOT NULL,
    motivo_adopcion TEXT NOT NULL,
    estado_postulacion estado_postulacion_enum NOT NULL DEFAULT 'Pendiente',
    adoptante_creado_id UUID REFERENCES adoptantes(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÍNDICES ESTRATÉGICOS
-- ============================================================================
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

CREATE INDEX idx_animales_codigo ON animales(codigo_interno);
CREATE INDEX idx_animales_estado ON animales(estado_caso) WHERE deleted_at IS NULL;
CREATE INDEX idx_adoptantes_dni ON adoptantes(dni_cuit);
CREATE INDEX idx_adoptantes_telefono ON adoptantes(telefono_whatsapp);

CREATE INDEX idx_adopciones_animal ON adopciones(animal_id);
CREATE INDEX idx_adopciones_adoptante ON adopciones(adoptante_id);
CREATE INDEX idx_seguimientos_proximo ON seguimientos(proximo_control_fecha);
CREATE INDEX idx_eventos_salud_vencimiento ON eventos_salud(animal_id, fecha_proximo_vencimiento);
CREATE INDEX idx_reportes_urgencia ON reportes_calle(estado_reporte, urgencia);
CREATE INDEX idx_gastos_animal ON gastos_caso(animal_id, estado_pago);

-- ============================================================================
-- VISTA DE SEMÁFORO POSADOPCIÓN
-- ============================================================================
CREATE OR REPLACE VIEW vista_semaforo_adopciones AS
WITH ultimo_control AS (
    SELECT DISTINCT ON (adopcion_id)
        adopcion_id,
        fecha_contacto,
        estado_general,
        proximo_control_fecha
    FROM seguimientos
    WHERE deleted_at IS NULL
    ORDER BY adopcion_id, fecha_contacto DESC, created_at DESC
)
SELECT 
    ad.id AS adopcion_id,
    an.id AS animal_id,
    an.codigo_interno,
    an.nombre_actual AS animal_nombre,
    an.foto_portada_url AS animal_foto,
    adop.id AS adoptante_id,
    adop.nombre_completo AS adoptante_nombre,
    adop.telefono_whatsapp,
    ad.fecha_entrega,
    ad.periodo_adaptacion_dias,
    ad.estado_adopcion,
    uc.fecha_contacto AS ultimo_contacto_fecha,
    uc.proximo_control_fecha,
    uc.estado_general AS ultimo_estado_general,
    CASE 
        WHEN ad.estado_adopcion = 'Caso cerrado exitoso' THEN 'VERDE'
        WHEN uc.estado_general = 'Alerta' THEN 'ROJO'
        WHEN uc.proximo_control_fecha IS NOT NULL AND CURRENT_DATE > uc.proximo_control_fecha THEN 'ROJO'
        WHEN uc.proximo_control_fecha IS NOT NULL AND (uc.proximo_control_fecha - CURRENT_DATE) <= 5 THEN 'AMARILLO'
        WHEN uc.proximo_control_fecha IS NULL AND (CURRENT_DATE - ad.fecha_entrega) > ad.periodo_adaptacion_dias THEN 'AMARILLO'
        ELSE 'VERDE'
    END AS color_semaforo
FROM adopciones ad
JOIN animales an ON ad.animal_id = an.id
JOIN adoptantes adop ON ad.adoptante_id = adop.id
LEFT JOIN ultimo_control uc ON ad.id = uc.adopcion_id
WHERE ad.deleted_at IS NULL AND ad.estado_adopcion IN ('En adaptacion', 'Activa con seguimiento');
