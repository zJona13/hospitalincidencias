import { pool } from '../db.js';
import { calcularPredicciones, guardarPredicciones, obtenerPrediccionesGuardadas } from '../services/predicciones.service.js';

/**
 * Obtener predicciones para un período específico
 * GET /api/analiticas/predicciones?periodo=mensual&fecha_inicio=2024-12-01
 */
export const obtenerPredicciones = async (req, res) => {
  try {
    const { periodo, fecha_inicio, recalcular } = req.query;
    
    if (!periodo || !['mensual', 'trimestral', 'anual'].includes(periodo)) {
      return res.status(400).json({
        status: 'error',
        message: 'Período inválido. Debe ser: mensual, trimestral o anual'
      });
    }

    // Si se solicita recalcular o no hay predicciones guardadas, calcular nuevas
    let predicciones;
    
    if (recalcular === 'true') {
      const fechaInicio = fecha_inicio ? new Date(fecha_inicio) : null;
      predicciones = await calcularPredicciones(periodo, fechaInicio);
      
      // Guardar las nuevas predicciones
      await guardarPredicciones(predicciones);
    } else {
      // Intentar obtener predicciones guardadas
      const fechaInicio = fecha_inicio ? new Date(fecha_inicio) : null;
      const guardadas = await obtenerPrediccionesGuardadas(periodo, fechaInicio);
      
      if (guardadas.length > 0) {
        predicciones = guardadas;
      } else {
        // Si no hay guardadas, calcular y guardar
        predicciones = await calcularPredicciones(periodo, fechaInicio);
        await guardarPredicciones(predicciones);
      }
    }

    // Enriquecer predicciones con métricas adicionales desde metadatos
    const prediccionesEnriquecidas = predicciones.map(p => {
      const metadatos = typeof p.metadatos === 'string' ? JSON.parse(p.metadatos) : (p.metadatos || {});
      return {
        ...p,
        costo_estimado: metadatos.costo_estimado || null,
        tiempo_atencion_perdido_horas: metadatos.tiempo_atencion_perdido_horas || null,
        personal_necesario: metadatos.personal_necesario || null,
        horas_hombre_estimadas: metadatos.horas_hombre_estimadas || null,
      };
    });

    res.json({
      status: 'success',
      data: prediccionesEnriquecidas
    });
  } catch (error) {
    console.error('Error al obtener predicciones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener predicciones'
    });
  }
};

/**
 * Obtener detalle de una predicción específica
 * GET /api/analiticas/predicciones/:id
 */
export const obtenerPrediccionDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [predicciones] = await pool.execute(
      `SELECT p.*, 
              t.nombre as tipo_incidencia_nombre,
              a.nombre as area_nombre, a.codigo as area_codigo
       FROM predicciones_incidencias p
       LEFT JOIN tipos_incidencias t ON p.tipo_incidencia_id = t.id
       LEFT JOIN areas a ON p.area_id = a.id
       WHERE p.id = ?`,
      [id]
    );

    if (predicciones.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Predicción no encontrada'
      });
    }

    const prediccion = predicciones[0];
    prediccion.metadatos = prediccion.metadatos ? JSON.parse(prediccion.metadatos) : null;

    res.json({
      status: 'success',
      data: prediccion
    });
  } catch (error) {
    console.error('Error al obtener detalle de predicción:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener detalle de predicción'
    });
  }
};

/**
 * Calcular impacto estimado para un tipo de incidencia y área
 * GET /api/analiticas/impacto?tipo_incidencia_id=1&area_id=2&periodo=mensual
 */
