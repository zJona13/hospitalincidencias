import { pool } from '../db.js';
import { registrarHistorial } from '../utils/historial.js';
import { notificarAsignacion } from '../utils/notificaciones.js';

/**
 * Asignar una incidencia a un responsable
 * POST /api/admin-ti/incidencias/:codigo/asignar
 */
export const asignarIncidencia = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { responsable_id } = req.body;
    const userId = req.user.id;

    if (!responsable_id) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del responsable es requerido'
      });
    }

    // Verificar que la incidencia existe
    const [incidencias] = await pool.execute(
      'SELECT id, responsable_id, estado FROM incidencias WHERE codigo = ?',
      [codigo]
    );

    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }

    const incidencia = incidencias[0];

    // Verificar que el responsable existe
    const [responsables] = await pool.execute(
      'SELECT id, nombre, email FROM usuarios WHERE id = ? AND activo = TRUE',
      [responsable_id]
    );

    if (responsables.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Responsable no encontrado o inactivo'
      });
    }

    const responsable = responsables[0];

    // Actualizar incidencia
    await pool.execute(
      'UPDATE incidencias SET responsable_id = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE codigo = ?',
      [responsable_id, codigo]
    );

    // Registrar en historial
    const descripcion = incidencia.responsable_id 
      ? `Incidencia reasignada a ${responsable.nombre}`
      : `Incidencia asignada a ${responsable.nombre}`;
    
    await registrarHistorial(
      incidencia.id,
      incidencia.responsable_id ? 'reasignacion' : 'asignacion',
      userId,
      descripcion
    );

    // Notificar al responsable
    await notificarAsignacion(incidencia.id, responsable_id);

    res.json({
      status: 'success',
      message: 'Incidencia asignada correctamente',
      data: {
        codigo,
        responsable: {
          id: responsable.id,
          nombre: responsable.nombre,
          email: responsable.email
        }
      }
    });
  } catch (error) {
    console.error('Error al asignar incidencia:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al asignar incidencia'
    });
  }
};

/**
 * Listar incidencias pendientes de asignación
 * GET /api/admin-ti/incidencias/pendientes
 */
export const listarIncidenciasPendientesAsignacion = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const limitNum = Math.max(1, Math.min(parseInt(limit) || 50, 1000));
    const offsetNum = Math.max(0, parseInt(offset) || 0);

    // MySQL no permite placeholders en LIMIT y OFFSET, usar interpolación directa
    const [incidencias] = await pool.execute(
      `SELECT 
        i.id, i.codigo, i.titulo, i.descripcion, i.estado, i.fecha_creacion,
        a.id as area_id, a.codigo as area_codigo, a.nombre as area_nombre,
        t.id as tipo_id, t.nombre as tipo_nombre,
        p.id as prioridad_id, p.nivel as prioridad_nivel, p.nombre as prioridad_nombre, p.color as prioridad_color,
        rp.id as reportado_por_id, rp.nombre as reportado_por_nombre, rp.email as reportado_por_email
       FROM incidencias i
       LEFT JOIN areas a ON i.area_id = a.id
       LEFT JOIN tipos_incidencias t ON i.tipo_incidencia_id = t.id
       LEFT JOIN prioridades p ON i.prioridad_id = p.id
       LEFT JOIN usuarios rp ON i.reportado_por_id = rp.id
       WHERE i.responsable_id IS NULL
         AND i.estado IN ('abierta', 'en_progreso')
       ORDER BY i.fecha_creacion DESC
       LIMIT ${limitNum} OFFSET ${offsetNum}`
    );

    // Contar total
    const [total] = await pool.execute(
      'SELECT COUNT(*) as total FROM incidencias WHERE responsable_id IS NULL AND estado IN (\'abierta\', \'en_progreso\')'
    );

    const incidenciasFormateadas = incidencias.map(inc => ({
      id: inc.id,
      codigo: inc.codigo,
      titulo: inc.titulo,
      descripcion: inc.descripcion,
      estado: inc.estado,
      fecha_creacion: inc.fecha_creacion,
      area: inc.area_id ? {
        id: inc.area_id,
        codigo: inc.area_codigo,
        nombre: inc.area_nombre
      } : null,
      tipo: inc.tipo_id ? {
        id: inc.tipo_id,
        nombre: inc.tipo_nombre
      } : null,
      prioridad: inc.prioridad_id ? {
        id: inc.prioridad_id,
        nivel: inc.prioridad_nivel,
        nombre: inc.prioridad_nombre,
        color: inc.prioridad_color
      } : null,
      reportadoPor: inc.reportado_por_id ? {
        id: inc.reportado_por_id,
        nombre: inc.reportado_por_nombre,
        email: inc.reportado_por_email
      } : null
    }));

    res.json({
      status: 'success',
      data: incidenciasFormateadas,
      paginacion: {
        total: total[0].total,
        limit: limitNum,
        offset: offsetNum
      }
    });
  } catch (error) {
    console.error('Error al listar incidencias pendientes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al listar incidencias pendientes'
    });
  }
};

