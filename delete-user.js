const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteUser() {
  try {
    // Primero verificamos si el usuario existe
    const user = await prisma.user.findUnique({
      where: {
        email: 'anthony@arrebol.com.mx'
      }
    })

    if (user) {
      console.log('Usuario encontrado:', user)
      
      // Eliminar el usuario
      await prisma.user.delete({
        where: {
          email: 'anthony@arrebol.com.mx'
        }
      })
      
      console.log('✅ Usuario anthony@arrebol.com.mx eliminado exitosamente')
    } else {
      console.log('❌ Usuario anthony@arrebol.com.mx no encontrado')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteUser()
