import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db.js';
import { enviarCorreoRecuperacion } from '../mailer.js';

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


// =====================================================
// Recuperación de contraseña
// =====================================================

const MINUTOS_VIGENCIA = 30;
const SEGUNDOS_ENTRE_SOLICITUDES = 60;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Oculta el correo en las respuestas: carlos.martinez@hospital.com -> c*************z@hospital.com
const enmascararEmail = (email) => {
  const [usuario, dominio] = email.split('@');
  if (!dominio) return email;
  if (usuario.length <= 2) return `${usuario[0]}*@${dominio}`;
  return `${usuario[0]}${'*'.repeat(usuario.length - 2)}${usuario[usuario.length - 1]}@${dominio}`;
};

export const validarPassword = (password) => {
  if (!password || password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[a-z]/.test(password)) return 'La contraseña debe incluir al menos una minúscula';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir al menos una mayúscula';
  if (!/[0-9]/.test(password)) return 'La contraseña debe incluir al menos un número';
  return null;
};

// POST /api/auth/recuperar
// Responde siempre lo mismo, exista o no la cuenta, para no revelar qué correos están registrados.
export const solicitarRecuperacion = async (req, res) => {
  const respuestaGenerica = {
    status: 'success',
    message: 'Si el correo corresponde a una cuenta activa, enviamos un enlace para restablecer la contraseña.'
  };

  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Ingresa un correo válido'
      });
    }

    const correo = email.trim().toLowerCase();

    const [users] = await pool.execute(
      'SELECT id, nombre, email, activo FROM usuarios WHERE email = ?',
      [correo]
    );

    if (users.length === 0 || !users[0].activo) {
      return res.json(respuestaGenerica);
    }

    const user = users[0];

    // Límite de frecuencia: una solicitud por minuto y por cuenta
    const [recientes] = await pool.execute(
      'SELECT id FROM tokens_recuperacion WHERE usuario_id = ? AND fecha_creacion > DATE_SUB(NOW(), INTERVAL ? SECOND) LIMIT 1',
      [user.id, SEGUNDOS_ENTRE_SOLICITUDES]
    );

    if (recientes.length > 0) {
      return res.status(429).json({
        status: 'error',
        message: 'Ya enviamos un enlace hace poco. Espera un minuto antes de solicitar otro.'
      });
    }

    // Invalidar enlaces anteriores que sigan vigentes
    await pool.execute(
      'UPDATE tokens_recuperacion SET fecha_uso = NOW() WHERE usuario_id = ? AND fecha_uso IS NULL',
      [user.id]
    );

    const token = crypto.randomBytes(32).toString('hex');

    await pool.execute(
      'INSERT INTO tokens_recuperacion (usuario_id, token_hash, fecha_expiracion, ip_solicitud) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)',
      [user.id, hashToken(token), MINUTOS_VIGENCIA, req.ip || null]
    );

    const base = (process.env.PUBLIC_URL_FRONT || 'http://localhost:8080').split(',')[0];
    const enlace = `${base}/restablecer/${token}`;

    try {
      await enviarCorreoRecuperacion(user.email, user.nombre, enlace);
    } catch (errorCorreo) {
      console.error('Error al enviar correo de recuperación:', errorCorreo);
    }

    return res.json(respuestaGenerica);
  } catch (error) {
    console.error('Error en solicitarRecuperacion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/auth/recuperar/:token
// Permite a la pantalla de nueva contraseña saber si el enlace sigue siendo válido.
export const verificarTokenRecuperacion = async (req, res) => {
  try {
    const { token } = req.params;

    const [filas] = await pool.execute(
      `SELECT t.id, u.email
       FROM tokens_recuperacion t
       JOIN usuarios u ON u.id = t.usuario_id
       WHERE t.token_hash = ? AND t.fecha_uso IS NULL AND t.fecha_expiracion > NOW() AND u.activo = TRUE`,
      [hashToken(token || '')]
    );

    if (filas.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El enlace no es válido o ya venció. Solicita uno nuevo.'
      });
    }

    res.json({
      status: 'success',
      data: { email: enmascararEmail(filas[0].email) }
    });
  } catch (error) {
    console.error('Error en verificarTokenRecuperacion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

// POST /api/auth/restablecer
export const restablecerPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'El enlace y la nueva contraseña son requeridos'
      });
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) {
      return res.status(400).json({ status: 'error', message: errorPassword });
    }

    const [filas] = await pool.execute(
      `SELECT t.id, t.usuario_id, u.email
       FROM tokens_recuperacion t
       JOIN usuarios u ON u.id = t.usuario_id
       WHERE t.token_hash = ? AND t.fecha_uso IS NULL AND t.fecha_expiracion > NOW() AND u.activo = TRUE`,
      [hashToken(token)]
    );

    if (filas.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El enlace no es válido o ya venció. Solicita uno nuevo.'
      });
    }

    const registro = filas[0];
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [passwordHash, registro.usuario_id]
    );

    // Consumir este token e invalidar cualquier otro vigente de la misma cuenta
    await pool.execute(
      'UPDATE tokens_recuperacion SET fecha_uso = NOW() WHERE usuario_id = ? AND fecha_uso IS NULL',
      [registro.usuario_id]
    );

    res.json({
      status: 'success',
      message: 'Contraseña actualizada. Ya puedes iniciar sesión con tus nuevos datos.'
    });
  } catch (error) {
    console.error('Error en restablecerPassword:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};
