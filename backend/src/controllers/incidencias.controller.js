import { pool } from '../db.js';
import { generarCodigoIncidencia } from '../utils/codigoIncidencia.js';
import { registrarHistorial } from '../utils/historial.js';
import { crearNotificacion, notificarAsignacion, notificarCambioEstado } from '../utils/notificaciones.js';

// Obtener todas las incidencias con filtros
export const listarIncidencias = async (req, res) => {
  try {
    const { area_id, estado, prioridad_id, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        i.id, i.codigo, i.titulo, i.descripcion, i.estado,
        i.piso, i.habitacion, i.cama, i.equipo, i.paciente_id,
        i.fecha_creacion, i.fecha_actualizacion, i.fecha_vencimiento,
        i.fecha_resolucion, i.fecha_cierre,
        a.id as area_id, a.codigo as area_codigo, a.nombre as area_nombre,
        s.id as servicio_id, s.nombre as servicio_nombre,
        t.id as tipo_id, t.nombre as tipo_nombre, t.categoria as tipo_categoria,
        st.id as subtipo_id, st.nombre as subtipo_nombre,
        p.id as prioridad_id, p.nivel as prioridad_nivel, p.nombre as prioridad_nombre, p.color as prioridad_color,
        rp.id as reportado_por_id, rp.nombre as reportado_por_nombre, rp.email as reportado_por_email,
        resp.id as responsable_id, resp.nombre as responsable_nombre, resp.email as responsable_email
      FROM incidencias i
      LEFT JOIN areas a ON i.area_id = a.id
      LEFT JOIN servicios s ON i.servicio_id = s.id
      LEFT JOIN tipos_incidencias t ON i.tipo_incidencia_id = t.id
      LEFT JOIN subtipos_incidencias st ON i.subtipo_incidencia_id = st.id
      LEFT JOIN prioridades p ON i.prioridad_id = p.id
      LEFT JOIN usuarios rp ON i.reportado_por_id = rp.id
      LEFT JOIN usuarios resp ON i.responsable_id = resp.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (area_id) {
      query += ' AND i.area_id = ?';
      params.push(area_id);
    }
    
    if (estado) {
      query += ' AND i.estado = ?';
      params.push(estado);
    }
    
    if (prioridad_id) {
      query += ' AND i.prioridad_id = ?';
      params.push(prioridad_id);
    }
    
    if (search) {
      query += ' AND (i.codigo LIKE ? OR i.titulo LIKE ? OR i.descripcion LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // LIMIT y OFFSET no pueden ser placeholders en MySQL, deben ser valores directos
    const limitNum = parseInt(limit) || 50;
    const offsetNum = parseInt(offset) || 0;
    
    // Validar que sean números válidos y positivos
    const safeLimit = Math.max(1, Math.min(limitNum, 1000)); // Máximo 1000
    const safeOffset = Math.max(0, offsetNum);
    
    query += ` ORDER BY i.fecha_creacion DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    
    const [incidencias] = await pool.execute(query, params);
    
    // Formatear resultados
    const incidenciasFormateadas = incidencias.map(inc => ({
      id: inc.id,
      codigo: inc.codigo,
      titulo: inc.titulo,
      descripcion: inc.descripcion,
      estado: inc.estado,
      area: inc.area_id ? {
        id: inc.area_id,
        codigo: inc.area_codigo,
        nombre: inc.area_nombre
      } : null,
      servicio: inc.servicio_id ? {
        id: inc.servicio_id,
        nombre: inc.servicio_nombre
      } : null,
      tipo: inc.tipo_id ? {
        id: inc.tipo_id,
        nombre: inc.tipo_nombre,
        categoria: inc.tipo_categoria
      } : null,
      subtipo: inc.subtipo_id ? {
        id: inc.subtipo_id,
        nombre: inc.subtipo_nombre
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
      } : null,
      responsable: inc.responsable_id ? {
        id: inc.responsable_id,
        nombre: inc.responsable_nombre,
        email: inc.responsable_email
      } : null,
      ubicacion: {
        piso: inc.piso,
        habitacion: inc.habitacion,
        cama: inc.cama,
        equipo: inc.equipo
      },
      pacienteId: inc.paciente_id,
      fechas: {
        creacion: inc.fecha_creacion,
        actualizacion: inc.fecha_actualizacion,
        vencimiento: inc.fecha_vencimiento,
        resolucion: inc.fecha_resolucion,
        cierre: inc.fecha_cierre
      }
    }));
    
    res.json({
      status: 'success',
      data: incidenciasFormateadas
    });
  } catch (error) {
    console.error('Error al listar incidencias:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener incidencias',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener detalle de una incidencia
export const obtenerIncidencia = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    const [incidencias] = await pool.execute(
      `SELECT 
        i.*,
        a.id as area_id, a.codigo as area_codigo, a.nombre as area_nombre,
        s.id as servicio_id, s.nombre as servicio_nombre,
        t.id as tipo_id, t.nombre as tipo_nombre, t.categoria as tipo_categoria, t.color as tipo_color, t.icono as tipo_icono,
        st.id as subtipo_id, st.nombre as subtipo_nombre,
        p.id as prioridad_id, p.nivel as prioridad_nivel, p.nombre as prioridad_nombre, p.color as prioridad_color,
        p.tiempo_respuesta_minutos, p.tiempo_resolucion_horas,
        rp.id as reportado_por_id, rp.nombre as reportado_por_nombre, rp.email as reportado_por_email,
        resp.id as responsable_id, resp.nombre as responsable_nombre, resp.email as responsable_email
      FROM incidencias i
      LEFT JOIN areas a ON i.area_id = a.id
      LEFT JOIN servicios s ON i.servicio_id = s.id
      LEFT JOIN tipos_incidencias t ON i.tipo_incidencia_id = t.id
      LEFT JOIN subtipos_incidencias st ON i.subtipo_incidencia_id = st.id
      LEFT JOIN prioridades p ON i.prioridad_id = p.id
      LEFT JOIN usuarios rp ON i.reportado_por_id = rp.id
      LEFT JOIN usuarios resp ON i.responsable_id = resp.id
      WHERE i.codigo = ?`,
      [codigo]
    );
    
    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }
    
    const inc = incidencias[0];
    
    const incidencia = {
      id: inc.id,
      codigo: inc.codigo,
      titulo: inc.titulo,
      descripcion: inc.descripcion,
      estado: inc.estado,
      area: inc.area_id ? {
        id: inc.area_id,
        codigo: inc.area_codigo,
        nombre: inc.area_nombre
      } : null,
      servicio: inc.servicio_id ? {
        id: inc.servicio_id,
        nombre: inc.servicio_nombre
      } : null,
      tipo: inc.tipo_id ? {
        id: inc.tipo_id,
        nombre: inc.tipo_nombre,
        categoria: inc.tipo_categoria,
        color: inc.tipo_color,
        icono: inc.tipo_icono
      } : null,
      subtipo: inc.subtipo_id ? {
        id: inc.subtipo_id,
        nombre: inc.subtipo_nombre
      } : null,
      prioridad: inc.prioridad_id ? {
        id: inc.prioridad_id,
        nivel: inc.prioridad_nivel,
        nombre: inc.prioridad_nombre,
        color: inc.prioridad_color,
        tiempoRespuestaMinutos: inc.tiempo_respuesta_minutos,
        tiempoResolucionHoras: inc.tiempo_resolucion_horas
      } : null,
      reportadoPor: inc.reportado_por_id ? {
        id: inc.reportado_por_id,
        nombre: inc.reportado_por_nombre,
        email: inc.reportado_por_email
      } : null,
      responsable: inc.responsable_id ? {
        id: inc.responsable_id,
        nombre: inc.responsable_nombre,
        email: inc.responsable_email
      } : null,
      ubicacion: {
        piso: inc.piso,
        habitacion: inc.habitacion,
        cama: inc.cama,
        equipo: inc.equipo
      },
      pacienteId: inc.paciente_id,
      fechas: {
        creacion: inc.fecha_creacion,
        actualizacion: inc.fecha_actualizacion,
        vencimiento: inc.fecha_vencimiento,
        resolucion: inc.fecha_resolucion,
        cierre: inc.fecha_cierre
      }
    };

    // Obtener resolución si existe
    const [resoluciones] = await pool.execute(
      `SELECT r.*, 
              u.id as resuelto_por_id, u.nombre as resuelto_por_nombre, u.email as resuelto_por_email,
              v.id as validado_por_id, v.nombre as validado_por_nombre, v.email as validado_por_email
       FROM resoluciones_incidencias r
       INNER JOIN usuarios u ON r.resuelto_por_id = u.id
       LEFT JOIN usuarios v ON r.validado_por_id = v.id
       WHERE r.incidencia_id = ?
       ORDER BY r.fecha_creacion DESC
       LIMIT 1`,
      [inc.id]
    );

    if (resoluciones.length > 0) {
      const res = resoluciones[0];
      incidencia.resolucion = {
        id: res.id,
        solucion_aplicada: res.solucion_aplicada,
        pasos_seguidos: res.pasos_seguidos,
        recursos_utilizados: res.recursos_utilizados,
        tiempo_invertido_minutos: res.tiempo_invertido_minutos,
        fecha_resolucion: res.fecha_resolucion,
        resuelto_por: {
          id: res.resuelto_por_id,
          nombre: res.resuelto_por_nombre,
          email: res.resuelto_por_email
        },
        validado_por: res.validado_por_id ? {
          id: res.validado_por_id,
          nombre: res.validado_por_nombre,
          email: res.validado_por_email
        } : null,
        fecha_validacion: res.fecha_validacion
      };
    }
    
    res.json({
      status: 'success',
      data: incidencia
    });
  } catch (error) {
    console.error('Error al obtener incidencia:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener incidencia'
    });
  }
};

// Crear nueva incidencia
export const crearIncidencia = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      titulo,
      descripcion,
      area_id,
      servicio_id,
      tipo_incidencia_id,
      subtipo_incidencia_id,
      prioridad_id,
      responsable_id,
      piso,
      habitacion,
      cama,
      equipo,
      paciente_id
    } = req.body;
    
    // Validaciones básicas
    if (!titulo || !descripcion || !area_id || !tipo_incidencia_id || !prioridad_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos: titulo, descripcion, area_id, tipo_incidencia_id, prioridad_id'
      });
    }
    
    // Generar código único
    const codigo = await generarCodigoIncidencia();
    
    // Obtener información de la prioridad para calcular fecha de vencimiento
    const [prioridades] = await pool.execute(
      'SELECT tiempo_resolucion_horas FROM prioridades WHERE id = ?',
      [prioridad_id]
    );
    
    let fechaVencimiento = null;
    if (prioridades.length > 0) {
      const horas = prioridades[0].tiempo_resolucion_horas;
      fechaVencimiento = new Date();
      fechaVencimiento.setHours(fechaVencimiento.getHours() + horas);
    }
    
    // Insertar incidencia
    const [result] = await pool.execute(
      `INSERT INTO incidencias 
       (codigo, titulo, descripcion, area_id, servicio_id, tipo_incidencia_id, 
        subtipo_incidencia_id, prioridad_id, reportado_por_id, responsable_id,
        piso, habitacion, cama, equipo, paciente_id, fecha_vencimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo, titulo, descripcion, area_id, servicio_id || null,
        tipo_incidencia_id, subtipo_incidencia_id || null, prioridad_id,
        userId, responsable_id || null,
        piso || null, habitacion || null, cama || null, equipo || null,
        paciente_id || null, fechaVencimiento
      ]
    );
    
    const incidenciaId = result.insertId;
    
    // Registrar en historial
    await registrarHistorial(
      incidenciaId,
      'creacion',
      userId,
      `Incidencia creada: ${titulo}`
    );
    
    // Notificar al responsable si fue asignado
    if (responsable_id) {
      const [usuarios] = await pool.execute('SELECT nombre FROM usuarios WHERE id = ?', [userId]);
      const nombreUsuario = usuarios[0]?.nombre || 'Usuario';
      
      await notificarAsignacion(responsable_id, codigo, titulo, incidenciaId);
      
      await registrarHistorial(
        incidenciaId,
        'asignacion',
        userId,
        `Incidencia asignada a responsable`,
        null,
        null
      );
    }
    
    // Obtener la incidencia creada
    const [incidencias] = await pool.execute(
      `SELECT i.*, a.nombre as area_nombre, t.nombre as tipo_nombre, p.nombre as prioridad_nombre
       FROM incidencias i
       LEFT JOIN areas a ON i.area_id = a.id
       LEFT JOIN tipos_incidencias t ON i.tipo_incidencia_id = t.id
       LEFT JOIN prioridades p ON i.prioridad_id = p.id
       WHERE i.id = ?`,
      [incidenciaId]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Incidencia creada exitosamente',
      data: {
        id: incidencias[0].id,
        codigo: incidencias[0].codigo,
        titulo: incidencias[0].titulo
      }
    });
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear incidencia'
    });
  }
};

