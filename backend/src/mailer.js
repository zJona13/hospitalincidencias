import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const HOSPITAL = 'Hospital Luis Heysen Incháustegui';

// Si no hay SMTP configurado, el enlace se imprime en consola en vez de enviarse.
// Así el flujo es probable en desarrollo sin depender de un servidor de correo.
const smtpConfigurado = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

let transporter = null;

if (smtpConfigurado) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const plantillaRecuperacion = (nombre, enlace) => `
<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f9fafb;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1d2530;">
  <table role="presentation" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #dadfe7;border-radius:12px;border-collapse:separate;">
    <tr><td style="padding:32px;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#116fd4;">${HOSPITAL}</p>
      <h1 style="margin:0 0 16px 0;font-size:22px;line-height:30px;">Restablece tu contraseña</h1>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;">Hola ${nombre}, recibimos una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Gestión de Incidencias.</p>
      <p style="margin:0 0 24px 0;">
        <a href="${enlace}" style="display:inline-block;padding:13px 24px;background:#116fd4;color:#ffffff;font-size:15px;font-weight:500;text-decoration:none;border-radius:10px;">Crear nueva contraseña</a>
      </p>
      <p style="margin:0 0 16px 0;font-size:13px;line-height:20px;color:#627084;">El enlace vence a los 30 minutos y solo puede usarse una vez. Si no funciona, copia esta dirección en tu navegador:</p>
      <p style="margin:0 0 24px 0;font-size:12px;line-height:18px;color:#116fd4;word-break:break-all;">${enlace}</p>
      <p style="margin:0;padding-top:20px;border-top:1px solid #dadfe7;font-size:13px;line-height:20px;color:#627084;">Si no solicitaste este cambio, ignora este correo: tu contraseña actual sigue vigente.</p>
    </td></tr>
  </table>
</body>
</html>`;

export const enviarCorreoRecuperacion = async (destinatario, nombre, enlace) => {
  if (!transporter) {
    console.log('\n──────────────────────────────────────────────');
    console.log('SMTP no configurado. Enlace de recuperación:');
    console.log(`  Para: ${destinatario}`);
    console.log(`  ${enlace}`);
    console.log('──────────────────────────────────────────────\n');
    return { enviado: false, motivo: 'smtp_no_configurado' };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"${HOSPITAL}" <${process.env.SMTP_USER}>`,
    to: destinatario,
    subject: 'Restablece tu contraseña - Sistema de Gestión de Incidencias',
    html: plantillaRecuperacion(nombre, enlace),
    text: `Hola ${nombre}, para restablecer tu contraseña ingresa a: ${enlace}\n\nEl enlace vence a los 30 minutos y solo puede usarse una vez. Si no solicitaste este cambio, ignora este correo.`,
  });

  return { enviado: true };
};
