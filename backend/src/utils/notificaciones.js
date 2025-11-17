import { pool } from '../db.js';

/**
 * Crea una notificación para un usuario
 * @param {number} usuarioId - ID del usuario destinatario
 * @param {string} tipo - Tipo de notificación
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje de la notificación
 * @param {number|null} incidenciaId - ID de la incidencia relacionada (opcional)
 */
export const crearNotificacion = async (usuarioId, tipo, titulo, mensaje, incidenciaId = null) => {
  try {
    await pool.execute(
      `INSERT INTO notificaciones (usuario_id, incidencia_id, tipo, titulo, mensaje, leida)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [usuarioId, incidenciaId, tipo, titulo, mensaje]
    );
  } catch (error) {
    console.error('Error al crear notificación:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Crea notificaciones para múltiples usuarios
 * @param {number[]} usuarioIds - Array de IDs de usuarios
 * @param {string} tipo - Tipo de notificación
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje de la notificación
 * @param {number|null} incidenciaId - ID de la incidencia relacionada (opcional)
 */
export const crearNotificaciones = async (usuarioIds, tipo, titulo, mensaje, incidenciaId = null) => {
  if (!usuarioIds || usuarioIds.length === 0) return;
  
  try {
    const valores = usuarioIds.map(id => [id, incidenciaId, tipo, titulo, mensaje, false]);
    
    const placeholders = valores.map(() => '(?, ?, ?, ?, ?, FALSE)').join(', ');
    const valoresPlanos = valores.flat();
    
    await pool.execute(
      `INSERT INTO notificaciones (usuario_id, incidencia_id, tipo, titulo, mensaje, leida)
       VALUES ${placeholders}`,
      valoresPlanos
    );
  } catch (error) {
    console.error('Error al crear notificaciones:', error);
  }
};

/**
 * Crea notificación de asignación de incidencia
 */
export const notificarAsignacion = async (usuarioId, incidenciaCodigo, incidenciaTitulo, incidenciaId = null) => {
  // Si no se proporciona incidenciaId, buscarlo por código
  let idIncidencia = incidenciaId;
  if (!idIncidencia) {
    try {
      const [incidencias] = await pool.execute(
        'SELECT id FROM incidencias WHERE codigo = ? LIMIT 1',
        [incidenciaCodigo]
      );
      if (incidencias.length > 0) {
        idIncidencia = incidencias[0].id;
      }
    } catch (error) {
      console.error('Error al buscar incidencia por código:', error);
    }
  }
  
  await crearNotificacion(
    usuarioId,
    'asignacion',
    'Nueva incidencia asignada',
    `Se te ha asignado la incidencia ${incidenciaCodigo}: ${incidenciaTitulo}`,
    idIncidencia
  );
};

/**
 * Crea notificación de cambio de estado
 */
export const notificarCambioEstado = async (usuarioId, incidenciaCodigo, estadoAnterior, estadoNuevo, incidenciaId = null) => {
  // Si no se proporciona incidenciaId, buscarlo por código
  let idIncidencia = incidenciaId;
  if (!idIncidencia) {
    try {
      const [incidencias] = await pool.execute(
        'SELECT id FROM incidencias WHERE codigo = ? LIMIT 1',
        [incidenciaCodigo]
      );
      if (incidencias.length > 0) {
        idIncidencia = incidencias[0].id;
      }
    } catch (error) {
      console.error('Error al buscar incidencia por código:', error);
    }
  }
  
  await crearNotificacion(
    usuarioId,
    'estado',
    'Estado de incidencia actualizado',
    `La incidencia ${incidenciaCodigo} cambió de "${estadoAnterior}" a "${estadoNuevo}"`,
    idIncidencia
  );
};

/**
 * Crea notificación de nuevo comentario
 */
export const notificarComentario = async (usuarioId, incidenciaCodigo, autorNombre, incidenciaId = null) => {
  // Si no se proporciona incidenciaId, buscarlo por código
  let idIncidencia = incidenciaId;
  if (!idIncidencia) {
    try {
      const [incidencias] = await pool.execute(
        'SELECT id FROM incidencias WHERE codigo = ? LIMIT 1',
        [incidenciaCodigo]
      );
      if (incidencias.length > 0) {
        idIncidencia = incidencias[0].id;
      }
    } catch (error) {
      console.error('Error al buscar incidencia por código:', error);
    }
  }
  
  await crearNotificacion(
    usuarioId,
    'comentario',
    'Nuevo comentario',
    `${autorNombre} comentó en la incidencia ${incidenciaCodigo}`,
    idIncidencia
  );
};