// Actualizar incidencia
export const actualizarIncidencia = async (req, res) => {
  try {
    const { codigo } = req.params;
    const userId = req.user.id;
    const camposPermitidos = [
      'titulo', 'descripcion', 'area_id', 'servicio_id', 'tipo_incidencia_id',
      'subtipo_incidencia_id', 'piso', 'habitacion', 'cama', 'equipo', 'paciente_id'
    ];
    
    const camposActualizar = {};
    Object.keys(req.body).forEach(key => {
      if (camposPermitidos.includes(key) && req.body[key] !== undefined) {
        camposActualizar[key] = req.body[key];
      }
    });
    
    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No hay campos para actualizar'
      });
    }
    
    // Obtener incidencia actual
    const [incidencias] = await pool.execute(
      'SELECT id FROM incidencias WHERE codigo = ?',
      [codigo]
    );
    
    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }
    
    const incidenciaId = incidencias[0].id;
    
    // Construir query de actualización
    const setClause = Object.keys(camposActualizar).map(key => `${key} = ?`).join(', ');
    const valores = Object.values(camposActualizar);
    valores.push(codigo);
    
    await pool.execute(
      `UPDATE incidencias SET ${setClause}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE codigo = ?`,
      valores
    );
    
    // Registrar en historial
    await registrarHistorial(
      incidenciaId,
      'estado',
      userId,
      `Incidencia actualizada: ${Object.keys(camposActualizar).join(', ')}`
    );
    
    res.json({
      status: 'success',
      message: 'Incidencia actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar incidencia:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar incidencia'
    });
  }
};

