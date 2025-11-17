-- =====================================================
-- Sistema de Gestión de Incidencias Hospitalarias
-- Base de Datos Inicial
-- Motor: MySQL/MariaDB
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS hospital_incidencias
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hospital_incidencias;

-- =====================================================
-- TABLA: usuarios
-- Gestión de usuarios del sistema con autenticación
-- =====================================================
CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Hash de la contraseña (bcrypt)',
    area_id INT UNSIGNED NULL COMMENT 'Área asignada al usuario',
    rol ENUM('administrador', 'medico', 'enfermero', 'tecnico', 'usuario') NOT NULL DEFAULT 'usuario',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_area (area_id),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: areas
-- Áreas y departamentos del hospital
-- =====================================================
CREATE TABLE areas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE COMMENT 'Código único del área (ej: URG, UCI, LAB)',
    nombre VARCHAR(255) NOT NULL,
    responsable_id INT UNSIGNED NULL COMMENT 'Usuario responsable del área',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_responsable (responsable_id),
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Actualizar foreign key de usuarios.area_id después de crear la tabla areas
ALTER TABLE usuarios 
    ADD FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- TABLA: servicios
-- Servicios específicos dentro de las áreas
-- =====================================================
CREATE TABLE servicios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    area_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_area (area_id),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: prioridades
-- Niveles de prioridad con configuración de SLA
-- =====================================================
CREATE TABLE prioridades (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nivel VARCHAR(5) NOT NULL UNIQUE COMMENT 'Nivel de prioridad (P1, P2, P3, P4)',
    nombre VARCHAR(50) NOT NULL COMMENT 'Nombre descriptivo (Crítica, Alta, Media, Baja)',
    color VARCHAR(50) NOT NULL COMMENT 'Color para UI (bg-destructive, bg-warning, etc)',
    tiempo_respuesta_minutos INT UNSIGNED NOT NULL COMMENT 'Tiempo máximo de respuesta en minutos',
    tiempo_resolucion_horas INT UNSIGNED NOT NULL COMMENT 'Tiempo máximo de resolución en horas',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_nivel (nivel),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: tipos_incidencias
-- Tipos principales de incidencias
-- =====================================================
CREATE TABLE tipos_incidencias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL COMMENT 'Categoría del tipo (Atención al paciente, Mantenimiento, etc)',
    color VARCHAR(50) NOT NULL COMMENT 'Color para UI',
    icono VARCHAR(50) NOT NULL COMMENT 'Nombre del icono (AlertCircle, Wrench, Monitor, etc)',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activo (activo),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: subtipos_incidencias
-- Subtipos relacionados con tipos de incidencias
-- =====================================================
CREATE TABLE subtipos_incidencias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_incidencia_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_tipo (tipo_incidencia_id),
    FOREIGN KEY (tipo_incidencia_id) REFERENCES tipos_incidencias(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: incidencias
-- Entidad principal del sistema
-- =====================================================
CREATE TABLE incidencias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE COMMENT 'Código único formato INC-YYYY-NNNN',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    area_id INT UNSIGNED NOT NULL,
    servicio_id INT UNSIGNED NULL COMMENT 'Servicio específico dentro del área',
    tipo_incidencia_id INT UNSIGNED NOT NULL,
    subtipo_incidencia_id INT UNSIGNED NULL,
    prioridad_id INT UNSIGNED NOT NULL,
    estado ENUM('abierta', 'en_progreso', 'resuelta', 'cerrada') NOT NULL DEFAULT 'abierta',
    reportado_por_id INT UNSIGNED NOT NULL COMMENT 'Usuario que reportó la incidencia',
    responsable_id INT UNSIGNED NULL COMMENT 'Usuario asignado para resolver',
    piso VARCHAR(50) NULL,
    habitacion VARCHAR(50) NULL,
    cama VARCHAR(50) NULL,
    equipo VARCHAR(255) NULL COMMENT 'Equipo médico o dispositivo implicado',
    paciente_id VARCHAR(50) NULL COMMENT 'Código del paciente (NO datos sensibles)',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME NULL COMMENT 'Fecha límite según SLA',
    fecha_resolucion DATETIME NULL,
    fecha_cierre DATETIME NULL,
    INDEX idx_codigo (codigo),
    INDEX idx_area (area_id),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad_id),
    INDEX idx_responsable (responsable_id),
    INDEX idx_reportado_por (reportado_por_id),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_tipo (tipo_incidencia_id),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (tipo_incidencia_id) REFERENCES tipos_incidencias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (subtipo_incidencia_id) REFERENCES subtipos_incidencias(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (prioridad_id) REFERENCES prioridades(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (reportado_por_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: comentarios
-- Comentarios en incidencias
-- =====================================================
CREATE TABLE comentarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    incidencia_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    texto TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_incidencia (incidencia_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_creacion),
    FOREIGN KEY (incidencia_id) REFERENCES incidencias(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: archivos_adjuntos
-- Archivos adjuntos a incidencias
-- =====================================================
CREATE TABLE archivos_adjuntos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    incidencia_id INT UNSIGNED NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta VARCHAR(500) NOT NULL COMMENT 'Ruta relativa o absoluta del archivo',
    tipo_mime VARCHAR(100) NOT NULL COMMENT 'Tipo MIME del archivo',
    tamano_bytes BIGINT UNSIGNED NOT NULL COMMENT 'Tamaño en bytes',
    subido_por_id INT UNSIGNED NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_incidencia (incidencia_id),
    INDEX idx_subido_por (subido_por_id),
    FOREIGN KEY (incidencia_id) REFERENCES incidencias(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (subido_por_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: historial_incidencias
-- Timeline/historial de cambios en incidencias
-- =====================================================
CREATE TABLE historial_incidencias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    incidencia_id INT UNSIGNED NOT NULL,
    tipo_evento ENUM('creacion', 'asignacion', 'estado', 'comentario', 'adjunto', 'prioridad', 'reasignacion') NOT NULL,
    usuario_id INT UNSIGNED NOT NULL COMMENT 'Usuario que realizó la acción',
    descripcion TEXT NOT NULL COMMENT 'Descripción del evento',
    estado_previo VARCHAR(50) NULL COMMENT 'Estado previo (si aplica)',
    estado_nuevo VARCHAR(50) NULL COMMENT 'Estado nuevo (si aplica)',
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_incidencia (incidencia_id),
    INDEX idx_tipo_evento (tipo_evento),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_evento),
    FOREIGN KEY (incidencia_id) REFERENCES incidencias(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: notificaciones
-- Notificaciones para usuarios
-- =====================================================
CREATE TABLE notificaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    incidencia_id INT UNSIGNED NULL COMMENT 'Incidencia relacionada (si aplica)',
    tipo VARCHAR(50) NOT NULL COMMENT 'Tipo de notificación (asignacion, comentario, estado, etc)',
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id),
    INDEX idx_incidencia (incidencia_id),
    INDEX idx_leida (leida),
    INDEX idx_fecha (fecha_creacion),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (incidencia_id) REFERENCES incidencias(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATOS INICIALES (SEED DATA)
-- =====================================================

-- Insertar prioridades predefinidas
INSERT INTO prioridades (nivel, nombre, color, tiempo_respuesta_minutos, tiempo_resolucion_horas, activo) VALUES
('P1', 'Crítica', 'bg-priority-high', 15, 2, TRUE),
('P2', 'Alta', 'bg-destructive', 30, 4, TRUE),
('P3', 'Media', 'bg-priority-medium', 120, 24, TRUE),
('P4', 'Baja', 'bg-priority-low', 240, 72, TRUE);

-- Insertar tipos de incidencias básicos
INSERT INTO tipos_incidencias (nombre, categoria, color, icono, activo) VALUES
('Clínica', 'Atención al paciente', 'bg-destructive', 'AlertCircle', TRUE),
('Infraestructura', 'Mantenimiento', 'bg-warning', 'Wrench', TRUE),
('Tecnología', 'TI y Sistemas', 'bg-primary', 'Monitor', TRUE),
('Administrativa', 'Gestión', 'bg-secondary', 'FileText', TRUE);

-- Insertar áreas básicas del hospital (sin responsable inicial, se asignará después)
INSERT INTO areas (codigo, nombre, activo) VALUES
('URG', 'Urgencias', TRUE),
('UCI', 'Unidad de Cuidados Intensivos', TRUE),
('LAB', 'Laboratorio', TRUE),
('RAD', 'Radiología', TRUE),
('TI', 'Tecnología de la Información', TRUE),
('FARM', 'Farmacia', TRUE),
('ADM', 'Administración', TRUE),
('CONS', 'Consultorios', TRUE),
('HOSP', 'Hospitalización', TRUE),
('QUIR', 'Quirófano', TRUE);

-- Insertar usuario administrador por defecto
-- Password: admin123 (hash bcrypt - debe ser generado por la aplicación)
-- NOTA: Este hash es un ejemplo, debe ser reemplazado con un hash real generado por bcrypt
INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES
('Administrador', 'admin@hospital.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqO', 'administrador', TRUE);

-- Actualizar el área del administrador (asignar a Administración)
UPDATE usuarios 
SET area_id = (SELECT id FROM areas WHERE codigo = 'ADM' LIMIT 1)
WHERE email = 'admin@hospital.com';

-- Actualizar responsables de áreas (asignar administrador como responsable temporal)
UPDATE areas 
SET responsable_id = (SELECT id FROM usuarios WHERE email = 'admin@hospital.com' LIMIT 1)
WHERE codigo IN ('ADM', 'TI');

-- Insertar algunos servicios de ejemplo
INSERT INTO servicios (area_id, nombre, descripcion, activo) VALUES
((SELECT id FROM areas WHERE codigo = 'URG' LIMIT 1), 'Sala de Urgencias 1', 'Sala principal de atención de urgencias', TRUE),
((SELECT id FROM areas WHERE codigo = 'URG' LIMIT 1), 'Sala de Urgencias 2', 'Sala secundaria de atención de urgencias', TRUE),
((SELECT id FROM areas WHERE codigo = 'UCI' LIMIT 1), 'UCI Adultos', 'Unidad de cuidados intensivos para adultos', TRUE),
((SELECT id FROM areas WHERE codigo = 'UCI' LIMIT 1), 'UCI Pediátrica', 'Unidad de cuidados intensivos pediátrica', TRUE),
((SELECT id FROM areas WHERE codigo = 'LAB' LIMIT 1), 'Laboratorio Clínico', 'Análisis clínicos generales', TRUE),
((SELECT id FROM areas WHERE codigo = 'LAB' LIMIT 1), 'Hematología', 'Análisis hematológicos', TRUE),
((SELECT id FROM areas WHERE codigo = 'RAD' LIMIT 1), 'Rayos X', 'Servicio de radiología general', TRUE),
((SELECT id FROM areas WHERE codigo = 'RAD' LIMIT 1), 'Tomografía', 'Servicio de tomografía computarizada', TRUE);

-- Insertar algunos subtipos de ejemplo
INSERT INTO subtipos_incidencias (tipo_incidencia_id, nombre, descripcion, activo) VALUES
((SELECT id FROM tipos_incidencias WHERE nombre = 'Tecnología' LIMIT 1), 'Hardware', 'Problemas con equipos físicos', TRUE),
((SELECT id FROM tipos_incidencias WHERE nombre = 'Tecnología' LIMIT 1), 'Software', 'Problemas con aplicaciones o sistemas', TRUE),
((SELECT id FROM tipos_incidencias WHERE nombre = 'Tecnología' LIMIT 1), 'Red', 'Problemas de conectividad', TRUE),
((SELECT id FROM tipos_incidencias WHERE nombre = 'Infraestructura' LIMIT 1), 'Climatización', 'Aire acondicionado, calefacción', TRUE),
((SELECT id FROM tipos_incidencias WHERE nombre = 'Infraestructura' LIMIT 1), 'Electricidad', 'Problemas eléctricos', TRUE),
((SELECT id FROM tipos_incidencias WHERE nombre = 'Infraestructura' LIMIT 1), 'Plomería', 'Problemas de agua y desagüe', TRUE),
((SELECT id FROM tipos_incidencias WHERE nombre = 'Clínica' LIMIT 1), 'Equipamiento médico', 'Fallo en equipos médicos', TRUE),
((SELECT id FROM tipos_incidencias WHERE nombre = 'Clínica' LIMIT 1), 'Suministros', 'Falta de insumos médicos', TRUE);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

