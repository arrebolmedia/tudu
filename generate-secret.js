// Generar clave secreta para NextAuth
const crypto = require('crypto');
console.log('NEXTAUTH_SECRET:', crypto.randomBytes(32).toString('hex'));
