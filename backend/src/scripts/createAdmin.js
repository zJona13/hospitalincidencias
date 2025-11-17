import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    const email = 'admin@hospital.com';
    const password = 'admin123';
    const nombre = 'Administrador';
    
    // Generar hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Hash generado:', passwordHash);
    
    // Verificar si el usuario ya existe
    const [existing] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      // Actualizar contraseña del usuario existente
      await pool.execute(
        'UPDATE usuarios SET password = ? WHERE email = ?',
        [passwordHash, email]
      );
      console.log('✓ Contraseña del administrador actualizada');
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
    } else {
      // Crear nuevo usuario
      const [result] = await pool.execute(
        `INSERT INTO usuarios (nombre, email, password, rol, activo)
         VALUES (?, ?, ?, 'administrador', TRUE)`,
        [nombre, email, passwordHash]
      );
      
      // Asignar área de administración
      const [areas] = await pool.execute(
        "SELECT id FROM areas WHERE codigo = 'ADM' LIMIT 1"
      );
      
      if (areas.length > 0) {
        await pool.execute(
          'UPDATE usuarios SET area_id = ? WHERE id = ?',
          [areas[0].id, result.insertId]
        );
      }
      
      console.log('✓ Usuario administrador creado');
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
    }
    
    console.log('\n✅ Usuario administrador listo para usar');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error al crear administrador:', error);
    process.exit(1);
  }
}

createAdmin();

