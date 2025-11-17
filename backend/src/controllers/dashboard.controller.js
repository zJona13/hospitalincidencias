import { pool } from '../db.js';

// Obtener estadísticas generales
export const obtenerEstadisticas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
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
    
    // Total de incidencias
    const [total] = await pool.execute(
      `SELECT COUNT(*) as total FROM incidencias ${fechaFilter}`,
      params
    );
    
    // Incidencias abiertas
    const abiertasQuery = fechaFilter 
      ? `SELECT COUNT(*) as total FROM incidencias ${fechaFilter} AND estado = 'abierta'`
      : `SELECT COUNT(*) as total FROM incidencias WHERE estado = 'abierta'`;
    const [abiertas] = await pool.execute(abiertasQuery, params);
    
    // Incidencias en progreso
    const enProgresoQuery = fechaFilter 
      ? `SELECT COUNT(*) as total FROM incidencias ${fechaFilter} AND estado = 'en_progreso'`
      : `SELECT COUNT(*) as total FROM incidencias WHERE estado = 'en_progreso'`;
    const [enProgreso] = await pool.execute(enProgresoQuery, params);
    
    // Incidencias resueltas
    const resueltasQuery = fechaFilter 
      ? `SELECT COUNT(*) as total FROM incidencias ${fechaFilter} AND estado = 'resuelta'`
      : `SELECT COUNT(*) as total FROM incidencias WHERE estado = 'resuelta'`;
    const [resueltas] = await pool.execute(resueltasQuery, params);
    
    // Incidencias cerradas
    const cerradasQuery = fechaFilter 
      ? `SELECT COUNT(*) as total FROM incidencias ${fechaFilter} AND estado = 'cerrada'`
      : `SELECT COUNT(*) as total FROM incidencias WHERE estado = 'cerrada'`;
    const [cerradas] = await pool.execute(cerradasQuery, params);
    
    // Calcular tendencia (comparar con período anterior)
    const fechaActual = new Date();
    const fechaAnterior = new Date(fechaActual);
    fechaAnterior.setDate(fechaAnterior.getDate() - 7); // 7 días atrás
    
    const [totalAnterior] = await pool.execute(
      `SELECT COUNT(*) as total FROM incidencias 
       WHERE fecha_creacion BETWEEN ? AND ?`,
      [fechaAnterior.toISOString().split('T')[0], fechaActual.toISOString().split('T')[0]]
    );
    
    const totalActual = total[0].total;
    const totalAnteriorNum = totalAnterior[0].total;
    const tendencia = totalAnteriorNum > 0 
      ? ((totalActual - totalAnteriorNum) / totalAnteriorNum * 100).toFixed(1)
      : '0';
    
    res.json({
      status: 'success',
      data: {
        total: total[0].total,
        abiertas: abiertas[0].total,
        enProgreso: enProgreso[0].total,
        resueltas: resueltas[0].total,
        cerradas: cerradas[0].total,
        tendencia: parseFloat(tendencia)
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener datos de tendencias (para gráfico de barras)
export const obtenerTendencias = async (req, res) => {
  try {
    const { dias = 7 } = req.query;
    
    // Obtener incidencias de los últimos N días
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));
    
    const [resultados] = await pool.execute(
      `SELECT 
        DATE(fecha_creacion) as fecha,
        COUNT(*) as cantidad
       FROM incidencias
       WHERE fecha_creacion >= ?
       GROUP BY DATE(fecha_creacion)
       ORDER BY fecha ASC`,
      [fechaInicio.toISOString().split('T')[0]]
    );
    
    // Formatear para el gráfico
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const datos = resultados.map(r => {
      const fecha = new Date(r.fecha);
      const diaSemana = diasSemana[fecha.getDay()];
      return {
        dia: diaSemana,
        fecha: r.fecha,
        cantidad: r.cantidad
      };
    });
    
    res.json({
      status: 'success',
      data: datos
    });
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener tendencias'
    });
  }
};

// Obtener distribuciones (para gráficos de pastel)
export const obtenerDistribuciones = async (req, res) => {
  try {
    const { tipo = 'tipo' } = req.query; // tipo, prioridad, estado
    
    let query = '';
    let campo = '';
    
    if (tipo === 'tipo') {
      query = `
        SELECT t.nombre, COUNT(*) as cantidad, t.color
        FROM incidencias i
        INNER JOIN tipos_incidencias t ON i.tipo_incidencia_id = t.id
        GROUP BY t.id, t.nombre, t.color
        ORDER BY cantidad DESC
      `;
    } else if (tipo === 'prioridad') {
      query = `
        SELECT p.nombre, COUNT(*) as cantidad, p.color
        FROM incidencias i
        INNER JOIN prioridades p ON i.prioridad_id = p.id
        GROUP BY p.id, p.nombre, p.color
        ORDER BY cantidad DESC
      `;
    } else if (tipo === 'estado') {
      query = `
        SELECT estado as nombre, COUNT(*) as cantidad
        FROM incidencias
        GROUP BY estado
        ORDER BY cantidad DESC
      `;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Tipo de distribución inválido. Debe ser: tipo, prioridad o estado'
      });
    }
    
    const [resultados] = await pool.execute(query);
    
    const datos = resultados.map(r => ({
      name: r.nombre,
      value: r.cantidad,
      color: r.color || null
    }));
    
    res.json({
      status: 'success',
      data: datos
    });
  } catch (error) {
    console.error('Error al obtener distribuciones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener distribuciones'
    });
  }
};