// Cambiar estado de incidencia
export const cambiarEstado = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { estado } = req.body;
    const userId = req.user.id;
    
    const estadosValidos = ['abierta', 'en_progreso', 'resuelta', 'cerrada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        status: 'error',
        message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
      });
    }
    
    // Obtener incidencia actual
    const [incidencias] = await pool.execute(
      'SELECT id, estado, responsable_id FROM incidencias WHERE codigo = ?',
      [codigo]
    );
    
    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }
    
    const incidencia = incidencias[0];
    const estadoAnterior = incidencia.estado;
    
    if (estadoAnterior === estado) {
      return res.json({
        status: 'success',
        message: 'El estado ya es el mismo'
      });
    }
    
    // Actualizar estado
    const camposActualizar = { estado };
    if (estado === 'resuelta' && !incidencia.fecha_resolucion) {
      camposActualizar.fecha_resolucion = new Date();
    }
    if (estado === 'cerrada' && !incidencia.fecha_cierre) {
      camposActualizar.fecha_cierre = new Date();
    }
    
    const setClause = Object.keys(camposActualizar).map(key => `${key} = ?`).join(', ');
    const valores = Object.values(camposActualizar);
    valores.push(codigo);
    
    await pool.execute(
      `UPDATE incidencias SET ${setClause}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE codigo = ?`,
      valores
    );
    
    // Registrar en historial
    await registrarHistorial(
      incidencia.id,
      'estado',
      userId,
      `Estado cambiado de "${estadoAnterior}" a "${estado}"`,
      estadoAnterior,
      estado
    );
    
    // Notificar al responsable y al que reportó
    const usuariosNotificar = [];
    if (incidencia.responsable_id) usuariosNotificar.push(incidencia.responsable_id);
    
    // Obtener el que reportó
    const [reportadores] = await pool.execute(
      'SELECT reportado_por_id FROM incidencias WHERE id = ?',
      [incidencia.id]
    );
    if (reportadores.length > 0 && reportadores[0].reportado_por_id) {
      usuariosNotificar.push(reportadores[0].reportado_por_id);
    }
    
    for (const usuarioId of usuariosNotificar) {
      await notificarCambioEstado(usuarioId, codigo, estadoAnterior, estado, incidencia.id);
    }
    
    res.json({
      status: 'success',
      message: 'Estado actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cambiar estado'
    });
  }
};

