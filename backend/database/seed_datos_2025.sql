-- =====================================================
-- Script SQL para Generar Datos de Prueba 2025
-- Período: Enero 2025 - 17 Noviembre 2025
-- Propósito: Probar predicciones, dashboard y reportes avanzados
-- =====================================================
-- 
-- INSTRUCCIONES PARA HEIDISQL:
-- 
-- ⚠️ IMPORTANTE: HeidiSQL NO soporta DELIMITER correctamente desde el editor.
-- 
-- OPCIÓN 1 (RECOMENDADA): Usar línea de comandos MySQL
--   mysql -h [tu_host] -u [usuario] -p hospital_incidencias < seed_datos_2025.sql
-- 
-- OPCIÓN 2: Ejecutar cada bloque individualmente en HeidiSQL:
--   1. Ejecuta SOLO el bloque de "insertar_incidencia_completa" (líneas 45-201)
--   2. Ejecuta SOLO el bloque de "calcular_personas_afectadas" (líneas 207-228)
--   3. Ejecuta SOLO el bloque de "calcular_pacientes_afectados" (líneas 234-255)
--   4. Ejecuta SOLO el bloque de "generar_incidencias_mes" (líneas 261-431)
--   5. Ejecuta SOLO el bloque de "agregar_comentarios_incidencias" (líneas 437-549)
--   6. Finalmente, ejecuta la sección de transacción (líneas 551 hasta el final)
-- 
-- NOTA: Cada bloque debe incluir su DELIMITER $$ al inicio y DELIMITER ; al final
-- 
-- =====================================================

USE hospital_incidencias;

-- =====================================================
-- CREAR PROCEDIMIENTOS Y FUNCIONES (FUERA DE TRANSACCIÓN)
-- =====================================================

-- =====================================================
-- FUNCIÓN AUXILIAR PARA GENERAR CÓDIGO DE INCIDENCIA
-- =====================================================

-- Nota: MySQL no permite crear funciones temporales fácilmente en scripts
-- Usaremos una variable de sesión para el contador

-- =====================================================
-- PROCEDIMIENTO PARA INSERTAR UNA INCIDENCIA
-- =====================================================

DROP PROCEDURE IF EXISTS insertar_incidencia_completa;

DELIMITER $$

