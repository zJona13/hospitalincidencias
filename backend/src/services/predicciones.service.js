import { pool } from '../db.js';

/**
 * Calcula predicciones de incidencias basadas en datos históricos
 * @param {string} periodo - 'mensual', 'trimestral' o 'anual'
 * @param {Date} fechaInicio - Fecha de inicio del período a predecir
 * @returns {Promise<Array>} Array de predicciones
 */
export const calcularPredicciones = async (periodo, fechaInicio = null) => {
  try {
    // Determinar fechas del período
    const ahora = new Date();
    let inicioPeriodo, finPeriodo;
    
    if (!fechaInicio) {
      if (periodo === 'mensual') {
        inicioPeriodo = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
        finPeriodo = new Date(ahora.getFullYear(), ahora.getMonth() + 2, 0);
      } else if (periodo === 'trimestral') {
        const trimestreActual = Math.floor(ahora.getMonth() / 3);
        inicioPeriodo = new Date(ahora.getFullYear(), trimestreActual * 3 + 3, 1);
        finPeriodo = new Date(ahora.getFullYear(), trimestreActual * 3 + 6, 0);
      } else if (periodo === 'anual') {
        inicioPeriodo = new Date(ahora.getFullYear() + 1, 0, 1);
        finPeriodo = new Date(ahora.getFullYear() + 1, 11, 31);
      }
    } else {
      inicioPeriodo = new Date(fechaInicio);
      if (periodo === 'mensual') {
        finPeriodo = new Date(inicioPeriodo.getFullYear(), inicioPeriodo.getMonth() + 1, 0);
      } else if (periodo === 'trimestral') {
        finPeriodo = new Date(inicioPeriodo.getFullYear(), inicioPeriodo.getMonth() + 3, 0);
      } else {
        finPeriodo = new Date(inicioPeriodo.getFullYear() + 1, 11, 31);
      }
    }

    // Obtener datos históricos del mismo período en años anteriores
    const aniosHistoricos = 2; // Analizar últimos 2 años
    const predicciones = [];

    // 1. Predicciones por tipo de incidencia
    const [tiposIncidencias] = await pool.execute(
      'SELECT id, nombre FROM tipos_incidencias WHERE activo = TRUE'
    );

    for (const tipo of tiposIncidencias) {
      // Calcular promedio histórico del mismo período
      const mes = inicioPeriodo.getMonth();
      const anio = inicioPeriodo.getFullYear();
      
      let queryHistorico = `
        SELECT 
          COUNT(*) as total,
          AVG(TIMESTAMPDIFF(HOUR, fecha_creacion, fecha_resolucion)) as tiempo_promedio,
          AVG(personas_afectadas) as personas_promedio,
          AVG(pacientes_afectados) as pacientes_promedio
        FROM incidencias
        WHERE tipo_incidencia_id = ?
          AND estado IN ('resuelta', 'cerrada')
      `;

      const params = [tipo.id];

      if (periodo === 'mensual') {
        queryHistorico += ` AND MONTH(fecha_creacion) = ? AND YEAR(fecha_creacion) < ?`;
        params.push(mes + 1, anio);
      } else if (periodo === 'trimestral') {
        const trimestre = Math.floor(mes / 3);
        queryHistorico += ` AND QUARTER(fecha_creacion) = ? AND YEAR(fecha_creacion) < ?`;
        params.push(trimestre + 1, anio);
      } else {
        queryHistorico += ` AND YEAR(fecha_creacion) < ?`;
        params.push(anio);
      }

      const [historico] = await pool.execute(queryHistorico, params);

      if (historico.length > 0 && historico[0].total > 0) {
        const total = parseInt(historico[0].total) || 0;
        const promedio = total / aniosHistoricos;
        
        // Calcular tendencia (promedio móvil simple)
        const probabilidad = Math.min(100, Math.max(0, (promedio / 10) * 100)); // Escalar probabilidad
        
        // Estimar impacto basado en promedios históricos
        const personasEstimadas = Math.round(historico[0].personas_promedio * promedio) || Math.round(promedio * 5);
        const pacientesEstimados = Math.round(historico[0].pacientes_promedio * promedio) || Math.round(promedio * 3);

        // Calcular costo estimado (basado en tiempo promedio y tipo)
        const costoPorHora = tipo.nombre.toLowerCase().includes('clínica') ? 150 : 
                            tipo.nombre.toLowerCase().includes('ti') ? 100 :
                            tipo.nombre.toLowerCase().includes('infraestructura') ? 80 : 50;
        const horasEstimadas = (historico[0].tiempo_promedio || 8) * promedio;
        const costoEstimado = Math.round(horasEstimadas * costoPorHora);

        // Calcular impacto operativo
        const tiempoAtencionPerdido = Math.round((historico[0].tiempo_promedio || 8) * promedio * pacientesEstimados);
        const personalNecesario = Math.ceil(promedio / 5); // Estimación: 1 persona cada 5 incidencias

        predicciones.push({
          tipo_incidencia_id: tipo.id,
          tipo_incidencia_nombre: tipo.nombre,
          area_id: null,
          periodo,
          fecha_periodo_inicio: inicioPeriodo.toISOString().split('T')[0],
          fecha_periodo_fin: finPeriodo.toISOString().split('T')[0],
          probabilidad: Math.round(probabilidad * 100) / 100,
          personas_afectadas_estimadas: personasEstimadas,
          pacientes_afectados_estimados: pacientesEstimados,
          departamento_predicho: null,
          costo_estimado: costoEstimado,
          tiempo_atencion_perdido_horas: tiempoAtencionPerdido,
          personal_necesario: personalNecesario,
          horas_hombre_estimadas: Math.round(horasEstimadas),
          metadatos: JSON.stringify({
            total_historico: total,
            promedio_calculado: promedio,
            tiempo_promedio_horas: historico[0].tiempo_promedio || null,
            algoritmo: 'promedio_movil_simple',
            costo_por_hora: costoPorHora
          })
        });
      }
    }

    // 2. Predicciones por área/departamento
    const [areas] = await pool.execute(
      'SELECT id, codigo, nombre FROM areas WHERE activo = TRUE'
    );

    for (const area of areas) {
      const mes = inicioPeriodo.getMonth();
      const anio = inicioPeriodo.getFullYear();
      
      let queryHistorico = `
        SELECT 
          COUNT(*) as total,
          AVG(personas_afectadas) as personas_promedio,
          AVG(pacientes_afectados) as pacientes_promedio
        FROM incidencias
        WHERE area_id = ?
          AND estado IN ('resuelta', 'cerrada')
      `;

      const params = [area.id];

      if (periodo === 'mensual') {
        queryHistorico += ` AND MONTH(fecha_creacion) = ? AND YEAR(fecha_creacion) < ?`;
        params.push(mes + 1, anio);
      } else if (periodo === 'trimestral') {
        const trimestre = Math.floor(mes / 3);
        queryHistorico += ` AND QUARTER(fecha_creacion) = ? AND YEAR(fecha_creacion) < ?`;
        params.push(trimestre + 1, anio);
      } else {
        queryHistorico += ` AND YEAR(fecha_creacion) < ?`;
        params.push(anio);
      }

      const [historico] = await pool.execute(queryHistorico, params);

      if (historico.length > 0 && historico[0].total > 0) {
        const total = parseInt(historico[0].total) || 0;
        const promedio = total / aniosHistoricos;
        const probabilidad = Math.min(100, Math.max(0, (promedio / 5) * 100));
        
        const personasEstimadas = Math.round((historico[0].personas_promedio || 5) * promedio);
        const pacientesEstimados = Math.round((historico[0].pacientes_promedio || 3) * promedio);

        // Calcular métricas adicionales para área
        const costoPorHoraArea = 100; // Promedio general
        const horasEstimadasArea = 8 * promedio; // Estimación conservadora
        const costoEstimadoArea = Math.round(horasEstimadasArea * costoPorHoraArea);
        const tiempoAtencionPerdidoArea = Math.round(8 * promedio * pacientesEstimados);
        const personalNecesarioArea = Math.ceil(promedio / 5);

        predicciones.push({
          tipo_incidencia_id: null,
          area_id: area.id,
          area_nombre: area.nombre,
          periodo,
          fecha_periodo_inicio: inicioPeriodo.toISOString().split('T')[0],
          fecha_periodo_fin: finPeriodo.toISOString().split('T')[0],
          probabilidad: Math.round(probabilidad * 100) / 100,
          personas_afectadas_estimadas: personasEstimadas,
          pacientes_afectados_estimados: pacientesEstimados,
          departamento_predicho: area.nombre,
          costo_estimado: costoEstimadoArea,
          tiempo_atencion_perdido_horas: tiempoAtencionPerdidoArea,
          personal_necesario: personalNecesarioArea,
          horas_hombre_estimadas: Math.round(horasEstimadasArea),
          metadatos: JSON.stringify({
            total_historico: total,
            promedio_calculado: promedio,
            algoritmo: 'promedio_movil_simple',
            costo_por_hora: costoPorHoraArea
          })
        });
      }
    }

    // 3. Predicción general (más probable)
    const [general] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        AVG(personas_afectadas) as personas_promedio,
        AVG(pacientes_afectados) as pacientes_promedio
      FROM incidencias
      WHERE estado IN ('resuelta', 'cerrada')
        AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? YEAR)
    `, [aniosHistoricos]);

    if (general.length > 0 && general[0].total > 0) {
      const total = parseInt(general[0].total);
      const promedio = total / (aniosHistoricos * 12); // Promedio mensual
      const probabilidad = Math.min(100, Math.max(0, (promedio / 20) * 100));
      
      const personasEstimadas = Math.round((general[0].personas_promedio || 5) * promedio);
      const pacientesEstimados = Math.round((general[0].pacientes_promedio || 3) * promedio);

      // Encontrar el tipo más común
      const [tipoMasComun] = await pool.execute(`
        SELECT tipo_incidencia_id, COUNT(*) as total
        FROM incidencias
        WHERE estado IN ('resuelta', 'cerrada')
          AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? YEAR)
        GROUP BY tipo_incidencia_id
        ORDER BY total DESC
        LIMIT 1
      `, [aniosHistoricos]);

      // Calcular métricas generales
      const costoPorHoraGeneral = 100;
      const horasEstimadasGeneral = 8 * promedio;
      const costoEstimadoGeneral = Math.round(horasEstimadasGeneral * costoPorHoraGeneral);
      const tiempoAtencionPerdidoGeneral = Math.round(8 * promedio * pacientesEstimados);
      const personalNecesarioGeneral = Math.ceil(promedio / 5);

      predicciones.push({
        tipo_incidencia_id: tipoMasComun.length > 0 ? tipoMasComun[0].tipo_incidencia_id : null,
        area_id: null,
        periodo,
        fecha_periodo_inicio: inicioPeriodo.toISOString().split('T')[0],
        fecha_periodo_fin: finPeriodo.toISOString().split('T')[0],
        probabilidad: Math.round(probabilidad * 100) / 100,
        personas_afectadas_estimadas: personasEstimadas,
        pacientes_afectados_estimados: pacientesEstimados,
        departamento_predicho: 'General',
        costo_estimado: costoEstimadoGeneral,
        tiempo_atencion_perdido_horas: tiempoAtencionPerdidoGeneral,
        personal_necesario: personalNecesarioGeneral,
        horas_hombre_estimadas: Math.round(horasEstimadasGeneral),
        metadatos: JSON.stringify({
          total_historico: total,
          promedio_calculado: promedio,
          algoritmo: 'promedio_movil_simple',
          tipo_mas_comun: tipoMasComun.length > 0 ? tipoMasComun[0].tipo_incidencia_id : null,
          costo_por_hora: costoPorHoraGeneral
        })
      });
    }

    return predicciones;
  } catch (error) {
    console.error('Error al calcular predicciones:', error);
    throw error;
  }
};

/**
 * Guarda predicciones en la base de datos
 * @param {Array} predicciones - Array de predicciones a guardar
 * @returns {Promise<Array>} IDs de las predicciones guardadas
 */
export const guardarPredicciones = async (predicciones) => {
  try {
    const ids = [];
    
    for (const pred of predicciones) {
      // Actualizar metadatos para incluir las nuevas métricas
      const metadatosCompletos = {
        ...(pred.metadatos ? JSON.parse(pred.metadatos) : {}),
        costo_estimado: pred.costo_estimado || null,
        tiempo_atencion_perdido_horas: pred.tiempo_atencion_perdido_horas || null,
        personal_necesario: pred.personal_necesario || null,
        horas_hombre_estimadas: pred.horas_hombre_estimadas || null,
      };

      const [result] = await pool.execute(
        `INSERT INTO predicciones_incidencias 
         (tipo_incidencia_id, area_id, periodo, fecha_prediccion, fecha_periodo_inicio, 
          fecha_periodo_fin, probabilidad, personas_afectadas_estimadas, 
          pacientes_afectados_estimados, departamento_predicho, metadatos)
         VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)`,
        [
          pred.tipo_incidencia_id || null,
          pred.area_id || null,
          pred.periodo,
          pred.fecha_periodo_inicio,
          pred.fecha_periodo_fin,
          pred.probabilidad,
          pred.personas_afectadas_estimadas || null,
          pred.pacientes_afectados_estimados || null,
          pred.departamento_predicho || null,
          JSON.stringify(metadatosCompletos)
        ]
      );
      
      ids.push(result.insertId);
    }
    
    return ids;
  } catch (error) {
    console.error('Error al guardar predicciones:', error);
    throw error;
  }
};

/**
 * Obtiene predicciones guardadas
 * @param {string} periodo - 'mensual', 'trimestral' o 'anual'
 * @param {Date} fechaInicio - Fecha de inicio del período
 * @returns {Promise<Array>} Predicciones guardadas
 */
export const obtenerPrediccionesGuardadas = async (periodo, fechaInicio = null) => {
  try {
    let query = `
      SELECT p.*, 
             t.nombre as tipo_incidencia_nombre,
             a.nombre as area_nombre
      FROM predicciones_incidencias p
      LEFT JOIN tipos_incidencias t ON p.tipo_incidencia_id = t.id
      LEFT JOIN areas a ON p.area_id = a.id
      WHERE p.periodo = ?
    `;
    
    const params = [periodo];
    
    if (fechaInicio) {
      query += ` AND p.fecha_periodo_inicio = ?`;
      params.push(fechaInicio.toISOString().split('T')[0]);
    }
    
    query += ` ORDER BY p.probabilidad DESC, p.fecha_creacion DESC`;
    
    const [predicciones] = await pool.execute(query, params);
    
    return predicciones.map(p => ({
      ...p,
      metadatos: p.metadatos ? JSON.parse(p.metadatos) : null
    }));
  } catch (error) {
    console.error('Error al obtener predicciones:', error);
    throw error;
  }
};

