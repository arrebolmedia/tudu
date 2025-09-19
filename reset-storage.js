// Limpiar localStorage para resetear colores de listas
if (typeof window !== 'undefined') {
  localStorage.removeItem('tudu-lists');
  localStorage.removeItem('tudu-tasks');
  console.log('Storage limpiado - recarga la página');
}