// Cambiar prioridad
export const cambiarPrioridad = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { prioridad_id } = req.body;
    const userId = req.user.id;
    
    if (!prioridad_id) {
      return res.status(400).json({
        status: 'error',
        message: 'prioridad_id es requerido'
      });
    }
    
    // Verificar que la prioridad existe
    const [prioridades] = await pool.execute(
      'SELECT id, nombre, tiempo_resolucion_horas FROM prioridades WHERE id = ?',
      [prioridad_id]
    );
    
    if (prioridades.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Prioridad no encontrada'
      });
    }
    
    // Obtener incidencia
    const [incidencias] = await pool.execute(
      'SELECT id, prioridad_id FROM incidencias WHERE codigo = ?',
      [codigo]
    );
    
    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }
    
    const incidencia = incidencias[0];
    
    if (incidencia.prioridad_id === parseInt(prioridad_id)) {
      return res.json({
        status: 'success',
        message: 'La prioridad ya es la misma'
      });
    }
    
    // Calcular nueva fecha de vencimiento
    const horas = prioridades[0].tiempo_resolucion_horas;
    const fechaVencimiento = new Date();
    fechaVencimiento.setHours(fechaVencimiento.getHours() + horas);
    
    // Actualizar
    await pool.execute(
      `UPDATE incidencias 
       SET prioridad_id = ?, fecha_vencimiento = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
       WHERE codigo = ?`,
      [prioridad_id, fechaVencimiento, codigo]
    );
    
    // Registrar en historial
    await registrarHistorial(
      incidencia.id,
      'prioridad',
      userId,
      `Prioridad cambiada`,
      null,
      prioridades[0].nombre
    );
    
    res.json({
      status: 'success',
      message: 'Prioridad actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar prioridad:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cambiar prioridad'
    });
  }
};

