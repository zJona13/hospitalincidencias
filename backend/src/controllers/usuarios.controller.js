import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import { requireRole } from '../auth.js';

// Listar usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const { search, area_id, rol, activo } = req.query;
    
    let query = `
      SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.fecha_creacion,
             a.id as area_id, a.codigo as area_codigo, a.nombre as area_nombre
      FROM usuarios u
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ' AND (u.nombre LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (area_id) {
      query += ' AND u.area_id = ?';
      params.push(area_id);
    }
    
    if (rol) {
      query += ' AND u.rol = ?';
      params.push(rol);
    }
    
    if (activo !== undefined) {
      query += ' AND u.activo = ?';
      params.push(activo === 'true' || activo === true);
    }
    
    query += ' ORDER BY u.nombre';
    
    const [usuarios] = await pool.execute(query, params);
    
    const usuariosFormateados = usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: u.activo,
      fechaCreacion: u.fecha_creacion,
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
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener usuarios'
    });
  }
};

// Obtener usuario por ID
export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [usuarios] = await pool.execute(
      `SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.fecha_creacion,
              a.id as area_id, a.codigo as area_codigo, a.nombre as area_nombre
       FROM usuarios u
       LEFT JOIN areas a ON u.area_id = a.id
       WHERE u.id = ?`,
      [id]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    const u = usuarios[0];
    res.json({
      status: 'success',
      data: {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        activo: u.activo,
        fechaCreacion: u.fecha_creacion,
        area: u.area_id ? {
          id: u.area_id,
          codigo: u.area_codigo,
          nombre: u.area_nombre
        } : null
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener usuario'
    });
  }
};

// Crear usuario
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol, area_id } = req.body;
    
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos: nombre, email, password, rol'
      });
    }
    
    // Verificar que el email no exista
    const [existentes] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (existentes.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El email ya está registrado'
      });
    }
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insertar usuario
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, email, password, rol, area_id, activo)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [nombre, email, passwordHash, rol, area_id || null]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Usuario creado exitosamente',
      data: {
        id: result.insertId,
        nombre,
        email,
        rol
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear usuario'
    });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, area_id, activo } = req.body;
    
    // Verificar que el usuario existe
    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    // Si se cambia el email, verificar que no exista
    if (email) {
      const [existentes] = await pool.execute(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existentes.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El email ya está registrado'
        });
      }
    }
    
    // Construir query de actualización
    const campos = [];
    const valores = [];
    
    if (nombre) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (email) {
      campos.push('email = ?');
      valores.push(email);
    }
    if (rol) {
      campos.push('rol = ?');
      valores.push(rol);
    }
    if (area_id !== undefined) {
      campos.push('area_id = ?');
      valores.push(area_id || null);
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
      `UPDATE usuarios SET ${campos.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?`,
      valores
    );
    
    res.json({
      status: 'success',
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar usuario'
    });
  }
};

// Cambiar contraseña
export const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña es requerida'
      });
    }
    
    // Verificar que el usuario existe
    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.execute(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [passwordHash, id]
    );
    
    res.json({
      status: 'success',
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cambiar contraseña'
    });
  }
};

// Eliminar usuario (soft delete - desactivar)
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    // Desactivar usuario en lugar de eliminar
    await pool.execute(
      'UPDATE usuarios SET activo = FALSE WHERE id = ?',
      [id]
    );
    
    res.json({
      status: 'success',
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar usuario'
    });
  }
};

