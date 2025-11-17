import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const [users] = await pool.execute(
      'SELECT id, nombre, email, password, rol, tipo_admin, area_id, activo FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({
        status: 'error',
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Obtener información del área si existe
    let area = null;
    if (user.area_id) {
      const [areas] = await pool.execute(
        'SELECT id, codigo, nombre FROM areas WHERE id = ?',
        [user.area_id]
      );
      if (areas.length > 0) {
        area = areas[0];
      }
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
        tipo_admin: user.tipo_admin || null
      },
      process.env.JWT_SECRET || 'secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Retornar datos del usuario (sin password)
    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          tipo_admin: user.tipo_admin || null,
          area: area ? {
            id: area.id,
            codigo: area.codigo,
            nombre: area.nombre
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

export const me = async (req, res) => {
  try {
    // El usuario ya está en req.user gracias al middleware auth
    const userId = req.user.id;

    // Obtener información completa del usuario
    const [users] = await pool.execute(
      `SELECT u.id, u.nombre, u.email, u.rol, u.tipo_admin, u.area_id, u.activo,
              a.id as area_id, a.codigo as area_codigo, a.nombre as area_nombre
       FROM usuarios u
       LEFT JOIN areas a ON u.area_id = a.id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];

    res.json({
      status: 'success',
      data: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        tipo_admin: user.tipo_admin || null,
        activo: user.activo,
        area: user.area_id ? {
          id: user.area_id,
          codigo: user.area_codigo,
          nombre: user.area_nombre
        } : null
      }
    });
  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