CREATE PROCEDURE insertar_incidencia_completa(
    IN p_fecha_creacion DATETIME,
    IN p_area_id INT,
    IN p_tipo_id INT,
    IN p_prioridad_id INT,
    IN p_estado VARCHAR(20),
    IN p_reportado_por_id INT,
    IN p_responsable_id INT,
    IN p_personas_afectadas INT,
    IN p_pacientes_afectados INT,
    IN p_titulo VARCHAR(255),
    IN p_descripcion TEXT,
    IN p_servicio_id INT,
    IN p_subtipo_id INT,
    IN p_piso VARCHAR(50),
    IN p_habitacion VARCHAR(50),
    IN p_cama VARCHAR(50),
    IN p_equipo VARCHAR(255),
    IN p_paciente_id VARCHAR(50)
)
BEGIN
    DECLARE v_incidencia_id INT;
    DECLARE v_codigo VARCHAR(20);
    DECLARE v_fecha_vencimiento DATETIME;
    DECLARE v_fecha_resolucion DATETIME;
    DECLARE v_tiempo_resolucion_horas INT;
    DECLARE v_resuelto_por_id INT;
    
    -- Generar código
    SET @codigo_counter = @codigo_counter + 1;
    SET v_codigo = CONCAT('INC-2025-', LPAD(@codigo_counter, 4, '0'));
    
    -- Calcular fecha de vencimiento según prioridad
    SELECT tiempo_resolucion_horas INTO v_tiempo_resolucion_horas 
    FROM prioridades WHERE id = p_prioridad_id;
    
    SET v_fecha_vencimiento = DATE_ADD(p_fecha_creacion, INTERVAL v_tiempo_resolucion_horas HOUR);
    
    -- Insertar incidencia
    INSERT INTO incidencias (
        codigo, titulo, descripcion, area_id, servicio_id, tipo_incidencia_id,
        subtipo_incidencia_id, prioridad_id, estado, reportado_por_id, responsable_id,
        piso, habitacion, cama, equipo, paciente_id,
        personas_afectadas, pacientes_afectados,
        fecha_creacion, fecha_vencimiento, fecha_actualizacion
    ) VALUES (
        v_codigo, p_titulo, p_descripcion, p_area_id, p_servicio_id, p_tipo_id,
        p_subtipo_id, p_prioridad_id, p_estado, p_reportado_por_id, p_responsable_id,
        p_piso, p_habitacion, p_cama, p_equipo, p_paciente_id,
        p_personas_afectadas, p_pacientes_afectados,
        p_fecha_creacion, v_fecha_vencimiento, p_fecha_creacion
    );
    
    SET v_incidencia_id = LAST_INSERT_ID();
    
    -- Registrar historial de creación
    INSERT INTO historial_incidencias (
        incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo, fecha_evento
    ) VALUES (
        v_incidencia_id, 'creacion', p_reportado_por_id, 
        CONCAT('Incidencia creada: ', p_titulo), NULL, NULL, p_fecha_creacion
    );
    
    -- Si tiene responsable, crear asignación y notificación
    IF p_responsable_id IS NOT NULL THEN
        INSERT INTO historial_incidencias (
            incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo, fecha_evento
        ) VALUES (
            v_incidencia_id, 'asignacion', p_reportado_por_id,
            'Incidencia asignada a responsable', NULL, NULL, p_fecha_creacion
        );
        
        INSERT INTO notificaciones (
            usuario_id, incidencia_id, tipo, titulo, mensaje, leida, fecha_creacion
        ) VALUES (
            p_responsable_id, v_incidencia_id, 'asignacion',
            'Nueva incidencia asignada',
            CONCAT('Se te ha asignado la incidencia ', v_codigo, ': ', p_titulo),
            FALSE, p_fecha_creacion
        );
    END IF;
    
    -- Si está en_progreso, registrar cambio de estado
    IF p_estado = 'en_progreso' THEN
        INSERT INTO historial_incidencias (
            incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo, fecha_evento
        ) VALUES (
            v_incidencia_id, 'estado', COALESCE(p_responsable_id, p_reportado_por_id),
            'Estado cambiado a "en_progreso"', 'abierta', 'en_progreso', 
            DATE_ADD(p_fecha_creacion, INTERVAL 2 HOUR)
        );
    END IF;
    
    -- Si está resuelta o cerrada, crear resolución
    IF p_estado IN ('resuelta', 'cerrada') THEN
        SET v_resuelto_por_id = COALESCE(p_responsable_id, p_reportado_por_id);
        
        -- Calcular fecha de resolución (entre 1-7 días después de creación, según prioridad)
        SET v_fecha_resolucion = DATE_ADD(p_fecha_creacion, 
            INTERVAL (1 + FLOOR(RAND() * (CASE 
                WHEN p_prioridad_id = @p1_id THEN 1
                WHEN p_prioridad_id = @p2_id THEN 2
                WHEN p_prioridad_id = @p3_id THEN 5
                ELSE 7
            END))) DAY);
        
        -- Insertar resolución
        INSERT INTO resoluciones_incidencias (
            incidencia_id, solucion_aplicada, pasos_seguidos, recursos_utilizados,
            tiempo_invertido_minutos, resuelto_por_id, fecha_resolucion
        ) VALUES (
            v_incidencia_id,
            CONCAT('Se resolvió la incidencia ', v_codigo, ' aplicando la solución correspondiente.'),
            '1. Diagnóstico del problema\n2. Identificación de componentes afectados\n3. Aplicación de solución\n4. Pruebas de funcionamiento\n5. Documentación del proceso',
            'Personal técnico especializado, herramientas de diagnóstico, repuestos de inventario',
            FLOOR(30 + RAND() * 240), -- 30-270 minutos
            v_resuelto_por_id,
            v_fecha_resolucion
        );
        
        -- Actualizar fechas de la incidencia
        UPDATE incidencias 
        SET fecha_resolucion = v_fecha_resolucion,
            fecha_cierre = IF(p_estado = 'cerrada', v_fecha_resolucion, NULL),
            fecha_actualizacion = v_fecha_resolucion
        WHERE id = v_incidencia_id;
        
        -- Registrar historial de resolución
        INSERT INTO historial_incidencias (
            incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo, fecha_evento
        ) VALUES (
            v_incidencia_id, 'resolucion', v_resuelto_por_id,
            'Incidencia resuelta',
            IF(p_estado = 'cerrada', 'resuelta', 'en_progreso'),
            p_estado,
            v_fecha_resolucion
        );
        
        -- Notificar al que reportó
        INSERT INTO notificaciones (
            usuario_id, incidencia_id, tipo, titulo, mensaje, leida, fecha_creacion
        ) VALUES (
            p_reportado_por_id, v_incidencia_id, 'estado',
            'Incidencia resuelta',
            CONCAT('La incidencia ', v_codigo, ' ha sido resuelta'),
            FALSE, v_fecha_resolucion
        );
    END IF;
    
    SELECT v_incidencia_id as incidencia_id, v_codigo as codigo;
