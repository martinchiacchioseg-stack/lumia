-- =====================================================================
-- PATITA ALIADA - SEED DE DATOS INICIALES Y CUENTAS DE ADMINISTRACIÓN
-- =====================================================================

DO $$
DECLARE
    superadmin_role_id UUID;
    admin_role_id UUID;
    rescatista_role_id UUID;
    colaboradora_role_id UUID;
    sololectura_role_id UUID;

    superadmin_user_id UUID := gen_random_uuid();
    admin_user_id UUID := gen_random_uuid();

    animal_luna_id UUID := gen_random_uuid();
    animal_milo_id UUID := gen_random_uuid();
    animal_simba_id UUID := gen_random_uuid();

    adoptante_carla_id UUID := gen_random_uuid();
    adoptante_pablo_id UUID := gen_random_uuid();

    adopcion_luna_id UUID := gen_random_uuid();
BEGIN
    -- 1. CREACIÓN DE ROLES PRECARGADOS
    INSERT INTO public.roles (nombre, descripcion, es_sistema)
    VALUES 
        ('Superadministrador', 'Dueño técnico del sistema. Acceso irrestricto a datos, roles y configuración.', true)
    ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion
    RETURNING id INTO superadmin_role_id;

    INSERT INTO public.roles (nombre, descripcion, es_sistema)
    VALUES 
        ('Administrador', 'Rescatista responsable de operaciones. Gestión completa de casos, usuarios y adopciones.', true)
    ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion
    RETURNING id INTO admin_role_id;

    INSERT INTO public.roles (nombre, descripcion, es_sistema)
    VALUES 
        ('Rescatista', 'Gestiona sus propios casos asignados, ficha médica y seguimientos de adopción.', false)
    ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion
    RETURNING id INTO rescatista_role_id;

    INSERT INTO public.roles (nombre, descripcion, es_sistema)
    VALUES 
        ('Colaboradora', 'Colabora relevando animales en la vía pública y consultando el estado de sus reportes.', false)
    ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion
    RETURNING id INTO colaboradora_role_id;

    INSERT INTO public.roles (nombre, descripcion, es_sistema)
    VALUES 
        ('Solo lectura', 'Visualización de fichas y estadísticas sin permisos de modificación ni borrado.', false)
    ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion
    RETURNING id INTO sololectura_role_id;

    -- 2. MATRIZ DE PERMISOS PRECARGADOS
    -- Rescatista
    INSERT INTO public.permisos_rol (rol_id, modulo, accion, permitido, datos_sensibles)
    VALUES
        (rescatista_role_id, 'animales', 'ver', true, false),
        (rescatista_role_id, 'animales', 'crear', true, false),
        (rescatista_role_id, 'animales', 'editar', true, false),
        (rescatista_role_id, 'adoptantes', 'ver', true, false),
        (rescatista_role_id, 'adoptantes', 'crear', true, false),
        (rescatista_role_id, 'adopciones', 'ver', true, false),
        (rescatista_role_id, 'adopciones', 'crear', true, false),
        (rescatista_role_id, 'seguimientos', 'ver', true, false),
        (rescatista_role_id, 'seguimientos', 'crear', true, false),
        (rescatista_role_id, 'seguimientos', 'editar', true, false),
        (rescatista_role_id, 'salud', 'ver', true, false),
        (rescatista_role_id, 'salud', 'crear', true, false),
        (rescatista_role_id, 'salud', 'editar', true, false),
        (rescatista_role_id, 'reportes_calle', 'ver', true, false),
        (rescatista_role_id, 'reportes_calle', 'crear', true, false),
        (rescatista_role_id, 'reportes_calle', 'editar', true, false)
    ON CONFLICT (rol_id, modulo, accion) DO NOTHING;

    -- Colaboradora (solo reportes de calle)
    INSERT INTO public.permisos_rol (rol_id, modulo, accion, permitido, datos_sensibles)
    VALUES
        (colaboradora_role_id, 'reportes_calle', 'ver', true, false),
        (colaboradora_role_id, 'reportes_calle', 'crear', true, false),
        (colaboradora_role_id, 'animales', 'ver', true, false)
    ON CONFLICT (rol_id, modulo, accion) DO NOTHING;

    -- Solo lectura
    INSERT INTO public.permisos_rol (rol_id, modulo, accion, permitido, datos_sensibles)
    VALUES
        (sololectura_role_id, 'animales', 'ver', true, false),
        (sololectura_role_id, 'salud', 'ver', true, false),
        (sololectura_role_id, 'seguimientos', 'ver', true, false),
        (sololectura_role_id, 'reportes_calle', 'ver', true, false),
        (sololectura_role_id, 'estadisticas', 'ver', true, false)
    ON CONFLICT (rol_id, modulo, accion) DO NOTHING;

    -- 3. CREACIÓN DE USUARIOS EN AUTH.USERS (CONTRASEÑAS HASHEADAS CON BCRYPT)
    -- Superadministrador
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'martinchiacchio.seg@gmail.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            superadmin_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'martinchiacchio.seg@gmail.com',
            crypt('Chiacchio@1938', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"nombre":"Martín Chiacchio"}',
            NOW(),
            NOW()
        );

        INSERT INTO public.perfiles (id, nombre, email, telefono, rol_id, activo, must_change_password)
        VALUES (
            superadmin_user_id,
            'Martín Chiacchio',
            'martinchiacchio.seg@gmail.com',
            '+5491122334455',
            superadmin_role_id,
            true,
            true
        );
    END IF;

    -- Administrador
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'genesisbustamante88@gmail.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            admin_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'genesisbustamante88@gmail.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"nombre":"Génesis Bustamante"}',
            NOW(),
            NOW()
        );

        INSERT INTO public.perfiles (id, nombre, email, telefono, rol_id, activo, must_change_password)
        VALUES (
            admin_user_id,
            'Génesis Bustamante',
            'genesisbustamante88@gmail.com',
            '+5491199887766',
            admin_role_id,
            true,
            true
        );
    END IF;

    -- 4. CASOS DE ANIMALES DE EJEMPLO REALISTAS
    -- Animal 1: Luna (Perra rescatada adoptada)
    INSERT INTO public.animales (
        id, codigo_interno, nombre_actual, nombre_anterior_apodo, especie, sexo, edad_estimada, tamano,
        pelaje_color_senas_particulares, estado_caso, fecha_rescate, ubicacion_rescate, latitud, longitud,
        foto_portada, galeria, relacion_con_perros, relacion_con_gatos, relacion_con_personas, nivel_energia,
        manejo_correa_paseos, notas_conducta, alimentacion_recomendada
    ) VALUES (
        animal_luna_id,
        'DOG-001',
        'Luna',
        'Lunita',
        'perro',
        'hembra',
        'joven',
        'mediano',
        'Manto negro con manchas blancas en el pecho y patitas delanteras. Orejas semierguidas.',
        'adoptado',
        CURRENT_DATE - INTERVAL '60 days',
        'Parque Avellaneda, CABA',
        -34.6465,
        -58.4784,
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        '[
            {"id": "g1", "url": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80", "categoria": "rescate", "fecha": "2026-08-20", "notas": "Día del rescate en el parque, estaba desnutrida"},
            {"id": "g2", "url": "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80", "categoria": "evolucion", "fecha": "2026-09-10", "notas": "Recuperando peso y jugando en el patio de tránsito"},
            {"id": "g3", "url": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80", "categoria": "familia_adoptiva", "fecha": "2026-10-01", "notas": "Primer día con Carla en su nuevo hogar"}
        ]'::jsonb,
        'Muy sociable, juega con machos y hembras sin problemas',
        'Curiosa pero respetuosa, convive sin perseguirlos',
        'Super dulce con niños, un poco asustadiza con ruidos fuertes o escobas',
        'moderado',
        'Camina muy bien con pretal antitirones',
        'Le tiene miedo a las tormentas y la pirotecnia; responde excelente al refuerzo positivo con premios ricos.',
        'Alimento premium adultos medianos (Royal Canin o VitalCan Balance) 280g diarios repartidos en 2 tomas.'
    ) ON CONFLICT (codigo_interno) DO NOTHING;

    -- Animal 2: Milo (Gato rescatado en adopción activa)
    INSERT INTO public.animales (
        id, codigo_interno, nombre_actual, nombre_anterior_apodo, especie, sexo, edad_estimada, tamano,
        pelaje_color_senas_particulares, estado_caso, fecha_rescate, ubicacion_rescate, latitud, longitud,
        foto_portada, galeria, relacion_con_perros, relacion_con_gatos, relacion_con_personas, nivel_energia,
        manejo_correa_paseos, notas_conducta, alimentacion_recomendada
    ) VALUES (
        animal_milo_id,
        'CAT-001',
        'Milo',
        'Amarillito',
        'gato',
        'macho',
        'cachorro 2-6 meses',
        'chico',
        'Atigrado naranja y blanco (red tabby), ojos ámbar, punta de la cola blanca.',
        'en adopción',
        CURRENT_DATE - INTERVAL '25 days',
        'Plaza Flores, CABA',
        -34.6288,
        -58.4638,
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        '[
            {"id": "g4", "url": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80", "categoria": "rescate", "fecha": "2026-09-28", "notas": "Encontrado en un cantero de la plaza"}
        ]'::jsonb,
        'No testeado con perros',
        'Excelente con otros gatitos, es muy mimoso y duerme acurrucado',
        'Ronronero compulsivo, le encanta dormir en el pecho de las personas',
        'muy activo',
        'No aplica',
        'Super juguetón, le encantan las cañitas con plumas y los rascadores altos. Requisito de adopción: departamento con red de protección en todas las ventanas.',
        'Purina Pro Plan Kitten húmedo y seco libre demanda.'
    ) ON CONFLICT (codigo_interno) DO NOTHING;

    -- Animal 3: Simba (Perro rescatado en tránsito con tratamiento)
    INSERT INTO public.animales (
        id, codigo_interno, nombre_actual, nombre_anterior_apodo, especie, sexo, edad_estimada, tamano,
        pelaje_color_senas_particulares, estado_caso, fecha_rescate, ubicacion_rescate, latitud, longitud,
        foto_portada, galeria, relacion_con_perros, relacion_con_gatos, relacion_con_personas, nivel_energia,
        manejo_correa_paseos, notas_conducta, alimentacion_recomendada
    ) VALUES (
        animal_simba_id,
        'DOG-002',
        'Simba',
        'Barba',
        'perro',
        'macho',
        'adulto',
        'grande',
        'Mestizo tipo ovejero leonado, hocico oscuro, cicatriz en oreja izquierda.',
        'en tránsito',
        CURRENT_DATE - INTERVAL '12 days',
        'Lomas de Zamora, GBA Sur',
        -34.7600,
        -58.4000,
        'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        '[]'::jsonb,
        'Tranquilo si no lo prepotean, prefiere hembras',
        'Tiende a perseguirlos, mejor sin gatos',
        'Noble y protector, agradecido, adora las caricias en el lomo',
        'tranquilo',
        'Va al trote con fuerza, necesita collar fijo y correa reforzada',
        'Fue rescatado de la calle con herida de mordedura en cicatrización y anemia leve. Muy buen temperamento.',
        'Alimento para perros de alta energía más suplemento vitamínico diario.'
    ) ON CONFLICT (codigo_interno) DO NOTHING;

    -- 5. ADOPTANTES DE EJEMPLO
    INSERT INTO public.adoptantes (
        id, nombre_apellido, dni_cuit, telefono_whatsapp, telefono_secundario, direccion_calle, direccion_numero,
        direccion_entrecalles, direccion_piso_depto, direccion_barrio, direccion_localidad, direccion_provincia,
        tipo_vivienda, condicion_vivienda, redes_sociales, consentimiento_datos
    ) VALUES (
        adoptante_carla_id,
        'Carla Daniela Rossi',
        '35442119',
        '+5491155443322',
        '+5491144009988',
        'Av. San Juan',
        '3240',
        'Entre Boedo y Colombres',
        '4to B',
        'Boedo',
        'Ciudad Autónoma de Buenos Aires',
        'CABA',
        'departamento',
        'propietario',
        '{"instagram":"@carlarossi_art","facebook":"Carla Rossi"}'::jsonb,
        true
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.adoptantes (
        id, nombre_apellido, dni_cuit, telefono_whatsapp, direccion_calle, direccion_numero,
        direccion_barrio, direccion_localidad, direccion_provincia,
        tipo_vivienda, condicion_vivienda, redes_sociales, consentimiento_datos
    ) VALUES (
        adoptante_pablo_id,
        'Pablo Esteban Gómez',
        '31889452',
        '+5491166778899',
        'Mariano Fragueiro',
        '1850',
        'Alta Córdoba',
        'Córdoba Capital',
        'Córdoba',
        'casa con patio cerrado',
        'propietario',
        '{"instagram":"@pablito_gomez"}'::jsonb,
        true
    ) ON CONFLICT (id) DO NOTHING;

    -- 6. ADOPCIÓN DE LUNA Y ACTIVACIÓN DE CALENDARIO AUTOMÁTICO
    IF NOT EXISTS (SELECT 1 FROM public.adopciones WHERE animal_id = animal_luna_id) THEN
        INSERT INTO public.adopciones (
            id, animal_id, adoptante_id, fecha_entrega, modalidad_entrega, periodo_adaptacion_dias,
            compromiso_castracion, fecha_limite_castracion, estado_adopcion, observaciones
        ) VALUES (
            adopcion_luna_id,
            animal_luna_id,
            adoptante_carla_id,
            CURRENT_DATE - INTERVAL '20 days',
            'llevado al domicilio',
            21,
            true,
            CURRENT_DATE + INTERVAL '10 days',
            'activo en seguimiento',
            'Luna se adaptó maravillosamente a la vida de departamento. La llevan 3 veces por día a la plaza.'
        );

        -- Registrar seguimiento realizado
        INSERT INTO public.seguimientos (
            adopcion_id, fecha_contacto, tipo_contacto, foto_video_recibido, estado_general, observaciones,
            proxima_fecha_seguimiento, completado
        ) VALUES (
            adopcion_luna_id,
            CURRENT_DATE - INTERVAL '17 days',
            'WhatsApp',
            'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
            'excelente',
            'Carla nos mandó fotos durmiendo en su camita nueva. Come con ganas y no hubo ningún llanto nocturno.',
            CURRENT_DATE + INTERVAL '5 days',
            true
        );
    END IF;

    -- 7. EVENTOS DE SALUD (HISTORIA CLÍNICA)
    -- Luna: antirrábica y séxtuple
    INSERT INTO public.eventos_salud (
        animal_id, fecha, tipo_evento, producto_o_detalle, profesional_veterinaria, lugar,
        medicacion_cronica, fecha_proximo_refuerzo_o_vencimiento
    ) VALUES 
        (animal_luna_id, CURRENT_DATE - INTERVAL '40 days', 'vacuna antirrábica', 'Rabisin (Boehringer Ingelheim)', 'Dra. Silvina Romero - MP 4590', 'Veterinaria El Ombú', false, CURRENT_DATE + INTERVAL '325 days'),
        (animal_luna_id, CURRENT_DATE - INTERVAL '30 days', 'múltiple/séxtuple/triple felina', 'Nobivac DHPPi + Lepto', 'Dra. Silvina Romero', 'Veterinaria El Ombú', false, CURRENT_DATE + INTERVAL '335 days'),
        (animal_luna_id, CURRENT_DATE - INTERVAL '10 days', 'desparasitación interna', 'Total FLC suspensión (1 toma)', 'Dr. Marcos Paz', 'Centro Veterinario Boedo', false, CURRENT_DATE + INTERVAL '80 days');

    -- Simba: curación herida y antiparasitario
    INSERT INTO public.eventos_salud (
        animal_id, fecha, tipo_evento, producto_o_detalle, profesional_veterinaria, lugar,
        diagnostico_enfermedad, medicacion_cronica, detalle_medicacion_cronica, fecha_proximo_refuerzo_o_vencimiento
    ) VALUES (
        animal_simba_id,
        CURRENT_DATE - INTERVAL '10 days',
        'tratamiento',
        'Cefalexina 500mg cada 12hs por 10 días + limpieza con Clorhexidina',
        'Dr. Alejandro Ruiz',
        'Hospital Veterinario Lomas',
        'Infección bacteriana secundaria por mordedura callejera',
        true,
        'Antibiótico diario hasta finalizar blíster',
        CURRENT_DATE + INTERVAL '3 days'
    );

    -- 8. REPORTE DE CALLE COMUNITARIO (CON GEOLOCALIZACIÓN)
    INSERT INTO public.reportes_calle (
        descripcion, latitud, longitud, direccion_aproximada, nivel_urgencia, estado_reporte,
        fotos
    ) VALUES (
        'Perrita mestiza atropellada en la mano que va a provincia. Está sobre la vereda resguardada por vecinos pero renguea mucho y necesita atención urgente.',
        -34.6180,
        -58.4200,
        'Av. Rivadavia 4300, Almagro, CABA',
        'crítico',
        'nuevo',
        '["https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=800&q=80"]'::jsonb
    );

END $$;
