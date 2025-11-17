import { pool } from '../db.js';

// Listar áreas
export const listarAreas = async (req, res) => {
  try {
    const { activo, search } = req.query;
    
    let query = `
      SELECT a.id, a.codigo, a.nombre, a.activo, a.fecha_creacion,
             u.id as responsable_id, u.nombre as responsable_nombre,
             (SELECT COUNT(*) FROM servicios WHERE area_id = a.id AND activo = TRUE) as servicios_count
      FROM areas a
      LEFT JOIN usuarios u ON a.responsable_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (activo !== undefined) {
      query += ' AND a.activo = ?';
      params.push(activo === 'true' || activo === true);
    }
    
    if (search) {
      query += ' AND (a.nombre LIKE ? OR a.codigo LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY a.nombre';
    
    const [areas] = await pool.execute(query, params);
    
    const areasFormateadas = areas.map(a => ({
      id: a.id,
      codigo: a.codigo,
      nombre: a.nombre,
      activo: a.activo,
      fechaCreacion: a.fecha_creacion,
      responsable: a.responsable_id ? {
        id: a.responsable_id,
        nombre: a.responsable_nombre
      } : null,
      servicios: a.servicios_count
    }));
    
    res.json({
      status: 'success',
      data: areasFormateadas
    });
  } catch (error) {
    console.error('Error al listar áreas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener áreas'
    });
  }
};

// Obtener área por ID
export const obtenerArea = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [areas] = await pool.execute(
      `SELECT a.id, a.codigo, a.nombre, a.activo, a.fecha_creacion,
              u.id as responsable_id, u.nombre as responsable_nombre
       FROM areas a
       LEFT JOIN usuarios u ON a.responsable_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    
    if (areas.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Área no encontrada'
      });
    }
    
    const a = areas[0];
    res.json({
      status: 'success',
      data: {
        id: a.id,
        codigo: a.codigo,
        nombre: a.nombre,
        activo: a.activo,
        fechaCreacion: a.fecha_creacion,
        responsable: a.responsable_id ? {
          id: a.responsable_id,
          nombre: a.responsable_nombre
        } : null
      }
    });
  } catch (error) {
    console.error('Error al obtener área:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener área'
    });
  }
};

// Crear área
export const crearArea = async (req, res) => {
  try {
    const { codigo, nombre, responsable_id } = req.body;
    
    if (!codigo || !nombre) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos: codigo, nombre'
      });
    }
    
    // Verificar que el código no exista
    const [existentes] = await pool.execute(
      'SELECT id FROM areas WHERE codigo = ?',
      [codigo.toUpperCase()]
    );
    
    if (existentes.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El código ya está registrado'
      });
    }
    
    // Insertar área
    const [result] = await pool.execute(
      `INSERT INTO areas (codigo, nombre, responsable_id, activo)
       VALUES (?, ?, ?, TRUE)`,
      [codigo.toUpperCase(), nombre, responsable_id || null]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Área creada exitosamente',
      data: {
        id: result.insertId,
        codigo: codigo.toUpperCase(),
        nombre
      }
    });
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear área'
    });
  }
};

// Actualizar área
export const actualizarArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, responsable_id, activo } = req.body;
    
    // Verificar que el área existe
    const [areas] = await pool.execute('SELECT id FROM areas WHERE id = ?', [id]);
    if (areas.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Área no encontrada'
      });
    }
    
    // Si se cambia el código, verificar que no exista
    if (codigo) {
      const [existentes] = await pool.execute(
        'SELECT id FROM areas WHERE codigo = ? AND id != ?',
        [codigo.toUpperCase(), id]
      );
      if (existentes.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El código ya está registrado'
        });
      }
    }
    
    // Construir query de actualización
    const campos = [];
    const valores = [];
    
    if (codigo) {
      campos.push('codigo = ?');
      valores.push(codigo.toUpperCase());
    }
    if (nombre) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (responsable_id !== undefined) {
      campos.push('responsable_id = ?');
      valores.push(responsable_id || null);
    }
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
      `UPDATE areas SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
    
    res.json({
      status: 'success',
      message: 'Área actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar área'
    });
  }
};

// Eliminar área (soft delete)
export const eliminarArea = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el área existe
    const [areas] = await pool.execute('SELECT id FROM areas WHERE id = ?', [id]);
    if (areas.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Área no encontrada'
      });
    }
    
    // Desactivar área
    await pool.execute('UPDATE areas SET activo = FALSE WHERE id = ?', [id]);
    
    res.json({
      status: 'success',
      message: 'Área desactivada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar área:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar área'
    });
  }
};