END$$

DELIMITER ;

-- =====================================================
-- PROCEDIMIENTO PARA GENERAR INCIDENCIAS POR MES
-- =====================================================

DROP PROCEDURE IF EXISTS generar_incidencias_mes;

DELIMITER $$

CREATE PROCEDURE generar_incidencias_mes(
    IN p_anio INT,
    IN p_mes INT,
    IN p_dia_fin INT,
    IN p_cantidad INT
)
BEGIN
    DECLARE v_counter INT DEFAULT 0;
    DECLARE v_fecha_creacion DATETIME;
    DECLARE v_area_id INT;
    DECLARE v_tipo_id INT;
    DECLARE v_prioridad_id INT;
    DECLARE v_estado VARCHAR(20);
    DECLARE v_reportado_por_id INT;
    DECLARE v_responsable_id INT;
    DECLARE v_personas_afectadas INT;
    DECLARE v_pacientes_afectados INT;
    DECLARE v_titulo VARCHAR(255);
    DECLARE v_descripcion TEXT;
    DECLARE v_servicio_id INT;
    DECLARE v_subtipo_id INT;
    DECLARE v_piso VARCHAR(50);
    DECLARE v_habitacion VARCHAR(50);
    DECLARE v_cama VARCHAR(50);
    DECLARE v_equipo VARCHAR(255);
    DECLARE v_paciente_id VARCHAR(50);
    DECLARE v_tipo_nombre VARCHAR(100);
    DECLARE v_prioridad_nivel VARCHAR(5);
    DECLARE v_rand FLOAT;
    
    -- Títulos de ejemplo
    DECLARE titulos_clinica TEXT DEFAULT 'Fallo en monitor de signos vitales en UCI|Equipo de respiración asistida no funciona correctamente|Falta de suministros médicos en Urgencias|Problema con bomba de infusión en habitación|Desfibrilador no responde en sala de emergencias|Falta de oxígeno en tanque de UCI|Equipo de rayos X portátil no enciende|Problema con sistema de succión en quirófano|Falta de material estéril en consultorios|Monitor fetal no detecta señales correctamente';
    DECLARE titulos_tecnologia TEXT DEFAULT 'Sistema de historial clínico no responde|Impresora de etiquetas de laboratorio fuera de servicio|Red WiFi caída en área de hospitalización|Computadora de enfermería no inicia|Sistema de farmacia no permite registrar salidas|Tablet de registro médico con pantalla rota|Servidor de imágenes médicas lento|Aplicación de citas no carga|Scanner de códigos de barras no funciona|Sistema de facturación presenta errores';
    DECLARE titulos_infraestructura TEXT DEFAULT 'Aire acondicionado no funciona en quirófano|Fuga de agua en baño de planta baja|Luz de emergencia no funciona en pasillo principal|Puerta automática de UCI atascada|Ascensor fuera de servicio|Problema eléctrico en sala de espera|Ventilación deficiente en laboratorio|Techo con goteras en consultorio|Sistema de alarma de incendios no funciona|Iluminación insuficiente en estacionamiento';
    DECLARE titulos_administrativa TEXT DEFAULT 'Falta de formularios de consentimiento informado|Sistema de archivo de expedientes desorganizado|Problema con facturación de paciente|Falta de material de oficina en administración|Impresora de facturas sin tinta|Archivo de documentos médicos incompleto|Problema con sistema de citas|Falta de sellos oficiales en recepción|Sistema de inventario desactualizado|Problema con generación de reportes';
    
    DECLARE descripciones TEXT DEFAULT 'Se requiere atención inmediata para resolver este problema que está afectando la operación normal del área.|El problema se ha presentado de manera recurrente y necesita una solución definitiva.|Esta situación está impactando la atención a pacientes y requiere pronta resolución.|Se ha reportado por múltiples usuarios y necesita revisión técnica urgente.|El problema comenzó de manera intermitente pero ahora es constante.|Esta incidencia afecta directamente la seguridad de los pacientes.|Se requiere intervención especializada para resolver este problema.|El equipo técnico debe revisar y dar solución en el menor tiempo posible.|Esta situación está generando retrasos en los procedimientos médicos.|Se necesita una solución temporal mientras se implementa la definitiva.';
    
    WHILE v_counter < p_cantidad DO
        -- Generar fecha aleatoria dentro del mes
        SET v_fecha_creacion = CONCAT(
            p_anio, '-', LPAD(p_mes, 2, '0'), '-',
            LPAD(1 + FLOOR(RAND() * p_dia_fin), 2, '0'), ' ',
            LPAD(FLOOR(RAND() * 24), 2, '0'), ':',
            LPAD(FLOOR(RAND() * 60), 2, '0'), ':00'
        );
        
        -- Seleccionar área aleatoria
        SELECT id INTO v_area_id FROM areas WHERE activo = TRUE ORDER BY RAND() LIMIT 1;
        
        -- Seleccionar tipo aleatorio
        SELECT id, nombre INTO v_tipo_id, v_tipo_nombre 
        FROM tipos_incidencias WHERE activo = TRUE ORDER BY RAND() LIMIT 1;
        
        -- Seleccionar prioridad aleatoria (distribución: 15% P1, 25% P2, 40% P3, 20% P4)
        SET v_rand = RAND();
        IF v_rand < 0.15 THEN
            SET v_prioridad_id = @p1_id;
            SET v_prioridad_nivel = 'P1';
        ELSEIF v_rand < 0.40 THEN
            SET v_prioridad_id = @p2_id;
            SET v_prioridad_nivel = 'P2';
        ELSEIF v_rand < 0.80 THEN
            SET v_prioridad_id = @p3_id;
            SET v_prioridad_nivel = 'P3';
        ELSE
            SET v_prioridad_id = @p4_id;
            SET v_prioridad_nivel = 'P4';
        END IF;
        
        -- Seleccionar estado (25% abierta, 20% en_progreso, 35% resuelta, 20% cerrada)
        SET v_rand = RAND();
        IF v_rand < 0.25 THEN
            SET v_estado = 'abierta';
        ELSEIF v_rand < 0.45 THEN
            SET v_estado = 'en_progreso';
        ELSEIF v_rand < 0.80 THEN
            SET v_estado = 'resuelta';
        ELSE
            SET v_estado = 'cerrada';
        END IF;
        
        -- Seleccionar usuario que reporta
        SELECT id INTO v_reportado_por_id FROM usuarios WHERE activo = TRUE ORDER BY RAND() LIMIT 1;
        
        -- Asignar responsable (70% de probabilidad)
        SET v_responsable_id = NULL;
        IF RAND() < 0.70 THEN
            -- Para incidencias de tecnología, preferir técnicos o admin TI
            IF v_tipo_id = @tipo_tecnologia_id THEN
                SELECT id INTO v_responsable_id 
                FROM usuarios 
                WHERE activo = TRUE 
                  AND (rol = 'tecnico' OR (rol = 'administrador' AND tipo_admin = 'ti'))
                ORDER BY RAND() LIMIT 1;
            ELSE
                SELECT id INTO v_responsable_id FROM usuarios WHERE activo = TRUE ORDER BY RAND() LIMIT 1;
            END IF;
        END IF;
        
        -- Calcular personas y pacientes afectados (80% tienen valores, 20% NULL)
        IF RAND() < 0.80 THEN
            -- Calcular personas afectadas según tipo
            CASE v_tipo_nombre
                WHEN 'Clínica' THEN SET v_personas_afectadas = 5 + FLOOR(RAND() * 11); -- 5-15
                WHEN 'Tecnología' THEN SET v_personas_afectadas = 3 + FLOOR(RAND() * 8); -- 3-10
                WHEN 'Infraestructura' THEN SET v_personas_afectadas = 8 + FLOOR(RAND() * 13); -- 8-20
                WHEN 'Administrativa' THEN SET v_personas_afectadas = 2 + FLOOR(RAND() * 7); -- 2-8
                ELSE SET v_personas_afectadas = 3 + FLOOR(RAND() * 8);
            END CASE;
            
            -- Calcular pacientes afectados según prioridad
            CASE v_prioridad_nivel
                WHEN 'P1' THEN SET v_pacientes_afectados = 3 + FLOOR(RAND() * 6); -- 3-8
                WHEN 'P2' THEN SET v_pacientes_afectados = 2 + FLOOR(RAND() * 4); -- 2-5
                WHEN 'P3' THEN SET v_pacientes_afectados = 1 + FLOOR(RAND() * 3); -- 1-3
                WHEN 'P4' THEN SET v_pacientes_afectados = FLOOR(RAND() * 3); -- 0-2
                ELSE SET v_pacientes_afectados = 1 + FLOOR(RAND() * 3);
            END CASE;
        ELSE
            SET v_personas_afectadas = NULL;
            SET v_pacientes_afectados = NULL;
        END IF;
        
        -- Seleccionar título según tipo
        CASE v_tipo_nombre
            WHEN 'Clínica' THEN
                SET v_titulo = SUBSTRING_INDEX(SUBSTRING_INDEX(titulos_clinica, '|', 1 + FLOOR(RAND() * 10)), '|', -1);
            WHEN 'Tecnología' THEN
                SET v_titulo = SUBSTRING_INDEX(SUBSTRING_INDEX(titulos_tecnologia, '|', 1 + FLOOR(RAND() * 10)), '|', -1);
            WHEN 'Infraestructura' THEN
                SET v_titulo = SUBSTRING_INDEX(SUBSTRING_INDEX(titulos_infraestructura, '|', 1 + FLOOR(RAND() * 10)), '|', -1);
            WHEN 'Administrativa' THEN
                SET v_titulo = SUBSTRING_INDEX(SUBSTRING_INDEX(titulos_administrativa, '|', 1 + FLOOR(RAND() * 10)), '|', -1);
            ELSE
                SET v_titulo = CONCAT('Incidencia tipo ', v_tipo_nombre, ' - ', v_counter);
        END CASE;
        
        -- Seleccionar descripción aleatoria
        SET v_descripcion = SUBSTRING_INDEX(SUBSTRING_INDEX(descripciones, '|', 1 + FLOOR(RAND() * 10)), '|', -1);
        
        -- Datos opcionales
        SET v_servicio_id = NULL;
        SELECT id INTO v_servicio_id FROM servicios WHERE area_id = v_area_id AND activo = TRUE ORDER BY RAND() LIMIT 1;
        
        SET v_subtipo_id = NULL;
        SELECT id INTO v_subtipo_id FROM subtipos_incidencias WHERE tipo_incidencia_id = v_tipo_id AND activo = TRUE ORDER BY RAND() LIMIT 1;
        
        SET v_piso = NULL;
        SET v_habitacion = NULL;
        SET v_cama = NULL;
        IF RAND() < 0.60 THEN
            SET v_piso = CONCAT('Piso ', FLOOR(1 + RAND() * 5));
            SET v_habitacion = CONCAT('Habitación ', FLOOR(100 + RAND() * 50));
            IF RAND() < 0.50 THEN
                SET v_cama = CONCAT('Cama ', FLOOR(1 + RAND() * 4));
            END IF;
        END IF;
        
        SET v_equipo = NULL;
        IF RAND() < 0.40 THEN
            SET v_equipo = CONCAT('Equipo ', FLOOR(100 + RAND() * 1000));
        END IF;
        
        SET v_paciente_id = NULL;
        IF RAND() < 0.30 THEN
            SET v_paciente_id = CONCAT('PAC-', FLOOR(1000 + RAND() * 9000));
        END IF;
        
        -- Llamar al procedimiento para insertar incidencia completa
        CALL insertar_incidencia_completa(
            v_fecha_creacion, v_area_id, v_tipo_id, v_prioridad_id, v_estado,
            v_reportado_por_id, v_responsable_id, v_personas_afectadas, v_pacientes_afectados,
            v_titulo, v_descripcion, v_servicio_id, v_subtipo_id,
            v_piso, v_habitacion, v_cama, v_equipo, v_paciente_id
        );
        
        SET v_counter = v_counter + 1;
    END WHILE;
