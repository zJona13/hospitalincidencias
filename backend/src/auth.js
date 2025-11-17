import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No se proporcionó token de autenticación'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado'
    });
  }
};

// Middleware opcional para verificar roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado'
      });
    }
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permisos para realizar esta acción'
      });
    }
    
    next();
  };
};