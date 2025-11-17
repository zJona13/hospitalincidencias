import { pool } from '../db.js';

// Listar prioridades
export const listarPrioridades = async (req, res) => {
  try {
    const { activo } = req.query;
    
    let query = 'SELECT * FROM prioridades WHERE 1=1';
    const params = [];
    
    if (activo !== undefined) {
      query += ' AND activo = ?';
      params.push(activo === 'true' || activo === true);
    }
    
    query += ' ORDER BY nivel';
    
    const [prioridades] = await pool.execute(query, params);
    
    res.json({
      status: 'success',
      data: prioridades
    });
  } catch (error) {
    console.error('Error al listar prioridades:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener prioridades'
    });
  }
};

// Obtener prioridad por ID
export const obtenerPrioridad = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [prioridades] = await pool.execute(
      'SELECT * FROM prioridades WHERE id = ?',
      [id]
    );
    
    if (prioridades.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Prioridad no encontrada'
      });
    }
    
    res.json({
      status: 'success',
      data: prioridades[0]
    });
  } catch (error) {
    console.error('Error al obtener prioridad:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener prioridad'
    });
  }
};

// Crear prioridad
export const crearPrioridad = async (req, res) => {
  try {
    const { nivel, nombre, color, tiempo_respuesta_minutos, tiempo_resolucion_horas } = req.body;
    
    if (!nivel || !nombre || !color || !tiempo_respuesta_minutos || !tiempo_resolucion_horas) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos'
      });
    }
    
    // Verificar que el nivel no exista
    const [existentes] = await pool.execute(
      'SELECT id FROM prioridades WHERE nivel = ?',
      [nivel.toUpperCase()]
    );
    
    if (existentes.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El nivel ya está registrado'
      });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO prioridades (nivel, nombre, color, tiempo_respuesta_minutos, tiempo_resolucion_horas, activo)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [nivel.toUpperCase(), nombre, color, tiempo_respuesta_minutos, tiempo_resolucion_horas]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Prioridad creada exitosamente',
      data: {
        id: result.insertId,
        nivel: nivel.toUpperCase(),
        nombre
      }
    });
  } catch (error) {
    console.error('Error al crear prioridad:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear prioridad'
    });
  }
};

// Actualizar prioridad
export const actualizarPrioridad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nivel, nombre, color, tiempo_respuesta_minutos, tiempo_resolucion_horas, activo } = req.body;
    
    const [prioridades] = await pool.execute('SELECT id FROM prioridades WHERE id = ?', [id]);
    if (prioridades.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Prioridad no encontrada'
      });
    }
    
    if (nivel) {
      const [existentes] = await pool.execute(
        'SELECT id FROM prioridades WHERE nivel = ? AND id != ?',
        [nivel.toUpperCase(), id]
      );
      if (existentes.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El nivel ya está registrado'
        });
      }
    }
    
    const campos = [];
    const valores = [];
    
    if (nivel) {
      campos.push('nivel = ?');
      valores.push(nivel.toUpperCase());
    }
    if (nombre) campos.push('nombre = ?'), valores.push(nombre);
    if (color) campos.push('color = ?'), valores.push(color);
    if (tiempo_respuesta_minutos !== undefined) {
      campos.push('tiempo_respuesta_minutos = ?');
      valores.push(tiempo_respuesta_minutos);
    }
    if (tiempo_resolucion_horas !== undefined) {
      campos.push('tiempo_resolucion_horas = ?');
      valores.push(tiempo_resolucion_horas);
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
      `UPDATE prioridades SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
    
    res.json({
      status: 'success',
      message: 'Prioridad actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar prioridad:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar prioridad'
    });
  }
};

// Eliminar prioridad (soft delete)
export const eliminarPrioridad = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [prioridades] = await pool.execute('SELECT id FROM prioridades WHERE id = ?', [id]);
    if (prioridades.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Prioridad no encontrada'
      });
    }
    
    await pool.execute('UPDATE prioridades SET activo = FALSE WHERE id = ?', [id]);
    
    res.json({
      status: 'success',
      message: 'Prioridad desactivada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar prioridad:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar prioridad'
    });
  }
};