END$$

DELIMITER ;

-- =====================================================
-- PROCEDIMIENTO PARA AGREGAR COMENTARIOS A INCIDENCIAS
-- =====================================================

DROP PROCEDURE IF EXISTS agregar_comentarios_incidencias;

DELIMITER $$

CREATE PROCEDURE agregar_comentarios_incidencias()
BEGIN
    DECLARE v_incidencia_id INT;
    DECLARE v_usuario_id INT;
    DECLARE v_comentarista_id INT;
    DECLARE v_responsable_id INT;
    DECLARE v_reportado_por_id INT;
    DECLARE v_fecha_creacion DATETIME;
    DECLARE v_fecha_comentario DATETIME;
    DECLARE v_cantidad_comentarios INT;
    DECLARE v_counter INT;
    DECLARE v_codigo VARCHAR(20);
    DECLARE v_titulo VARCHAR(255);
    DECLARE v_rand FLOAT;
    
    DECLARE comentarios TEXT DEFAULT 'El problema persiste, necesitamos una solución más definitiva.|Gracias por la rápida atención, el problema se resolvió correctamente.|Se requiere seguimiento para asegurar que no vuelva a ocurrir.|El equipo está funcionando pero se nota que necesita mantenimiento preventivo.|Excelente trabajo del equipo técnico, muy profesional.|Necesitamos más información sobre la causa raíz del problema.|El problema se resolvió temporalmente, pero necesitamos una solución permanente.|Gracias por la atención, todo funcionando correctamente ahora.|Se requiere revisión adicional del área afectada.|El problema parece estar relacionado con el mantenimiento preventivo.';
    
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur CURSOR FOR 
        SELECT i.id, i.codigo, i.titulo, i.reportado_por_id, i.responsable_id, i.fecha_creacion
        FROM incidencias i
        WHERE RAND() < 0.40  -- 40% de incidencias tendrán comentarios
        ORDER BY RAND()
        LIMIT 200;  -- Limitar para no sobrecargar
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_incidencia_id, v_codigo, v_titulo, v_reportado_por_id, v_responsable_id, v_fecha_creacion;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Generar 1-3 comentarios por incidencia
        SET v_cantidad_comentarios = 1 + FLOOR(RAND() * 3);
        SET v_counter = 0;
        
        WHILE v_counter < v_cantidad_comentarios DO
            -- Seleccionar usuario que comenta (puede ser el que reportó, responsable, o cualquier otro)
            SET v_rand = RAND();
            IF v_rand < 0.3 AND v_responsable_id IS NOT NULL THEN
                SET v_comentarista_id = v_responsable_id;
            ELSEIF v_rand < 0.6 THEN
                SET v_comentarista_id = v_reportado_por_id;
            ELSE
                SELECT id INTO v_comentarista_id FROM usuarios WHERE activo = TRUE ORDER BY RAND() LIMIT 1;
            END IF;
            
            -- Fecha del comentario (entre fecha de creación y ahora, o fecha de resolución si existe)
            SET v_fecha_comentario = DATE_ADD(v_fecha_creacion, 
                INTERVAL FLOOR(RAND() * DATEDIFF(COALESCE(
                    (SELECT fecha_resolucion FROM incidencias WHERE id = v_incidencia_id), 
                    NOW()), v_fecha_creacion)) DAY);
            
            -- Insertar comentario
            INSERT INTO comentarios (incidencia_id, usuario_id, texto, fecha_creacion)
            VALUES (
                v_incidencia_id,
                v_comentarista_id,
                SUBSTRING_INDEX(SUBSTRING_INDEX(comentarios, '|', 1 + FLOOR(RAND() * 10)), '|', -1),
                v_fecha_comentario
            );
            
            -- Registrar historial
            INSERT INTO historial_incidencias (
                incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo, fecha_evento
            ) VALUES (
                v_incidencia_id, 'comentario', v_comentarista_id, 'Comentario agregado', NULL, NULL, v_fecha_comentario
            );
            
            -- Notificar al responsable y al que reportó (si no es el mismo que comentó)
            IF v_responsable_id IS NOT NULL AND v_responsable_id != v_comentarista_id THEN
                INSERT INTO notificaciones (usuario_id, incidencia_id, tipo, titulo, mensaje, leida, fecha_creacion)
                SELECT v_responsable_id, v_incidencia_id, 'comentario', 'Nuevo comentario',
                    CONCAT((SELECT nombre FROM usuarios WHERE id = v_comentarista_id), ' comentó en la incidencia ', v_codigo),
                    FALSE, v_fecha_comentario
                WHERE NOT EXISTS (
                    SELECT 1 FROM notificaciones 
                    WHERE usuario_id = v_responsable_id 
                      AND incidencia_id = v_incidencia_id 
                      AND tipo = 'comentario'
                      AND fecha_creacion = v_fecha_comentario
                );
            END IF;
            
            IF v_reportado_por_id != v_comentarista_id AND v_reportado_por_id != v_responsable_id THEN
                INSERT INTO notificaciones (usuario_id, incidencia_id, tipo, titulo, mensaje, leida, fecha_creacion)
                SELECT v_reportado_por_id, v_incidencia_id, 'comentario', 'Nuevo comentario',
                    CONCAT((SELECT nombre FROM usuarios WHERE id = v_comentarista_id), ' comentó en la incidencia ', v_codigo),
                    FALSE, v_fecha_comentario
                WHERE NOT EXISTS (
                    SELECT 1 FROM notificaciones 
                    WHERE usuario_id = v_reportado_por_id 
                      AND incidencia_id = v_incidencia_id 
                      AND tipo = 'comentario'
                      AND fecha_creacion = v_fecha_comentario
                );
            END IF;
            
            SET v_counter = v_counter + 1;
        END WHILE;
    END LOOP;
    
    CLOSE cur;
