import { pool } from '../db.js';

// Listar tipos de incidencias
export const listarTipos = async (req, res) => {
  try {
    const { activo, categoria } = req.query;
    
    let query = `
      SELECT t.*, 
             (SELECT COUNT(*) FROM subtipos_incidencias WHERE tipo_incidencia_id = t.id AND activo = TRUE) as subtipos_count
      FROM tipos_incidencias t
      WHERE 1=1
    `;
    const params = [];
    
    if (activo !== undefined) {
      query += ' AND t.activo = ?';
      params.push(activo === 'true' || activo === true);
    }
    
    if (categoria) {
      query += ' AND t.categoria = ?';
      params.push(categoria);
    }
    
    query += ' ORDER BY t.nombre';
    
    const [tipos] = await pool.execute(query, params);
    
    const tiposFormateados = tipos.map(t => ({
      ...t,
      subtipos: t.subtipos_count || 0
    }));
    
    res.json({
      status: 'success',
      data: tiposFormateados
    });
  } catch (error) {
    console.error('Error al listar tipos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener tipos'
    });
  }
};

// Obtener tipo por ID
export const obtenerTipo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tipos] = await pool.execute(
      'SELECT * FROM tipos_incidencias WHERE id = ?',
      [id]
    );
    
    if (tipos.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tipo no encontrado'
      });
    }
    
    res.json({
      status: 'success',
      data: tipos[0]
    });
  } catch (error) {
    console.error('Error al obtener tipo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener tipo'
    });
  }
};

// Crear tipo
export const crearTipo = async (req, res) => {
  try {
    const { nombre, categoria, color, icono } = req.body;
    
    if (!nombre || !categoria || !color || !icono) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos: nombre, categoria, color, icono'
      });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO tipos_incidencias (nombre, categoria, color, icono, activo)
       VALUES (?, ?, ?, ?, TRUE)`,
      [nombre, categoria, color, icono]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Tipo creado exitosamente',
      data: {
        id: result.insertId,
        nombre
      }
    });
  } catch (error) {
    console.error('Error al crear tipo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear tipo'
    });
  }
};

// Actualizar tipo
export const actualizarTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, color, icono, activo } = req.body;
    
    const [tipos] = await pool.execute('SELECT id FROM tipos_incidencias WHERE id = ?', [id]);
    if (tipos.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tipo no encontrado'
      });
    }
    
    const campos = [];
    const valores = [];
    
    if (nombre) campos.push('nombre = ?'), valores.push(nombre);
    if (categoria) campos.push('categoria = ?'), valores.push(categoria);
    if (color) campos.push('color = ?'), valores.push(color);
    if (icono) campos.push('icono = ?'), valores.push(icono);
    if (activo !== undefined) {
      campos.push('activo = ?');
      valores.push(activo);
    }
    
    if (campos.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No hay campos para actualizar'
      });
    }
    
    valores.push(id);
    
    await pool.execute(
      `UPDATE tipos_incidencias SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
    
    res.json({
      status: 'success',
      message: 'Tipo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar tipo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar tipo'
    });
  }
};

// Eliminar tipo (soft delete)
export const eliminarTipo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tipos] = await pool.execute('SELECT id FROM tipos_incidencias WHERE id = ?', [id]);
    if (tipos.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tipo no encontrado'
      });
    }
    
    await pool.execute('UPDATE tipos_incidencias SET activo = FALSE WHERE id = ?', [id]);
    
    res.json({
      status: 'success',
      message: 'Tipo desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tipo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar tipo'
    });
  }
};

