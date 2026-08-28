-- =====================================================
-- Migración: recuperación de contraseña
-- Crea la tabla de tokens de restablecimiento.
-- Ejecutar sobre una base existente:
--   mysql -u root -p hospital_incidencias < migracion_recuperacion.sql
-- (En instalaciones nuevas ya viene incluida en bd.sql)
-- =====================================================

USE hospital_incidencias;

CREATE TABLE IF NOT EXISTS tokens_recuperacion (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL COMMENT 'SHA-256 del token enviado por correo; el token en claro nunca se almacena',
    fecha_expiracion DATETIME NOT NULL COMMENT 'Vence a los 30 minutos de emitido',
    fecha_uso DATETIME NULL COMMENT 'Se marca al restablecer; un token solo puede usarse una vez',
    ip_solicitud VARCHAR(45) NULL COMMENT 'IP desde la que se pidió el restablecimiento',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_token_hash (token_hash),
    INDEX idx_usuario (usuario_id),
    INDEX idx_expiracion (fecha_expiracion),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
