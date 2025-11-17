import { pool } from '../db.js';

export const getAreas = async (req, res) => {
  try {
    const [areas] = await pool.execute(
      'SELECT id, codigo, nombre FROM areas WHERE activo = TRUE ORDER BY nombre'
    );
    
    res.json({
      status: 'success',
      data: areas
    });
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener áreas'
    });
  }
};

export const getServicios = async (req, res) => {
  try {
    const { area_id } = req.query;
    
    let query = 'SELECT id, nombre, descripcion FROM servicios WHERE activo = TRUE';
    let params = [];
    
    if (area_id) {
      query += ' AND area_id = ?';
      params.push(area_id);
    }
    
    query += ' ORDER BY nombre';
    
    const [servicios] = await pool.execute(query, params);
    
    res.json({
      status: 'success',
      data: servicios
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener servicios'
    });
  }
};

export const getTipos = async (req, res) => {
  try {
    const [tipos] = await pool.execute(
      'SELECT id, nombre, categoria, color, icono FROM tipos_incidencias WHERE activo = TRUE ORDER BY nombre'
    );
    
    res.json({
      status: 'success',
      data: tipos
    });
  } catch (error) {
    console.error('Error al obtener tipos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener tipos de incidencias'
    });
  }
};

export const getSubtipos = async (req, res) => {
  try {
    const { tipo_id } = req.query;
    
    let query = 'SELECT id, nombre, descripcion FROM subtipos_incidencias WHERE activo = TRUE';
    let params = [];
    
    if (tipo_id) {
      query += ' AND tipo_incidencia_id = ?';
      params.push(tipo_id);
    }
    
    query += ' ORDER BY nombre';
    
    const [subtipos] = await pool.execute(query, params);
    
    res.json({
      status: 'success',
      data: subtipos
    });
  } catch (error) {
    console.error('Error al obtener subtipos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener subtipos'
    });
  }
};

export const getPrioridades = async (req, res) => {
  try {
    const [prioridades] = await pool.execute(
      'SELECT id, nivel, nombre, color, tiempo_respuesta_minutos, tiempo_resolucion_horas FROM prioridades WHERE activo = TRUE ORDER BY nivel'
    );
    
    res.json({
      status: 'success',
      data: prioridades
    });
  } catch (error) {
    console.error('Error al obtener prioridades:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener prioridades'
    });
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const { area_id, rol } = req.query;
    
    let query = `SELECT u.id, u.nombre, u.email, u.rol, 
                        a.id as area_id, a.codigo as area_codigo, a.nombre as area_nombre
                 FROM usuarios u
                 LEFT JOIN areas a ON u.area_id = a.id
                 WHERE u.activo = TRUE`;
    let params = [];
    
    if (area_id) {
      query += ' AND u.area_id = ?';
      params.push(area_id);
    }
    
    if (rol) {
      query += ' AND u.rol = ?';
      params.push(rol);
    }
    
    query += ' ORDER BY u.nombre';
    
    const [usuarios] = await pool.execute(query, params);
    
    const usuariosFormateados = usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      area: u.area_id ? {
        id: u.area_id,
        codigo: u.area_codigo,
        nombre: u.area_nombre
      } : null
    }));
    
    res.json({
      status: 'success',
      data: usuariosFormateados
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener usuarios'
    });
  }
};