/**
 * Reasignar una incidencia a otro responsable
 * PATCH /api/admin-ti/incidencias/:codigo/reasignar
 */
export const reasignarIncidencia = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { responsable_id } = req.body;
    const userId = req.user.id;

    if (!responsable_id) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del nuevo responsable es requerido'
      });
    }

    // Verificar que la incidencia existe
    const [incidencias] = await pool.execute(
      'SELECT id, responsable_id FROM incidencias WHERE codigo = ?',
      [codigo]
    );

    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }

    const incidencia = incidencias[0];

    if (!incidencia.responsable_id) {
      return res.status(400).json({
        status: 'error',
        message: 'La incidencia no tiene un responsable asignado. Use el endpoint de asignación.'
      });
    }

    // Verificar que el nuevo responsable existe
    const [responsables] = await pool.execute(
      'SELECT id, nombre, email FROM usuarios WHERE id = ? AND activo = TRUE',
      [responsable_id]
    );

    if (responsables.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Responsable no encontrado o inactivo'
      });
    }

    const nuevoResponsable = responsables[0];

    // Obtener responsable anterior
    const [responsablesAnteriores] = await pool.execute(
      'SELECT id, nombre FROM usuarios WHERE id = ?',
      [incidencia.responsable_id]
    );
    const responsableAnterior = responsablesAnteriores[0];

    // Actualizar incidencia
    await pool.execute(
      'UPDATE incidencias SET responsable_id = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE codigo = ?',
      [responsable_id, codigo]
    );

    // Registrar en historial
    await registrarHistorial(
      incidencia.id,
      'reasignacion',
      userId,
      `Incidencia reasignada de ${responsableAnterior.nombre} a ${nuevoResponsable.nombre}`
    );

    // Notificar al nuevo responsable
    await notificarAsignacion(incidencia.id, responsable_id);

    res.json({
      status: 'success',
      message: 'Incidencia reasignada correctamente',
      data: {
        codigo,
        responsable_anterior: {
          id: responsableAnterior.id,
          nombre: responsableAnterior.nombre
        },
        responsable_nuevo: {
          id: nuevoResponsable.id,
          nombre: nuevoResponsable.nombre,
          email: nuevoResponsable.email
        }
      }
    });
  } catch (error) {
    console.error('Error al reasignar incidencia:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al reasignar incidencia'
    });
  }
};

/**
 * Obtener estadísticas de asignaciones
 * GET /api/admin-ti/estadisticas
 */
