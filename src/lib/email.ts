import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verifica tu cuenta - Tasks by Arrebol Weddings',
    html: generateVerificationEmailHTML(name, verificationUrl),
  }

  await transporter.sendMail(mailOptions)
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Restablecer contraseña - Tasks by Arrebol Weddings',
    html: generatePasswordResetEmailHTML(name, resetUrl),
  }

  await transporter.sendMail(mailOptions)
}

export function generateVerificationEmailHTML(name: string, verificationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verifica tu cuenta - Tasks by Arrebol Weddings</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
        .logo { display: inline-flex; align-items: center; gap: 10px; }
        .logo-icon { 
          width: 48px; 
          height: 48px; 
          background: linear-gradient(135deg, #d87254, #c85a3a); 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          position: relative;
        }
        .content { padding: 30px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #d87254, #c85a3a); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <div class="logo-icon">
              <!-- Icono de check en cuadrado -->
              <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/>
                <path d="m9 11 3 3L22 4"/>
              </svg>
              <!-- Estrella/sparkle dorada en la esquina -->
              <svg width="16" height="16" fill="#fbbf24" stroke="#fbbf24" stroke-width="1" viewBox="0 0 24 24" style="position: absolute; top: -4px; right: -4px;">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: bold; font-size: 18px;">Tasks by Arrebol Weddings</div>
              <div style="font-size: 14px; color: #666;">Gestión elegante para tu día especial</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          <h1>¡Bienvenido a Tasks by Arrebol Weddings, ${name}!</h1>
          <p>Gracias por registrarte en nuestro sistema especializado de gestión de tareas para bodas y eventos.</p>
          <p>Para completar tu registro y comenzar a organizar tus pendientes, necesitamos verificar tu dirección de email.</p>
          <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
          <p><small>Este enlace expirará en 24 horas por seguridad.</small></p>
        </div>
        
        <div class="footer">
          <p>© 2025 Tudú - Gestor de Tareas. Todos los derechos reservados.</p>
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generatePasswordResetEmailHTML(name: string, resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Restablecer contraseña - Tasks by Arrebol Weddings</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
        .logo { display: inline-flex; align-items: center; gap: 10px; }
        .logo-icon { 
          width: 48px; 
          height: 48px; 
          background: linear-gradient(135deg, #d87254, #c85a3a); 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          position: relative;
        }
        .content { padding: 30px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <div class="logo-icon">
              <!-- Icono de check en cuadrado -->
              <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/>
                <path d="m9 11 3 3L22 4"/>
              </svg>
              <!-- Estrella/sparkle dorada en la esquina -->
              <svg width="16" height="16" fill="#fbbf24" stroke="#fbbf24" stroke-width="1" viewBox="0 0 24 24" style="position: absolute; top: -4px; right: -4px;">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: bold; font-size: 18px;">Tasks by Arrebol Weddings</div>
              <div style="font-size: 14px; color: #666;">Gestión elegante para tu día especial</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          <h1>¡Hola ${name}!</h1>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Tasks by Arrebol Weddings.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
          <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
          <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          <p><small>Este enlace expirará en 1 hora por seguridad.</small></p>
        </div>
        
        <div class="footer">
          <p>© 2025 Tasks by Arrebol Weddings. Todos los derechos reservados.</p>
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
