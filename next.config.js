/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  // Optimizar para producción
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuración para deployment
  output: 'standalone',
  
  // Variables de entorno públicas
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }
}

module.exports = nextConfig