END$$

DELIMITER ;

-- =====================================================
-- INICIAR TRANSACCIÓN PARA DATOS
-- =====================================================

-- Deshabilitar verificaciones de foreign key temporalmente para mejor rendimiento
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

START TRANSACTION;

-- =====================================================
-- VARIABLES Y CONFIGURACIÓN
-- =====================================================

-- Obtener IDs de referencia (asumiendo que existen en la BD)
SET @admin_ti_id = (SELECT id FROM usuarios WHERE email = 'admin.ti@hospital.com' LIMIT 1);
SET @admin_general_id = (SELECT id FROM usuarios WHERE email = 'admin.general@hospital.com' LIMIT 1);

-- Obtener IDs de prioridades
SET @p1_id = (SELECT id FROM prioridades WHERE nivel = 'P1' LIMIT 1);
SET @p2_id = (SELECT id FROM prioridades WHERE nivel = 'P2' LIMIT 1);
SET @p3_id = (SELECT id FROM prioridades WHERE nivel = 'P3' LIMIT 1);
SET @p4_id = (SELECT id FROM prioridades WHERE nivel = 'P4' LIMIT 1);

-- Obtener IDs de tipos de incidencias
SET @tipo_clinica_id = (SELECT id FROM tipos_incidencias WHERE nombre = 'Clínica' LIMIT 1);
SET @tipo_tecnologia_id = (SELECT id FROM tipos_incidencias WHERE nombre = 'Tecnología' LIMIT 1);
SET @tipo_infraestructura_id = (SELECT id FROM tipos_incidencias WHERE nombre = 'Infraestructura' LIMIT 1);
SET @tipo_administrativa_id = (SELECT id FROM tipos_incidencias WHERE nombre = 'Administrativa' LIMIT 1);

