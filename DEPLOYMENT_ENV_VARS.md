# Variables de entorno para DigitalOcean App Platform

## Variables REQUERIDAS para el deployment:

NEXTAUTH_SECRET=f4c5284e7554a6061b382585bc77929e24930f16d49f93070726420da1224137
NEXTAUTH_URL=${APP_URL}
NODE_ENV=production

## La DATABASE_URL se generará automáticamente cuando conectes la base de datos

## Variables opcionales (puedes agregarlas después):
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=tu-email@gmail.com
# SMTP_PASS=tu-app-password
