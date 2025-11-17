import { pool } from '../db.js';

/**
 * Genera un código único para una incidencia en formato INC-YYYY-NNNN
 * @returns {Promise<string>} Código de incidencia único
 */
export const generarCodigoIncidencia = async () => {
  const año = new Date().getFullYear();
  const prefijo = `INC-${año}-`;
  
  try {
    // Buscar el último código del año actual
    const [resultados] = await pool.execute(
      `SELECT codigo FROM incidencias 
       WHERE codigo LIKE ? 
       ORDER BY codigo DESC 
       LIMIT 1`,
      [`${prefijo}%`]
    );
    
    let siguienteNumero = 1;
    
    if (resultados.length > 0) {
      // Extraer el número del último código
      const ultimoCodigo = resultados[0].codigo;
      const numeroStr = ultimoCodigo.replace(prefijo, '');
      const ultimoNumero = parseInt(numeroStr, 10);
      
      if (!isNaN(ultimoNumero)) {
        siguienteNumero = ultimoNumero + 1;
      }
    }
    
    // Formatear con ceros a la izquierda (4 dígitos)
    const numeroFormateado = siguienteNumero.toString().padStart(4, '0');
    
    return `${prefijo}${numeroFormateado}`;
  } catch (error) {
    console.error('Error al generar código de incidencia:', error);
    throw new Error('Error al generar código de incidencia');
  }
};

