import { pool } from '../db.js';
import path from 'path';
import fs from 'fs';
import { registrarHistorial } from '../utils/historial.js';

// Subir archivo adjunto
export const subirArchivo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo'
      });
    }
    
    // Obtener ID de la incidencia
    const [incidencias] = await pool.execute(
      'SELECT id FROM incidencias WHERE codigo = ?',
      [codigo]
    );
    
    if (incidencias.length === 0) {
      // Eliminar archivo si la incidencia no existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }
    
    const incidenciaId = incidencias[0].id;
    
    // Guardar información del archivo en la BD
    const [result] = await pool.execute(
      `INSERT INTO archivos_adjuntos 
       (incidencia_id, nombre_archivo, ruta, tipo_mime, tamano_bytes, subido_por_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        incidenciaId,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        userId
      ]
    );
    
    // Registrar en historial
    await registrarHistorial(
      incidenciaId,
      'adjunto',
      userId,
      `Archivo adjunto agregado: ${req.file.originalname}`
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Archivo subido exitosamente',
      data: {
        id: result.insertId,
        nombre: req.file.originalname,
        tamano: req.file.size,
        tipo: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    // Eliminar archivo si hubo error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }
    res.status(500).json({
      status: 'error',
      message: 'Error al subir archivo'
    });
  }
};

// Descargar archivo
export const descargarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del archivo
    const [archivos] = await pool.execute(
      'SELECT nombre_archivo, ruta, tipo_mime FROM archivos_adjuntos WHERE id = ?',
      [id]
    );
    
    if (archivos.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Archivo no encontrado'
      });
    }
    
    const archivo = archivos[0];
    
    // Verificar que el archivo existe en el sistema de archivos
    if (!fs.existsSync(archivo.ruta)) {
      return res.status(404).json({
        status: 'error',
        message: 'El archivo no existe en el servidor'
      });
    }
    
    // Enviar archivo
    res.setHeader('Content-Type', archivo.tipo_mime);
    res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombre_archivo}"`);
    
    const fileStream = fs.createReadStream(archivo.ruta);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al descargar archivo'
    });
  }
};

// Listar archivos de una incidencia
export const listarArchivos = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    // Obtener ID de la incidencia
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
    
    // Obtener archivos
    const [archivos] = await pool.execute(
      `SELECT a.id, a.nombre_archivo, a.tipo_mime, a.tamano_bytes, a.fecha_subida,
              u.id as usuario_id, u.nombre as usuario_nombre
       FROM archivos_adjuntos a
       INNER JOIN usuarios u ON a.subido_por_id = u.id
       WHERE a.incidencia_id = ?
       ORDER BY a.fecha_subida DESC`,
      [incidenciaId]
    );
    
    const archivosFormateados = archivos.map(arch => ({
      id: arch.id,
      nombre: arch.nombre_archivo,
      tipo: arch.tipo_mime,
      tamano: arch.tamano_bytes,
      tamanoFormateado: formatFileSize(arch.tamano_bytes),
      fecha: arch.fecha_subida,
      subidoPor: {
        id: arch.usuario_id,
        nombre: arch.usuario_nombre
      }
    }));
    
    res.json({
      status: 'success',
      data: archivosFormateados
    });
  } catch (error) {
    console.error('Error al listar archivos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener archivos'
    });
  }
};

// Eliminar archivo
export const eliminarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Obtener información del archivo
    const [archivos] = await pool.execute(
      'SELECT id, incidencia_id, ruta FROM archivos_adjuntos WHERE id = ?',
      [id]
    );
    
    if (archivos.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Archivo no encontrado'
      });
    }
    
    const archivo = archivos[0];
    
    // Eliminar archivo del sistema de archivos
    if (fs.existsSync(archivo.ruta)) {
      try {
        fs.unlinkSync(archivo.ruta);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo del sistema:', unlinkError);
      }
    }
    
    // Eliminar registro de la BD
    await pool.execute(
      'DELETE FROM archivos_adjuntos WHERE id = ?',
      [id]
    );
    
    // Registrar en historial
    await registrarHistorial(
      archivo.incidencia_id,
      'adjunto',
      userId,
      'Archivo adjunto eliminado'
    );
    
    res.json({
      status: 'success',
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar archivo'
    });
  }
};

// Función auxiliar para formatear tamaño de archivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