// Reasignar responsable
export const reasignar = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { responsable_id } = req.body;
    const userId = req.user.id;
    
    if (!responsable_id) {
      return res.status(400).json({
        status: 'error',
        message: 'responsable_id es requerido'
      });
    }
    
    // Verificar que el usuario existe
    const [usuarios] = await pool.execute(
      'SELECT id, nombre FROM usuarios WHERE id = ? AND activo = TRUE',
      [responsable_id]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario responsable no encontrado'
      });
    }
    
    // Obtener incidencia
    const [incidencias] = await pool.execute(
      'SELECT id, responsable_id, titulo FROM incidencias WHERE codigo = ?',
      [codigo]
    );
    
    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }
    
    const incidencia = incidencias[0];
    const responsableAnterior = incidencia.responsable_id;
    
    if (responsableAnterior === parseInt(responsable_id)) {
      return res.json({
        status: 'success',
        message: 'El responsable ya es el mismo'
      });
    }
    
    // Actualizar
    await pool.execute(
      `UPDATE incidencias 
       SET responsable_id = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
       WHERE codigo = ?`,
      [responsable_id, codigo]
    );
    
    // Registrar en historial
    await registrarHistorial(
      incidencia.id,
      'reasignacion',
      userId,
      `Incidencia reasignada a ${usuarios[0].nombre}`,
      null,
      null
    );
    
    // Notificar al nuevo responsable
    await notificarAsignacion(responsable_id, codigo, incidencia.titulo, incidencia.id);
    
    res.json({
      status: 'success',
      message: 'Incidencia reasignada exitosamente'
    });
  } catch (error) {
    console.error('Error al reasignar:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al reasignar incidencia'
    });
  }
};