-- Contador para códigos de incidencia (iniciar desde el último código existente)
SET @codigo_counter = COALESCE(
    (SELECT CAST(SUBSTRING(codigo, 10) AS UNSIGNED) 
     FROM incidencias 
     WHERE codigo LIKE 'INC-2025-%' 
     ORDER BY codigo DESC 
     LIMIT 1), 
    0
);

-- =====================================================
-- GENERAR INCIDENCIAS POR MES CON DISTRIBUCIÓN NO UNIFORME
-- =====================================================

-- Enero: 40-50 incidencias
CALL generar_incidencias_mes(2025, 1, 31, 45);

-- Febrero: 45-55 incidencias
CALL generar_incidencias_mes(2025, 2, 28, 50);

-- Marzo: 70-85 incidencias (pico estacional)
CALL generar_incidencias_mes(2025, 3, 31, 78);

-- Abril: 50-60 incidencias
CALL generar_incidencias_mes(2025, 4, 30, 55);

-- Mayo: 55-65 incidencias
CALL generar_incidencias_mes(2025, 5, 31, 60);

-- Junio: 80-95 incidencias (pico estacional)
CALL generar_incidencias_mes(2025, 6, 30, 88);

-- Julio: 60-70 incidencias
CALL generar_incidencias_mes(2025, 7, 31, 65);

