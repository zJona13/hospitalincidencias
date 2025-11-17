import { pool } from '../db.js';
import { generarCodigoIncidencia } from '../utils/codigoIncidencia.js';
import { registrarHistorial } from '../utils/historial.js';
import { crearNotificacion } from '../utils/notificaciones.js';
import dotenv from 'dotenv';

dotenv.config();

// Datos de ejemplo para incidencias
const titulosIncidencias = [
  // Clínicas
  'Fallo en monitor de signos vitales en UCI',
  'Equipo de respiración asistida no funciona correctamente',
  'Falta de suministros médicos en Urgencias',
  'Problema con bomba de infusión en habitación 205',
  'Desfibrilador no responde en sala de emergencias',
  'Falta de oxígeno en tanque de UCI',
  'Equipo de rayos X portátil no enciende',
  'Problema con sistema de succión en quirófano',
  'Falta de material estéril en consultorios',
  'Monitor fetal no detecta señales correctamente',
  
  // Tecnología
  'Sistema de historial clínico no responde',
  'Impresora de etiquetas de laboratorio fuera de servicio',
  'Red WiFi caída en área de hospitalización',
  'Computadora de enfermería no inicia',
  'Sistema de farmacia no permite registrar salidas',
  'Tablet de registro médico con pantalla rota',
  'Servidor de imágenes médicas lento',
  'Aplicación de citas no carga',
  'Scanner de códigos de barras no funciona',
  'Sistema de facturación presenta errores',
  
  // Infraestructura
  'Aire acondicionado no funciona en quirófano 3',
  'Fuga de agua en baño de planta baja',
  'Luz de emergencia no funciona en pasillo principal',
  'Puerta automática de UCI atascada',
  'Ascensor 2 fuera de servicio',
  'Problema eléctrico en sala de espera',
  'Ventilación deficiente en laboratorio',
  'Techo con goteras en consultorio 12',
  'Sistema de alarma de incendios no funciona',
  'Iluminación insuficiente en estacionamiento',
  
  // Administrativas
  'Falta de formularios de consentimiento informado',
  'Sistema de archivo de expedientes desorganizado',
  'Problema con facturación de paciente',
  'Falta de material de oficina en administración',
  'Impresora de facturas sin tinta',
  'Archivo de documentos médicos incompleto',
  'Problema con sistema de citas',
  'Falta de sellos oficiales en recepción',
  'Sistema de inventario desactualizado',
  'Problema con generación de reportes',
];

const descripcionesIncidencias = [
  'Se requiere atención inmediata para resolver este problema que está afectando la operación normal del área.',
  'El problema se ha presentado de manera recurrente y necesita una solución definitiva.',
  'Esta situación está impactando la atención a pacientes y requiere pronta resolución.',
  'Se ha reportado por múltiples usuarios y necesita revisión técnica urgente.',
  'El problema comenzó de manera intermitente pero ahora es constante.',
  'Esta incidencia afecta directamente la seguridad de los pacientes.',
  'Se requiere intervención especializada para resolver este problema.',
  'El equipo técnico debe revisar y dar solución en el menor tiempo posible.',
  'Esta situación está generando retrasos en los procedimientos médicos.',
  'Se necesita una solución temporal mientras se implementa la definitiva.',
];

const solucionesAplicadas = [
  'Se realizó mantenimiento preventivo y se reemplazaron los componentes defectuosos. El equipo quedó funcionando correctamente.',
  'Se actualizó el software y se reinició el sistema. El problema se resolvió completamente.',
  'Se identificó la causa raíz y se aplicó la solución correspondiente. Se realizaron pruebas de funcionamiento.',
  'Se reemplazó el equipo defectuoso por uno nuevo. Se verificó el correcto funcionamiento.',
  'Se realizó limpieza y calibración del equipo. Se documentó el procedimiento realizado.',
  'Se aplicó parche de seguridad y se actualizó la configuración. El sistema quedó operativo.',
  'Se contactó al proveedor y se realizó reparación bajo garantía. Equipo funcionando normalmente.',
  'Se implementó solución temporal y se programó mantenimiento mayor para la próxima semana.',
  'Se reemplazaron las piezas desgastadas y se realizó mantenimiento completo del sistema.',
  'Se corrigió la configuración y se realizaron ajustes necesarios. Todo funcionando correctamente.',
];

