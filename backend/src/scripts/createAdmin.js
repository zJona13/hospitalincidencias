import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const usuarios = [
  // Administradores
  {
    nombre: 'Admin TI',
    email: 'admin.ti@hospital.com',
    password: 'admin123',
    rol: 'administrador',
    tipo_admin: 'ti',
    area_codigo: 'TI'
  },
  {
    nombre: 'Admin General',
    email: 'admin.general@hospital.com',
    password: 'admin123',
    rol: 'administrador',
    tipo_admin: 'general',
    area_codigo: 'ADM'
  },
  // Médicos
  {
    nombre: 'Dr. Carlos Martínez',
    email: 'carlos.martinez@hospital.com',
    password: 'medico123',
    rol: 'medico',
    tipo_admin: null,
    area_codigo: 'URG'
  },
  {
    nombre: 'Dra. Ana García',
    email: 'ana.garcia@hospital.com',
    password: 'medico123',
    rol: 'medico',
    tipo_admin: null,
    area_codigo: 'UCI'
  },
  {
    nombre: 'Dr. Luis Rodríguez',
    email: 'luis.rodriguez@hospital.com',
    password: 'medico123',
    rol: 'medico',
    tipo_admin: null,
    area_codigo: 'CONS'
  },
  // Enfermeros
  {
    nombre: 'Enf. María López',
    email: 'maria.lopez@hospital.com',
    password: 'enfermero123',
    rol: 'enfermero',
    tipo_admin: null,
    area_codigo: 'URG'
  },
  {
    nombre: 'Enf. Juan Pérez',
    email: 'juan.perez@hospital.com',
    password: 'enfermero123',
    rol: 'enfermero',
    tipo_admin: null,
    area_codigo: 'HOSP'
  },
  {
    nombre: 'Enf. Rosa Sánchez',
    email: 'rosa.sanchez@hospital.com',
    password: 'enfermero123',
    rol: 'enfermero',
    tipo_admin: null,
    area_codigo: 'UCI'
  },
  // Técnicos
  {
    nombre: 'Téc. Pedro Ramírez',
    email: 'pedro.ramirez@hospital.com',
    password: 'tecnico123',
    rol: 'tecnico',
    tipo_admin: null,
    area_codigo: 'LAB'
  },
  {
    nombre: 'Téc. Sofía Torres',
    email: 'sofia.torres@hospital.com',
    password: 'tecnico123',
    rol: 'tecnico',
    tipo_admin: null,
    area_codigo: 'RAD'
  },
  {
    nombre: 'Téc. Miguel Fernández',
    email: 'miguel.fernandez@hospital.com',
    password: 'tecnico123',
    rol: 'tecnico',
    tipo_admin: null,
    area_codigo: 'TI'
  },
  // Usuarios regulares
  {
    nombre: 'Usuario Regular 1',
    email: 'usuario1@hospital.com',
    password: 'usuario123',
    rol: 'usuario',
    tipo_admin: null,
    area_codigo: 'ADM'
  },
  {
    nombre: 'Usuario Regular 2',
    email: 'usuario2@hospital.com',
    password: 'usuario123',
    rol: 'usuario',
    tipo_admin: null,
    area_codigo: 'FARM'
  },
  {
    nombre: 'Usuario Regular 3',
    email: 'usuario3@hospital.com',
    password: 'usuario123',
    rol: 'usuario',
    tipo_admin: null,
    area_codigo: 'HOSP'
  }
];

async function createUsers() {
  try {
    console.log('🚀 Iniciando creación/actualización de usuarios...\n');

    for (const usuario of usuarios) {
      // Generar hash de la contraseña
      const passwordHash = await bcrypt.hash(usuario.password, 10);
      
      // Verificar si el usuario ya existe
      const [existing] = await pool.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [usuario.email]
      );
      
      // Obtener área
      const [areas] = await pool.execute(
        'SELECT id FROM areas WHERE codigo = ? LIMIT 1',
        [usuario.area_codigo]
      );
      
      const areaId = areas.length > 0 ? areas[0].id : null;
      
      if (existing.length > 0) {
        // Actualizar usuario existente con hash correcto
        await pool.execute(
          `UPDATE usuarios 
           SET nombre = ?, password = ?, rol = ?, tipo_admin = ?, area_id = ?, activo = TRUE
           WHERE email = ?`,
          [
            usuario.nombre,
            passwordHash,
            usuario.rol,
            usuario.tipo_admin,
            areaId,
            usuario.email
          ]
        );
        console.log(`✓ Usuario actualizado: ${usuario.nombre} (${usuario.email})`);
      } else {
        // Crear nuevo usuario
        await pool.execute(
          `INSERT INTO usuarios (nombre, email, password, rol, tipo_admin, area_id, activo)
           VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
          [
            usuario.nombre,
            usuario.email,
            passwordHash,
            usuario.rol,
            usuario.tipo_admin,
            areaId
          ]
        );
        console.log(`✓ Usuario creado: ${usuario.nombre} (${usuario.email})`);
      }
    }
    
    console.log('\n✅ Todos los usuarios han sido creados/actualizados exitosamente\n');
    console.log('📋 Credenciales de acceso:\n');
    console.log('=== ADMINISTRADORES ===');
    console.log('Admin TI:');
    console.log('  Email: admin.ti@hospital.com');
    console.log('  Password: admin123\n');
    console.log('Admin General:');
    console.log('  Email: admin.general@hospital.com');
    console.log('  Password: admin123\n');
    console.log('=== MÉDICOS (Password: medico123) ===');
    usuarios.filter(u => u.rol === 'medico').forEach(u => {
      console.log(`  ${u.nombre}: ${u.email}`);
    });
    console.log('\n=== ENFERMEROS (Password: enfermero123) ===');
    usuarios.filter(u => u.rol === 'enfermero').forEach(u => {
      console.log(`  ${u.nombre}: ${u.email}`);
    });
    console.log('\n=== TÉCNICOS (Password: tecnico123) ===');
    usuarios.filter(u => u.rol === 'tecnico').forEach(u => {
      console.log(`  ${u.nombre}: ${u.email}`);
    });
    console.log('\n=== USUARIOS REGULARES (Password: usuario123) ===');
    usuarios.filter(u => u.rol === 'usuario').forEach(u => {
      console.log(`  ${u.nombre}: ${u.email}`);
    });
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error al crear usuarios:', error);
    process.exit(1);
  }
}

createUsers();