export const obtenerEstadisticasAsignaciones = async (req, res) => {
  try {
    // Resumen general
    const [resumen] = await pool.execute(
      `SELECT 
        COUNT(CASE WHEN responsable_id IS NOT NULL THEN 1 END) as total_asignadas,
        COUNT(CASE WHEN responsable_id IS NULL AND estado IN ('abierta', 'en_progreso') THEN 1 END) as pendientes,
        COUNT(CASE WHEN responsable_id IS NOT NULL AND estado = 'resuelta' THEN 1 END) as resueltas,
        COUNT(CASE WHEN responsable_id IS NOT NULL AND estado = 'en_progreso' THEN 1 END) as en_progreso
       FROM incidencias
       WHERE estado IN ('abierta', 'en_progreso', 'resuelta', 'cerrada')`
    );

    // Por responsable - estadísticas completas
    const [porResponsable] = await pool.execute(
      `SELECT 
        u.id, u.nombre, u.email,
        COUNT(*) as total_asignadas,
        COUNT(CASE WHEN i.estado = 'abierta' THEN 1 END) as abiertas,
        COUNT(CASE WHEN i.estado = 'en_progreso' THEN 1 END) as en_progreso,
        COUNT(CASE WHEN i.estado = 'resuelta' THEN 1 END) as resueltas,
        COUNT(CASE WHEN i.estado = 'cerrada' THEN 1 END) as cerradas,
        AVG(CASE WHEN i.fecha_resolucion IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, i.fecha_creacion, i.fecha_resolucion) 
          END) as tiempo_promedio_resolucion,
        COUNT(CASE WHEN i.fecha_resolucion IS NOT NULL 
          AND i.fecha_vencimiento IS NOT NULL 
          AND i.fecha_resolucion > i.fecha_vencimiento 
          THEN 1 END) as fuera_sla,
        COUNT(CASE WHEN i.estado IN ('abierta', 'en_progreso') THEN 1 END) as carga_actual
       FROM incidencias i
       INNER JOIN usuarios u ON i.responsable_id = u.id
       WHERE i.responsable_id IS NOT NULL
       GROUP BY u.id, u.nombre, u.email
       ORDER BY total_asignadas DESC`
    );

    // Tiempo promedio de asignación desde creación
    const [tiempoAsignacion] = await pool.execute(
      `SELECT 
        u.id, u.nombre,
        AVG(TIMESTAMPDIFF(HOUR, i.fecha_creacion, h.fecha_evento)) as tiempo_promedio_asignacion
       FROM incidencias i
       INNER JOIN historial_incidencias h ON i.id = h.incidencia_id
       INNER JOIN usuarios u ON i.responsable_id = u.id
       WHERE h.tipo_evento IN ('asignacion', 'reasignacion')
         AND i.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 90 DAY)
       GROUP BY u.id, u.nombre`
    );

    // Distribución temporal - asignaciones por día/semana/mes
    const [distribucionTemporal] = await pool.execute(
      `SELECT 
        DATE_FORMAT(h.fecha_evento, '%Y-%m-%d') as fecha,
        COUNT(*) as cantidad
       FROM historial_incidencias h
       WHERE h.tipo_evento IN ('asignacion', 'reasignacion')
         AND h.fecha_evento >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE_FORMAT(h.fecha_evento, '%Y-%m-%d')
       ORDER BY fecha ASC`
    );

    // Por prioridad
    const [porPrioridad] = await pool.execute(
      `SELECT 
        p.nivel, p.nombre, p.color,
        COUNT(*) as total_asignadas,
        AVG(TIMESTAMPDIFF(HOUR, i.fecha_creacion, h.fecha_evento)) as tiempo_promedio_asignacion,
        COUNT(CASE WHEN i.fecha_resolucion IS NOT NULL 
          AND i.fecha_vencimiento IS NOT NULL 
          AND i.fecha_resolucion <= i.fecha_vencimiento 
          THEN 1 END) as cumplimiento_sla,
        COUNT(CASE WHEN i.fecha_resolucion IS NOT NULL 
          AND i.fecha_vencimiento IS NOT NULL 
          AND i.fecha_resolucion > i.fecha_vencimiento 
          THEN 1 END) as fuera_sla
       FROM incidencias i
       INNER JOIN prioridades p ON i.prioridad_id = p.id
       LEFT JOIN historial_incidencias h ON i.id = h.incidencia_id AND h.tipo_evento IN ('asignacion', 'reasignacion')
       WHERE i.responsable_id IS NOT NULL
       GROUP BY p.id, p.nivel, p.nombre, p.color
       ORDER BY p.nivel`
    );

    // Por área
    const [porArea] = await pool.execute(
      `SELECT 
        a.id, a.codigo, a.nombre,
        COUNT(*) as total_asignadas,
        COUNT(CASE WHEN i.responsable_id IS NULL AND i.estado IN ('abierta', 'en_progreso') THEN 1 END) as sin_asignar
       FROM incidencias i
       INNER JOIN areas a ON i.area_id = a.id
       WHERE i.estado IN ('abierta', 'en_progreso', 'resuelta', 'cerrada')
       GROUP BY a.id, a.codigo, a.nombre
       ORDER BY total_asignadas DESC`
    );

    // Top responsables más eficientes (mayor tasa de resolución en tiempo)
    const [topEficientes] = await pool.execute(
      `SELECT 
        u.id, u.nombre,
        COUNT(*) as total_asignadas,
        COUNT(CASE WHEN i.fecha_resolucion IS NOT NULL 
          AND i.fecha_vencimiento IS NOT NULL 
          AND i.fecha_resolucion <= i.fecha_vencimiento 
          THEN 1 END) as resueltas_en_tiempo,
        ROUND(COUNT(CASE WHEN i.fecha_resolucion IS NOT NULL 
          AND i.fecha_vencimiento IS NOT NULL 
          AND i.fecha_resolucion <= i.fecha_vencimiento 
          THEN 1 END) * 100.0 / COUNT(*), 2) as eficiencia
       FROM incidencias i
       INNER JOIN usuarios u ON i.responsable_id = u.id
       WHERE i.responsable_id IS NOT NULL
         AND i.estado IN ('resuelta', 'cerrada')
       GROUP BY u.id, u.nombre
       HAVING total_asignadas >= 5
       ORDER BY eficiencia DESC, total_asignadas DESC
       LIMIT 5`
    );

    // Responsables con más incidencias fuera de SLA
    const [fueraSLA] = await pool.execute(
      `SELECT 
        u.id, u.nombre,
        COUNT(*) as total_fuera_sla
       FROM incidencias i
       INNER JOIN usuarios u ON i.responsable_id = u.id
       WHERE i.fecha_resolucion IS NOT NULL 
         AND i.fecha_vencimiento IS NOT NULL 
         AND i.fecha_resolucion > i.fecha_vencimiento
       GROUP BY u.id, u.nombre
       ORDER BY total_fuera_sla DESC
       LIMIT 5`
    );

    // Tiempo promedio de respuesta a asignación (desde asignación hasta primer cambio de estado)
    const [tiempoRespuesta] = await pool.execute(
      `SELECT 
        u.id, u.nombre,
        AVG(TIMESTAMPDIFF(HOUR, h1.fecha_evento, h2.fecha_evento)) as tiempo_promedio_respuesta
       FROM incidencias i
       INNER JOIN usuarios u ON i.responsable_id = u.id
       INNER JOIN historial_incidencias h1 ON i.id = h1.incidencia_id AND h1.tipo_evento IN ('asignacion', 'reasignacion')
       LEFT JOIN historial_incidencias h2 ON i.id = h2.incidencia_id 
         AND h2.tipo_evento = 'estado' 
         AND h2.fecha_evento > h1.fecha_evento
         AND h2.estado_nuevo IN ('en_progreso', 'resuelta')
       WHERE h2.id IS NOT NULL
       GROUP BY u.id, u.nombre`
    );

    // Calcular eficiencia por responsable
    const responsablesConEficiencia = porResponsable.map(r => {
      const tiempoAsign = tiempoAsignacion.find(t => t.id === r.id);
      const tiempoResp = tiempoRespuesta.find(t => t.id === r.id);
      const eficiencia = r.total_asignadas > 0 
        ? ((r.resueltas || 0) / r.total_asignadas) * 100 
        : 0;
      
      return {
        ...r,
        tiempo_promedio_asignacion: tiempoAsign?.tiempo_promedio_asignacion || null,
        tiempo_promedio_respuesta: tiempoResp?.tiempo_promedio_respuesta || null,
        tasa_resolucion: eficiencia,
        eficiencia: r.total_asignadas > 0 && r.fuera_sla !== undefined
          ? ((r.total_asignadas - r.fuera_sla) / r.total_asignadas) * 100
          : null
      };
    });

    res.json({
      status: 'success',
      data: {
        resumen: resumen[0] || {
          total_asignadas: 0,
          pendientes: 0,
          resueltas: 0,
          en_progreso: 0
        },
        por_responsable: responsablesConEficiencia || [],
        distribucion_temporal: distribucionTemporal || [],
        por_prioridad: porPrioridad || [],
        por_area: porArea || [],
        top_eficientes: topEficientes || [],
        fuera_sla: fueraSLA || [],
        tiempo_promedio_asignacion_general: tiempoAsignacion.length > 0
          ? tiempoAsignacion.reduce((sum, t) => sum + (Number(t.tiempo_promedio_asignacion) || 0), 0) / tiempoAsignacion.length
          : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de asignaciones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas de asignaciones'
    });
  }
};