export const obtenerImpactoEstimado = async (req, res) => {
  try {
    const { tipo_incidencia_id, area_id, periodo } = req.query;
    
    if (!periodo || !['mensual', 'trimestral', 'anual'].includes(periodo)) {
      return res.status(400).json({
        status: 'error',
        message: 'Período inválido'
      });
    }

    // Calcular predicciones
    const predicciones = await calcularPredicciones(periodo);
    
    // Filtrar por tipo y área si se especifican
    let filtradas = predicciones;
    
    if (tipo_incidencia_id) {
      filtradas = filtradas.filter(p => p.tipo_incidencia_id === parseInt(tipo_incidencia_id));
    }
    
    if (area_id) {
      filtradas = filtradas.filter(p => p.area_id === parseInt(area_id));
    }

    // Si no hay predicciones filtradas, calcular promedios históricos
    if (filtradas.length === 0) {
      let query = `
        SELECT 
          COUNT(*) as total,
          AVG(personas_afectadas) as personas_promedio,
          AVG(pacientes_afectados) as pacientes_promedio,
          AVG(TIMESTAMPDIFF(HOUR, fecha_creacion, fecha_resolucion)) as tiempo_promedio
        FROM incidencias
        WHERE estado IN ('resuelta', 'cerrada')
      `;
      
      const params = [];
      
      if (tipo_incidencia_id) {
        query += ' AND tipo_incidencia_id = ?';
        params.push(tipo_incidencia_id);
      }
      
      if (area_id) {
        query += ' AND area_id = ?';
        params.push(area_id);
      }
      
      // Filtrar por período histórico
      if (periodo === 'mensual') {
        query += ' AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';
      } else if (periodo === 'trimestral') {
        query += ' AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 2 YEAR)';
      } else {
        query += ' AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 5 YEAR)';
      }
      
      const [historico] = await pool.execute(query, params);
      
      if (historico.length > 0 && historico[0].total > 0) {
        const total = parseInt(historico[0].total);
        const factor = periodo === 'mensual' ? 12 : periodo === 'trimestral' ? 4 : 1;
        const promedio = total / factor;
        
        filtradas = [{
          tipo_incidencia_id: tipo_incidencia_id ? parseInt(tipo_incidencia_id) : null,
          area_id: area_id ? parseInt(area_id) : null,
          periodo,
          probabilidad: Math.min(100, Math.max(0, (promedio / 20) * 100)),
          personas_afectadas_estimadas: Math.round((historico[0].personas_promedio || 5) * promedio),
          pacientes_afectados_estimados: Math.round((historico[0].pacientes_promedio || 3) * promedio),
          tiempo_promedio_horas: historico[0].tiempo_promedio || null,
          total_historico: total
        }];
      }
    }

    // Calcular totales
    const totalPersonas = filtradas.reduce((sum, p) => sum + (p.personas_afectadas_estimadas || 0), 0);
    const totalPacientes = filtradas.reduce((sum, p) => sum + (p.pacientes_afectados_estimados || 0), 0);
    const probabilidadPromedio = filtradas.length > 0 
      ? filtradas.reduce((sum, p) => sum + p.probabilidad, 0) / filtradas.length 
      : 0;

    res.json({
      status: 'success',
      data: {
        predicciones: filtradas,
        resumen: {
          total_personas_afectadas_estimadas: totalPersonas,
          total_pacientes_afectados_estimados: totalPacientes,
          probabilidad_promedio: Math.round(probabilidadPromedio * 100) / 100,
          cantidad_predicciones: filtradas.length
        }
      }
    });
  } catch (error) {
    console.error('Error al calcular impacto estimado:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al calcular impacto estimado'
    });
  }
};

/**
 * Obtener reportes avanzados con análisis profundo
 * GET /api/analiticas/reportes-avanzados?fecha_inicio=2024-01-01&fecha_fin=2024-12-31
 */