const pasosSeguidos = [
  '1. Diagnóstico del problema\n2. Identificación de componentes afectados\n3. Aplicación de solución\n4. Pruebas de funcionamiento\n5. Documentación del proceso',
  '1. Revisión inicial del equipo\n2. Consulta con el proveedor\n3. Obtención de repuestos\n4. Instalación y configuración\n5. Verificación final',
  '1. Análisis del error reportado\n2. Revisión de logs del sistema\n3. Aplicación de corrección\n4. Reinicio del servicio\n5. Validación de funcionamiento',
  '1. Inspección visual del área\n2. Identificación de la causa\n3. Contacto con mantenimiento\n4. Ejecución de reparación\n5. Verificación de resultados',
  '1. Evaluación del problema\n2. Planificación de la solución\n3. Ejecución de reparación\n4. Pruebas de funcionamiento\n5. Entrega del servicio',
];

const recursosUtilizados = [
  'Personal técnico especializado, herramientas de diagnóstico, repuestos de inventario',
  'Equipo de mantenimiento, materiales de reparación, tiempo de servicio técnico',
  'Personal de TI, software de diagnóstico, acceso a sistemas de soporte',
  'Materiales de reparación, herramientas especializadas, personal de mantenimiento',
  'Técnicos especializados, repuestos, herramientas de calibración',
];

const comentariosEjemplo = [
  'El problema persiste, necesitamos una solución más definitiva.',
  'Gracias por la rápida atención, el problema se resolvió correctamente.',
  'Se requiere seguimiento para asegurar que no vuelva a ocurrir.',
  'El equipo está funcionando pero se nota que necesita mantenimiento preventivo.',
  'Excelente trabajo del equipo técnico, muy profesional.',
  'Necesitamos más información sobre la causa raíz del problema.',
  'El problema se resolvió temporalmente, pero necesitamos una solución permanente.',
  'Gracias por la atención, todo funcionando correctamente ahora.',
];

/**
 * Obtiene un elemento aleatorio de un array
 */