-- Agosto: 65-75 incidencias
CALL generar_incidencias_mes(2025, 8, 31, 70);

-- Septiembre: 75-90 incidencias (pico estacional)
CALL generar_incidencias_mes(2025, 9, 30, 83);

-- Octubre: 70-80 incidencias
CALL generar_incidencias_mes(2025, 10, 31, 75);

-- Noviembre (hasta día 17): 50-60 incidencias
CALL generar_incidencias_mes(2025, 11, 17, 55);

-- =====================================================
-- AGREGAR COMENTARIOS A INCIDENCIAS (40% de incidencias)
-- =====================================================

-- Ejecutar procedimiento para agregar comentarios
CALL agregar_comentarios_incidencias();

-- =====================================================
-- FINALIZAR TRANSACCIÓN Y LIMPIAR
-- =====================================================

-- Habilitar verificaciones de foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- Commit de la transacción
COMMIT;

-- Limpiar procedimientos temporales
DROP PROCEDURE IF EXISTS insertar_incidencia_completa;
DROP PROCEDURE IF EXISTS generar_incidencias_mes;
DROP PROCEDURE IF EXISTS agregar_comentarios_incidencias;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

SELECT 
    'Resumen de datos generados' as mensaje,
    COUNT(*) as total_incidencias,
    COUNT(CASE WHEN estado = 'abierta' THEN 1 END) as abiertas,
    COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as en_progreso,
    COUNT(CASE WHEN estado = 'resuelta' THEN 1 END) as resueltas,
    COUNT(CASE WHEN estado = 'cerrada' THEN 1 END) as cerradas,
    COUNT(CASE WHEN responsable_id IS NOT NULL THEN 1 END) as con_responsable,
    COUNT(CASE WHEN personas_afectadas IS NOT NULL THEN 1 END) as con_personas_afectadas,
    COUNT(CASE WHEN pacientes_afectados IS NOT NULL THEN 1 END) as con_pacientes_afectados
FROM incidencias
WHERE fecha_creacion >= '2025-01-01' AND fecha_creacion <= '2025-11-17';

SELECT 
    'Total de comentarios' as tipo,
    COUNT(*) as cantidad
FROM comentarios
WHERE incidencia_id IN (SELECT id FROM incidencias WHERE fecha_creacion >= '2025-01-01' AND fecha_creacion <= '2025-11-17');

SELECT 
    'Total de notificaciones' as tipo,
    COUNT(*) as cantidad
FROM notificaciones
WHERE incidencia_id IN (SELECT id FROM incidencias WHERE fecha_creacion >= '2025-01-01' AND fecha_creacion <= '2025-11-17');

SELECT 
    'Total de resoluciones' as tipo,
    COUNT(*) as cantidad
FROM resoluciones_incidencias
WHERE incidencia_id IN (SELECT id FROM incidencias WHERE fecha_creacion >= '2025-01-01' AND fecha_creacion <= '2025-11-17');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