// Mis incidencias (creadas por el usuario o asignadas a él)
export const misIncidencias = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tipo = 'todas', area_id, estado, prioridad_id, search } = req.query;
    
    let query = `
      SELECT 
        i.id, i.codigo, i.titulo, i.descripcion, i.estado,
        i.fecha_creacion, i.fecha_actualizacion,
        a.id as area_id, a.nombre as area_nombre,
        t.nombre as tipo_nombre,
        p.nombre as prioridad_nombre, p.color as prioridad_color,
        rp.id as reportado_por_id, rp.nombre as reportado_por_nombre,
        resp.id as responsable_id, resp.nombre as responsable_nombre
      FROM incidencias i
      LEFT JOIN areas a ON i.area_id = a.id
      LEFT JOIN tipos_incidencias t ON i.tipo_incidencia_id = t.id
      LEFT JOIN prioridades p ON i.prioridad_id = p.id
      LEFT JOIN usuarios rp ON i.reportado_por_id = rp.id
      LEFT JOIN usuarios resp ON i.responsable_id = resp.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtrar por tipo: creadas, asignadas, o todas
    if (tipo === 'creadas') {
      query += ' AND i.reportado_por_id = ?';
      params.push(userId);
    } else if (tipo === 'asignadas') {
      query += ' AND i.responsable_id = ?';
      params.push(userId);
    } else {
      // Todas: creadas O asignadas
      query += ' AND (i.reportado_por_id = ? OR i.responsable_id = ?)';
      params.push(userId, userId);
    }
    
    if (area_id) {
      query += ' AND i.area_id = ?';
      params.push(area_id);
    }
    
    if (estado) {
      query += ' AND i.estado = ?';
      params.push(estado);
    }
    
    if (prioridad_id) {
      query += ' AND i.prioridad_id = ?';
      params.push(prioridad_id);
    }
    
    if (search) {
      query += ' AND (i.codigo LIKE ? OR i.titulo LIKE ? OR i.descripcion LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY i.fecha_creacion DESC';
    
    const [incidencias] = await pool.execute(query, params);
    
    const incidenciasFormateadas = incidencias.map(inc => ({
      id: inc.id,
      codigo: inc.codigo,
      titulo: inc.titulo,
      descripcion: inc.descripcion,
      estado: inc.estado,
      area: inc.area_id ? {
        id: inc.area_id,
        nombre: inc.area_nombre
      } : null,
      tipo: inc.tipo_nombre,
      prioridad: {
        nombre: inc.prioridad_nombre,
        color: inc.prioridad_color
      },
      reportadoPor: inc.reportado_por_id ? {
        id: inc.reportado_por_id,
        nombre: inc.reportado_por_nombre
      } : null,
      responsable: inc.responsable_id ? {
        id: inc.responsable_id,
        nombre: inc.responsable_nombre
      } : null,
      fecha: inc.fecha_creacion
    }));
    
    res.json({
      status: 'success',
      data: incidenciasFormateadas
    });
  } catch (error) {
    console.error('Error al obtener mis incidencias:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener incidencias'
    });
  }
};

// Resolver incidencia con detalles completos
export const resolverIncidencia = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { solucion_aplicada, pasos_seguidos, recursos_utilizados, tiempo_invertido_minutos } = req.body;
    const userId = req.user.id;

    // Validar campos requeridos
    if (!solucion_aplicada || !pasos_seguidos || !tiempo_invertido_minutos) {
      return res.status(400).json({
        status: 'error',
        message: 'Los campos solucion_aplicada, pasos_seguidos y tiempo_invertido_minutos son requeridos'
      });
    }

    // Verificar que la incidencia existe
    const [incidencias] = await pool.execute(
      'SELECT id, estado, responsable_id FROM incidencias WHERE codigo = ?',
      [codigo]
    );

    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }

    const incidencia = incidencias[0];

    // Verificar permisos: solo el responsable o admin TI pueden resolver
    const esResponsable = incidencia.responsable_id === userId;
    const esAdminTI = req.user.rol === 'administrador' && req.user.tipo_admin === 'ti';

    if (!esResponsable && !esAdminTI) {
      return res.status(403).json({
        status: 'error',
        message: 'Solo el responsable asignado o un administrador TI pueden resolver esta incidencia'
      });
    }

    // Verificar que no esté ya resuelta
    if (incidencia.estado === 'resuelta' || incidencia.estado === 'cerrada') {
      return res.status(400).json({
        status: 'error',
        message: 'La incidencia ya está resuelta o cerrada'
      });
    }

    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Guardar resolución
      const [result] = await connection.execute(
        `INSERT INTO resoluciones_incidencias 
         (incidencia_id, solucion_aplicada, pasos_seguidos, recursos_utilizados, 
          tiempo_invertido_minutos, resuelto_por_id, fecha_resolucion)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          incidencia.id,
          solucion_aplicada,
          pasos_seguidos,
          recursos_utilizados || null,
          tiempo_invertido_minutos,
          userId
        ]
      );

      const resolucionId = result.insertId;

      // Actualizar estado de la incidencia
      await connection.execute(
        `UPDATE incidencias 
         SET estado = 'resuelta', 
             fecha_resolucion = NOW(),
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [incidencia.id]
      );

      // Registrar en historial
      await registrarHistorial(
        incidencia.id,
        'resolucion',
        userId,
        `Incidencia resuelta. Solución: ${solucion_aplicada.substring(0, 100)}...`,
        incidencia.estado,
        'resuelta'
      );

      // Commit transacción
      await connection.commit();

      // Obtener resolución completa
      const [resoluciones] = await pool.execute(
        `SELECT r.*, 
                u.id as resuelto_por_id, u.nombre as resuelto_por_nombre, u.email as resuelto_por_email
         FROM resoluciones_incidencias r
         INNER JOIN usuarios u ON r.resuelto_por_id = u.id
         WHERE r.id = ?`,
        [resolucionId]
      );

      res.json({
        status: 'success',
        message: 'Incidencia resuelta exitosamente',
        data: {
          resolucion: {
            id: resoluciones[0].id,
            solucion_aplicada: resoluciones[0].solucion_aplicada,
            pasos_seguidos: resoluciones[0].pasos_seguidos,
            recursos_utilizados: resoluciones[0].recursos_utilizados,
            tiempo_invertido_minutos: resoluciones[0].tiempo_invertido_minutos,
            fecha_resolucion: resoluciones[0].fecha_resolucion,
            resuelto_por: {
              id: resoluciones[0].resuelto_por_id,
              nombre: resoluciones[0].resuelto_por_nombre,
              email: resoluciones[0].resuelto_por_email
            }
          }
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al resolver incidencia:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al resolver incidencia'
    });
  }
};

