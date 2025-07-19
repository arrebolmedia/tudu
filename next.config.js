/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  // Configuración crítica para deployment
  output: 'standalone',
  
  // Optimizaciones
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // Variables de entorno
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }
}

module.exports = nextConfig