export const obtenerReportesAvanzados = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, area_id, tipo_incidencia_id } = req.query;
    
    let fechaFilter = '';
    const params = [];
    
    if (fecha_inicio && fecha_fin) {
      fechaFilter = 'WHERE fecha_creacion BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    } else if (fecha_inicio) {
      fechaFilter = 'WHERE fecha_creacion >= ?';
      params.push(fecha_inicio);
    } else if (fecha_fin) {
      fechaFilter = 'WHERE fecha_creacion <= ?';
      params.push(fecha_fin);
    }
    
    if (area_id) {
      fechaFilter += fechaFilter ? ' AND area_id = ?' : 'WHERE area_id = ?';
      params.push(area_id);
    }
    
    if (tipo_incidencia_id) {
      fechaFilter += fechaFilter ? ' AND tipo_incidencia_id = ?' : 'WHERE tipo_incidencia_id = ?';
      params.push(tipo_incidencia_id);
    }

    // Estadísticas generales
    const [estadisticas] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'abierta' THEN 1 END) as abiertas,
        COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as en_progreso,
        COUNT(CASE WHEN estado = 'resuelta' THEN 1 END) as resueltas,
        COUNT(CASE WHEN estado = 'cerrada' THEN 1 END) as cerradas,
        AVG(TIMESTAMPDIFF(HOUR, fecha_creacion, fecha_resolucion)) as tiempo_promedio_resolucion,
        AVG(personas_afectadas) as personas_promedio,
        AVG(pacientes_afectados) as pacientes_promedio
       FROM incidencias
       ${fechaFilter}`,
      params
    );

    // Distribución por tipo
    const [distribucionTipo] = await pool.execute(
      `SELECT t.id, t.nombre, COUNT(*) as cantidad
       FROM incidencias i
       INNER JOIN tipos_incidencias t ON i.tipo_incidencia_id = t.id
       ${fechaFilter}
       GROUP BY t.id, t.nombre
       ORDER BY cantidad DESC`,
      params
    );

    // Distribución por área
    const [distribucionArea] = await pool.execute(
      `SELECT a.id, a.codigo, a.nombre, COUNT(*) as cantidad
       FROM incidencias i
       INNER JOIN areas a ON i.area_id = a.id
       ${fechaFilter}
       GROUP BY a.id, a.codigo, a.nombre
       ORDER BY cantidad DESC`,
      params
    );

    // Tendencias temporales (últimos 12 meses)
    const [tendencias] = await pool.execute(
      `SELECT 
        DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
        COUNT(*) as cantidad
       FROM incidencias
       ${fechaFilter ? fechaFilter + ' AND' : 'WHERE'} fecha_creacion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
       ORDER BY mes ASC`,
      params
    );

    res.json({
      status: 'success',
      data: {
        estadisticas: estadisticas[0] || {},
        distribucion_tipo: distribucionTipo,
        distribucion_area: distribucionArea,
        tendencias: tendencias
      }
    });
  } catch (error) {
    console.error('Error al obtener reportes avanzados:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener reportes avanzados'
    });
  }
};

/**
 * Obtener métricas completas para el director del hospital
 * GET /api/analiticas/metricas-director?periodo=mensual
 */
export const obtenerMetricasDirector = async (req, res) => {
  try {
    const { periodo = 'mensual' } = req.query;
    
    // Obtener predicciones
    const predicciones = await calcularPredicciones(periodo);
    
    // Calcular resumen ejecutivo
    const totalPersonas = predicciones.reduce((sum, p) => sum + (p.personas_afectadas_estimadas || 0), 0);
    const totalPacientes = predicciones.reduce((sum, p) => sum + (p.pacientes_afectados_estimados || 0), 0);
    const totalCosto = predicciones.reduce((sum, p) => {
      const metadatos = typeof p.metadatos === 'string' ? JSON.parse(p.metadatos) : (p.metadatos || {});
      return sum + (metadatos.costo_estimado || 0);
    }, 0);
    const totalHorasHombre = predicciones.reduce((sum, p) => {
      const metadatos = typeof p.metadatos === 'string' ? JSON.parse(p.metadatos) : (p.metadatos || {});
      return sum + (metadatos.horas_hombre_estimadas || 0);
    }, 0);
    const totalPersonalNecesario = predicciones.reduce((sum, p) => {
      const metadatos = typeof p.metadatos === 'string' ? JSON.parse(p.metadatos) : (p.metadatos || {});
      return sum + (metadatos.personal_necesario || 0);
    }, 0);
    const totalTiempoAtencionPerdido = predicciones.reduce((sum, p) => {
      const metadatos = typeof p.metadatos === 'string' ? JSON.parse(p.metadatos) : (p.metadatos || {});
      return sum + (metadatos.tiempo_atencion_perdido_horas || 0);
    }, 0);
    const probabilidadPromedio = predicciones.length > 0 
      ? predicciones.reduce((sum, p) => sum + p.probabilidad, 0) / predicciones.length 
      : 0;

    // Top incidencias más críticas (por probabilidad, impacto y costo)
    const topCriticas = predicciones
      .map(p => {
        const metadatos = typeof p.metadatos === 'string' ? JSON.parse(p.metadatos) : (p.metadatos || {});
        const score = p.probabilidad * 0.4 + 
                     ((p.pacientes_afectados_estimados || 0) / 100) * 30 + 
                     ((metadatos.costo_estimado || 0) / 10000) * 30;
        return { ...p, score, metadatos };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // Áreas de mayor riesgo
    const areasRiesgo = predicciones
      .filter(p => p.area_id)
      .reduce((acc, p) => {
        const key = p.area_id;
        if (!acc[key]) {
          acc[key] = {
            area_id: p.area_id,
            area_nombre: p.area_nombre,
            total_predicciones: 0,
            probabilidad_promedio: 0,
            pacientes_afectados: 0,
            costo_total: 0,
          };
        }
        const metadatos = typeof p.metadatos === 'string' ? JSON.parse(p.metadatos) : (p.metadatos || {});
        acc[key].total_predicciones++;
        acc[key].probabilidad_promedio += p.probabilidad;
        acc[key].pacientes_afectados += (p.pacientes_afectados_estimados || 0);
        acc[key].costo_total += (metadatos.costo_estimado || 0);
        return acc;
      }, {});

    const areasRiesgoArray = Object.values(areasRiesgo).map(a => ({
      ...a,
      probabilidad_promedio: a.probabilidad_promedio / a.total_predicciones,
    })).sort((a, b) => b.probabilidad_promedio - a.probabilidad_promedio);

    // Análisis de tendencias estacionales
    const [tendenciasEstacionales] = await pool.execute(
      `SELECT 
        MONTH(fecha_creacion) as mes,
        COUNT(*) as cantidad,
        AVG(personas_afectadas) as personas_promedio,
        AVG(pacientes_afectados) as pacientes_promedio
       FROM incidencias
       WHERE estado IN ('resuelta', 'cerrada')
         AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 2 YEAR)
       GROUP BY MONTH(fecha_creacion)
       ORDER BY mes`
    );

    // Comparación con período anterior
    const ahora = new Date();
    let fechaInicioAnterior, fechaFinAnterior;
    if (periodo === 'mensual') {
      fechaInicioAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      fechaFinAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
    } else if (periodo === 'trimestral') {
      const trimestreActual = Math.floor(ahora.getMonth() / 3);
      fechaInicioAnterior = new Date(ahora.getFullYear(), (trimestreActual - 1) * 3, 1);
      fechaFinAnterior = new Date(ahora.getFullYear(), trimestreActual * 3, 0);
    } else {
      fechaInicioAnterior = new Date(ahora.getFullYear() - 1, 0, 1);
      fechaFinAnterior = new Date(ahora.getFullYear() - 1, 11, 31);
    }

    const [comparacionAnterior] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        AVG(personas_afectadas) as personas_promedio,
        AVG(pacientes_afectados) as pacientes_promedio,
        AVG(TIMESTAMPDIFF(HOUR, fecha_creacion, fecha_resolucion)) as tiempo_promedio
       FROM incidencias
       WHERE estado IN ('resuelta', 'cerrada')
         AND fecha_creacion BETWEEN ? AND ?`,
      [fechaInicioAnterior.toISOString().split('T')[0], fechaFinAnterior.toISOString().split('T')[0]]
    );

    res.json({
      status: 'success',
      data: {
        resumen: {
          total_predicciones: predicciones.length,
          probabilidad_promedio: Math.round(probabilidadPromedio * 100) / 100,
          total_personas_afectadas: totalPersonas,
          total_pacientes_afectados: totalPacientes,
          costo_total_estimado: totalCosto,
          horas_hombre_totales: totalHorasHombre,
          personal_necesario_total: totalPersonalNecesario,
          tiempo_atencion_perdido_horas: totalTiempoAtencionPerdido,
        },
        top_incidencias_criticas: topCriticas,
        areas_mayor_riesgo: areasRiesgoArray,
        tendencias_estacionales: tendenciasEstacionales,
        comparacion_periodo_anterior: comparacionAnterior[0] || {},
        alertas: [
          ...(totalCosto > 50000 ? [{
            tipo: 'costo',
            mensaje: `Costo estimado alto: S/ ${totalCosto.toLocaleString()}`,
            nivel: 'alto'
          }] : []),
          ...(totalPacientes > 100 ? [{
            tipo: 'impacto',
            mensaje: `Alto impacto en pacientes: ${totalPacientes} pacientes afectados estimados`,
            nivel: 'alto'
          }] : []),
          ...(areasRiesgoArray.length > 0 && areasRiesgoArray[0].probabilidad_promedio > 70 ? [{
            tipo: 'riesgo',
            mensaje: `Área de alto riesgo: ${areasRiesgoArray[0].area_nombre} (${areasRiesgoArray[0].probabilidad_promedio.toFixed(1)}% probabilidad)`,
            nivel: 'medio'
          }] : []),
        ],
        recomendaciones: [
          totalPersonalNecesario > 10 ? 'Considerar asignar personal adicional para el período' : null,
          totalCosto > 50000 ? 'Revisar presupuesto y considerar medidas preventivas' : null,
          areasRiesgoArray.length > 0 ? `Fortalecer recursos en área: ${areasRiesgoArray[0].area_nombre}` : null,
        ].filter(r => r !== null)
      }
    });
  } catch (error) {
    console.error('Error al obtener métricas del director:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener métricas del director'
    });
  }
};

