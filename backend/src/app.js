import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

// Cargar variables de entorno
dotenv.config();

// Crear instancia de Express
const app = express();

// Configurar CORS
const allowedOrigins = process.env.PUBLIC_URL_FRONT 
  ? process.env.PUBLIC_URL_FRONT.split(',')
  : ['http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos los orígenes en desarrollo
    }
  },
  credentials: true
}));

// Middleware para parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función para probar la conexión a la base de datos
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✓ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('✗ Error al conectar con la base de datos:', error.message);
    return false;
  }
}

// Endpoint de health check básico
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de health check de base de datos
app.get('/api/health/db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({
      status: 'ok',
      message: 'Conexión a la base de datos exitosa',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Error al conectar con la base de datos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import catalogosRoutes from './routes/catalogos.routes.js';
import incidenciasRoutes from './routes/incidencias.routes.js';
import comentariosRoutes from './routes/comentarios.routes.js';
import archivosRoutes from './routes/archivos.routes.js';
import historialRoutes from './routes/historial.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import areasRoutes from './routes/areas.routes.js';
import prioridadesRoutes from './routes/prioridades.routes.js';
import tiposRoutes from './routes/tipos.routes.js';
import notificacionesRoutes from './routes/notificaciones.routes.js';

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/incidencias', comentariosRoutes);
app.use('/api/incidencias', archivosRoutes);
app.use('/api/incidencias', historialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/usuarios', usuariosRoutes);
app.use('/api/admin/areas', areasRoutes);
app.use('/api/admin/prioridades', prioridadesRoutes);
app.use('/api/admin/tipos', tiposRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
  // Probar conexión a la base de datos antes de iniciar
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.error('⚠️  Advertencia: No se pudo conectar a la base de datos. El servidor se iniciará de todos modos.');
    console.error('   Verifica que las variables de entorno estén correctamente configuradas en el archivo .env');
  }

  app.listen(PORT, () => {
    console.log('\n🚀 Servidor iniciado correctamente');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💾 DB Health check: http://localhost:${PORT}/api/health/db\n`);
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`✗ Error: El puerto ${PORT} ya está en uso`);
      console.error('   Intenta cambiar el puerto en tu archivo .env o detén el proceso que está usando ese puerto');
    } else {
      console.error('✗ Error al iniciar el servidor:', error.message);
    }
    process.exit(1);
  });
}

// Iniciar el servidor
startServer();