function obtenerAleatorio(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Obtiene múltiples elementos aleatorios de un array
 */
function obtenerAleatorios(array, cantidad) {
  const copia = [...array];
  const resultado = [];
  for (let i = 0; i < cantidad && copia.length > 0; i++) {
    const indice = Math.floor(Math.random() * copia.length);
    resultado.push(copia.splice(indice, 1)[0]);
  }
  return resultado;
}

/**
 * Genera una fecha aleatoria en los últimos N días
 */
function fechaAleatoria(diasAtras) {
  const ahora = new Date();
  const dias = Math.floor(Math.random() * diasAtras);
  const horas = Math.floor(Math.random() * 24);
  const minutos = Math.floor(Math.random() * 60);
  
  const fecha = new Date(ahora);
  fecha.setDate(fecha.getDate() - dias);
  fecha.setHours(horas, minutos, 0, 0);
  
  return fecha;
}

/**
 * Calcula fecha de vencimiento basada en prioridad
 */
function calcularFechaVencimiento(fechaCreacion, tiempoResolucionHoras) {
  const fecha = new Date(fechaCreacion);
  fecha.setHours(fecha.getHours() + tiempoResolucionHoras);
  return fecha;
}

async function seedIncidencias() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Iniciando seed de incidencias...\n');
    
    // Verificar que existan datos base
    const [usuarios] = await connection.execute('SELECT id, nombre, rol, area_id FROM usuarios WHERE activo = TRUE');
    const [areas] = await connection.execute('SELECT id, codigo, nombre FROM areas WHERE activo = TRUE');
    const [tipos] = await connection.execute('SELECT id, nombre FROM tipos_incidencias WHERE activo = TRUE');
    const [prioridades] = await connection.execute('SELECT id, nivel, tiempo_resolucion_horas FROM prioridades WHERE activo = TRUE');
    const [servicios] = await connection.execute('SELECT id, nombre, area_id FROM servicios WHERE activo = TRUE');
    const [subtipos] = await connection.execute('SELECT id, nombre, tipo_incidencia_id FROM subtipos_incidencias WHERE activo = TRUE');
    
    if (usuarios.length === 0) {
      console.error('✗ Error: No hay usuarios en la base de datos. Ejecuta primero el script createAdmin.js');
      process.exit(1);
    }
    
    if (areas.length === 0 || tipos.length === 0 || prioridades.length === 0) {
      console.error('✗ Error: Faltan datos base (áreas, tipos o prioridades). Verifica que el script bd.sql se haya ejecutado correctamente.');
      process.exit(1);
    }
    
    console.log(`✓ Datos base encontrados:`);
    console.log(`  - Usuarios: ${usuarios.length}`);
    console.log(`  - Áreas: ${areas.length}`);
    console.log(`  - Tipos: ${tipos.length}`);
    console.log(`  - Prioridades: ${prioridades.length}`);
    console.log(`  - Servicios: ${servicios.length}`);
    console.log(`  - Subtipos: ${subtipos.length}\n`);
    
    // Verificar si ya hay incidencias
    const [existentes] = await connection.execute('SELECT COUNT(*) as total FROM incidencias');
    const totalExistentes = existentes[0].total;
    
    if (totalExistentes > 0) {
      console.log(`⚠️  Advertencia: Ya existen ${totalExistentes} incidencias en la base de datos.`);
      console.log('   El script agregará nuevas incidencias sin eliminar las existentes.\n');
    }
    
    await connection.beginTransaction();
    
    const cantidadIncidencias = 80;
    const estadisticas = {
      creadas: 0,
      conResponsable: 0,
      resueltas: 0,
      cerradas: 0,
      conComentarios: 0,
      conNotificaciones: 0,
    };
    
    console.log(`📝 Creando ${cantidadIncidencias} incidencias...\n`);
    
    // Procesar en lotes para evitar timeouts
    const tamañoLote = 10;
    let incidenciasCreadas = 0;
    
    for (let lote = 0; lote < Math.ceil(cantidadIncidencias / tamañoLote); lote++) {
      const inicioLote = lote * tamañoLote;
      const finLote = Math.min(inicioLote + tamañoLote, cantidadIncidencias);
      
      // Iniciar transacción para este lote
      await connection.beginTransaction();
      
      try {
        for (let i = inicioLote; i < finLote; i++) {
          try {
            // Seleccionar datos aleatorios
            const reportadoPor = obtenerAleatorio(usuarios);
            const area = obtenerAleatorio(areas);
            const tipo = obtenerAleatorio(tipos);
            const prioridad = obtenerAleatorio(prioridades);
            
            // Buscar servicios y subtipos relacionados
            const serviciosArea = servicios.filter(s => s.area_id === area.id);
            const servicio = serviciosArea.length > 0 ? obtenerAleatorio(serviciosArea) : null;
            
            const subtiposTipo = subtipos.filter(s => s.tipo_incidencia_id === tipo.id);
            const subtipo = subtiposTipo.length > 0 ? obtenerAleatorio(subtiposTipo) : null;
            
            // Generar código
            const codigo = await generarCodigoIncidencia();
            
            // Generar fecha de creación (últimos 90 días)
            const fechaCreacion = fechaAleatoria(90);
            const fechaVencimiento = calcularFechaVencimiento(fechaCreacion, prioridad.tiempo_resolucion_horas);
            
            // Determinar estado (distribución: 30% abierta, 20% en_progreso, 30% resuelta, 20% cerrada)
            let estado = 'abierta';
            const rand = Math.random();
            if (rand < 0.3) estado = 'abierta';
            else if (rand < 0.5) estado = 'en_progreso';
            else if (rand < 0.8) estado = 'resuelta';
            else estado = 'cerrada';
            
            // Asignar responsable (70% de las incidencias)
            let responsableId = null;
            if (Math.random() < 0.7) {
              // Preferir técnicos o usuarios del área TI para incidencias de tecnología
              let candidatos = usuarios;
              if (tipo.nombre === 'Tecnología') {
                candidatos = usuarios.filter(u => u.rol === 'tecnico' || (u.rol === 'administrador' && u.area_id === area.id));
              }
              if (candidatos.length > 0) {
                responsableId = obtenerAleatorio(candidatos).id;
                estadisticas.conResponsable++;
              }
            }
            
            // Generar datos adicionales
            const titulo = obtenerAleatorio(titulosIncidencias);
            const descripcion = obtenerAleatorio(descripcionesIncidencias);
            const piso = Math.random() < 0.6 ? `Piso ${Math.floor(Math.random() * 5) + 1}` : null;
            const habitacion = piso ? `Habitación ${Math.floor(Math.random() * 50) + 100}` : null;
            const cama = habitacion && Math.random() < 0.5 ? `Cama ${Math.floor(Math.random() * 4) + 1}` : null;
            const equipo = Math.random() < 0.4 ? `Equipo ${Math.floor(Math.random() * 1000) + 100}` : null;
            const pacienteId = Math.random() < 0.3 ? `PAC-${Math.floor(Math.random() * 9000) + 1000}` : null;
            
            // Insertar incidencia
            const [result] = await connection.execute(
              `INSERT INTO incidencias 
               (codigo, titulo, descripcion, area_id, servicio_id, tipo_incidencia_id, 
                subtipo_incidencia_id, prioridad_id, estado, reportado_por_id, responsable_id,
                piso, habitacion, cama, equipo, paciente_id, fecha_creacion, fecha_vencimiento)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                codigo, titulo, descripcion, area.id, servicio?.id || null,
                tipo.id, subtipo?.id || null, prioridad.id, estado,
                reportadoPor.id, responsableId,
                piso, habitacion, cama, equipo, pacienteId,
                fechaCreacion, fechaVencimiento
              ]
            );
            
            const incidenciaId = result.insertId;
            estadisticas.creadas++;
            incidenciasCreadas++;
            
            // Registrar historial de creación (usando la conexión directamente)
            await connection.execute(
              `INSERT INTO historial_incidencias 
               (incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [incidenciaId, 'creacion', reportadoPor.id, `Incidencia creada: ${titulo}`, null, null]
            );
            
            // Si tiene responsable, crear notificación y registrar asignación
            if (responsableId) {
              await connection.execute(
                `INSERT INTO notificaciones (usuario_id, incidencia_id, tipo, titulo, mensaje, leida)
                 VALUES (?, ?, ?, ?, ?, FALSE)`,
                [
                  responsableId,
                  incidenciaId,
                  'asignacion',
                  'Nueva incidencia asignada',
                  `Se te ha asignado la incidencia ${codigo}: ${titulo}`
                ]
              );
              
              await connection.execute(
                `INSERT INTO historial_incidencias 
                 (incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [incidenciaId, 'asignacion', reportadoPor.id, `Incidencia asignada a responsable`, null, null]
              );
              
              estadisticas.conNotificaciones++;
            }
        
            // Si está resuelta o cerrada, crear resolución y actualizar fechas
            if (estado === 'resuelta' || estado === 'cerrada') {
              const fechaResolucion = new Date(fechaCreacion);
              fechaResolucion.setDate(fechaResolucion.getDate() + Math.floor(Math.random() * 5) + 1);
              fechaResolucion.setHours(fechaResolucion.getHours() + Math.floor(Math.random() * 8));
              
              const resueltoPor = responsableId ? usuarios.find(u => u.id === responsableId) : reportadoPor;
              const tiempoInvertido = Math.floor(Math.random() * 240) + 30; // 30-270 minutos
              
              // Insertar resolución
              await connection.execute(
                `INSERT INTO resoluciones_incidencias 
                 (incidencia_id, solucion_aplicada, pasos_seguidos, recursos_utilizados, 
                  tiempo_invertido_minutos, resuelto_por_id, fecha_resolucion)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  incidenciaId,
                  obtenerAleatorio(solucionesAplicadas),
                  obtenerAleatorio(pasosSeguidos),
                  obtenerAleatorio(recursosUtilizados),
                  tiempoInvertido,
                  resueltoPor.id,
                  fechaResolucion
                ]
              );
              
              // Actualizar fechas de la incidencia
              await connection.execute(
                `UPDATE incidencias 
                 SET fecha_resolucion = ?, ${estado === 'cerrada' ? 'fecha_cierre = ?, ' : ''}fecha_actualizacion = ?
                 WHERE id = ?`,
                estado === 'cerrada' 
                  ? [fechaResolucion, fechaResolucion, new Date(), incidenciaId]
                  : [fechaResolucion, new Date(), incidenciaId]
              );
              
              // Registrar historial
              await connection.execute(
                `INSERT INTO historial_incidencias 
                 (incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [incidenciaId, 'resolucion', resueltoPor.id, `Incidencia resuelta`, estado === 'cerrada' ? 'resuelta' : 'en_progreso', estado]
              );
              
              if (estado === 'resuelta') estadisticas.resueltas++;
              else estadisticas.cerradas++;
              
              // Notificar al que reportó
              await connection.execute(
                `INSERT INTO notificaciones (usuario_id, incidencia_id, tipo, titulo, mensaje, leida)
                 VALUES (?, ?, ?, ?, ?, FALSE)`,
                [
                  reportadoPor.id,
                  incidenciaId,
                  'estado',
                  'Incidencia resuelta',
                  `La incidencia ${codigo} ha sido resuelta`
                ]
              );
              estadisticas.conNotificaciones++;
            }
            
            // Si está en_progreso, simular cambio de estado
            if (estado === 'en_progreso') {
              await connection.execute(
                `INSERT INTO historial_incidencias 
                 (incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [incidenciaId, 'estado', responsableId || reportadoPor.id, `Estado cambiado a "en_progreso"`, 'abierta', 'en_progreso']
              );
            }
            
            // Agregar comentarios a algunas incidencias (40%)
            if (Math.random() < 0.4) {
              const cantidadComentarios = Math.floor(Math.random() * 3) + 1;
              for (let j = 0; j < cantidadComentarios; j++) {
                const comentarista = obtenerAleatorio(usuarios);
                const fechaComentario = new Date(fechaCreacion);
                fechaComentario.setDate(fechaComentario.getDate() + Math.floor(Math.random() * 7));
                
                await connection.execute(
                  `INSERT INTO comentarios (incidencia_id, usuario_id, texto, fecha_creacion)
                   VALUES (?, ?, ?, ?)`,
                  [
                    incidenciaId,
                    comentarista.id,
                    obtenerAleatorio(comentariosEjemplo),
                    fechaComentario
                  ]
                );
                
                // Registrar historial
                await connection.execute(
                  `INSERT INTO historial_incidencias 
                   (incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo)
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [incidenciaId, 'comentario', comentarista.id, `Comentario agregado`, null, null]
                );
                
                // Notificar al responsable y al que reportó (si no es el mismo)
                if (responsableId && responsableId !== comentarista.id) {
                  await connection.execute(
                    `INSERT INTO notificaciones (usuario_id, incidencia_id, tipo, titulo, mensaje, leida)
                     VALUES (?, ?, ?, ?, ?, FALSE)`,
                    [
                      responsableId,
                      incidenciaId,
                      'comentario',
                      'Nuevo comentario',
                      `${comentarista.nombre} comentó en la incidencia ${codigo}`
                    ]
                  );
                }
                if (reportadoPor.id !== comentarista.id && reportadoPor.id !== responsableId) {
                  await connection.execute(
                    `INSERT INTO notificaciones (usuario_id, incidencia_id, tipo, titulo, mensaje, leida)
                     VALUES (?, ?, ?, ?, ?, FALSE)`,
                    [
                      reportadoPor.id,
                      incidenciaId,
                      'comentario',
                      'Nuevo comentario',
                      `${comentarista.nombre} comentó en la incidencia ${codigo}`
                    ]
                  );
                }
              }
              estadisticas.conComentarios++;
              estadisticas.conNotificaciones += cantidadComentarios;
            }
          } catch (error) {
            console.error(`\n✗ Error al crear incidencia ${i + 1}:`, error.message);
            // Continuar con la siguiente
          }
        }
        
        // Commit del lote
        await connection.commit();
        process.stdout.write(`  Progreso: ${incidenciasCreadas}/${cantidadIncidencias} incidencias creadas...\r`);
        
      } catch (error) {
        await connection.rollback();
        console.error(`\n✗ Error en lote ${lote + 1}:`, error.message);
        // Continuar con el siguiente lote
      }
    }
    
    console.log(`\n\n✅ Seed completado exitosamente!\n`);
    console.log('📊 Estadísticas:');
    console.log(`  - Incidencias creadas: ${estadisticas.creadas}`);
    console.log(`  - Con responsable asignado: ${estadisticas.conResponsable}`);
    console.log(`  - Resueltas: ${estadisticas.resueltas}`);
    console.log(`  - Cerradas: ${estadisticas.cerradas}`);
    console.log(`  - Con comentarios: ${estadisticas.conComentarios}`);
    console.log(`  - Notificaciones creadas: ${estadisticas.conNotificaciones}\n`);
    
    // Mostrar resumen por estado
    const [resumenEstado] = await connection.execute(
      `SELECT estado, COUNT(*) as total 
       FROM incidencias 
       GROUP BY estado 
       ORDER BY estado`
    );
    
    console.log('📈 Distribución por estado:');
    resumenEstado.forEach(row => {
      console.log(`  - ${row.estado}: ${row.total}`);
    });
    
    // Mostrar resumen por prioridad
    const [resumenPrioridad] = await connection.execute(
      `SELECT p.nivel, COUNT(*) as total 
       FROM incidencias i
       JOIN prioridades p ON i.prioridad_id = p.id
       GROUP BY p.nivel 
       ORDER BY p.nivel`
    );
    
    console.log('\n📊 Distribución por prioridad:');
    resumenPrioridad.forEach(row => {
      console.log(`  - ${row.nivel}: ${row.total}`);
    });
    
    console.log('\n✨ ¡Base de datos lista para probar reportes y predicciones!\n');
    
  } catch (error) {
    await connection.rollback();
    console.error('✗ Error en seed:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

// Ejecutar seed
seedIncidencias().catch(error => {
  console.error('✗ Error fatal:', error);
  process.exit(1);
});

