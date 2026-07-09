const StorageApp = {
  // Guarda los datos del perfil calculados en el cuestionario
  saveProfile(profileData) {
    localStorage.setItem('nutrio_profile', JSON.stringify(profileData));
  },
  // Obtiene los datos del perfil guardados (si no existen, devuelve null)
  getProfile() {
    const profile = localStorage.getItem('nutrio_profile');
    return profile ? JSON.parse(profile) : null;
  },
  // Guarda la lista de ingredientes del supermercado de forma dinámica
  saveCart(cartData) {
    localStorage.setItem('nutrio_cart', JSON.stringify(cartData));
  },
  // Obtiene los ingredientes guardados (si no existen, devuelve un arreglo vacío)
  getCart() {
    const cart = localStorage.getItem('nutrio_cart');
    return cart ? JSON.parse(cart) : [];
  },
  // Borra por completo la memoria local para reiniciar la aplicación desde cero
  clearAll() {
    localStorage.removeItem('nutrio_profile');
    localStorage.removeItem('nutrio_cart');
  }
};
