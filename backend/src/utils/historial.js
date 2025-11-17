import { pool } from '../db.js';

/**
 * Registra un evento en el historial de una incidencia
 * @param {number} incidenciaId - ID de la incidencia
 * @param {string} tipoEvento - Tipo de evento (creacion, asignacion, estado, comentario, adjunto, prioridad, reasignacion, resolucion)
 * @param {number} usuarioId - ID del usuario que realizó la acción
 * @param {string} descripcion - Descripción del evento
 * @param {string|null} estadoPrevio - Estado previo (si aplica)
 * @param {string|null} estadoNuevo - Estado nuevo (si aplica)
 */
export const registrarHistorial = async (
  incidenciaId,
  tipoEvento,
  usuarioId,
  descripcion,
  estadoPrevio = null,
  estadoNuevo = null
) => {
  try {
    await pool.execute(
      `INSERT INTO historial_incidencias 
       (incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [incidenciaId, tipoEvento, usuarioId, descripcion, estadoPrevio, estadoNuevo]
    );
  } catch (error) {
    console.error('Error al registrar historial:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

