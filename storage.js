const StorageApp = {
  saveProfile(profileData) {
    localStorage.setItem('nutrio_profile', JSON.stringify(profileData));
  },
  getProfile() {
    const profile = localStorage.getItem('nutrio_profile');
    return profile ? JSON.parse(profile) : null;
  },
  saveLog(logData) {
    localStorage.setItem('nutrio_today_log', JSON.stringify(logData));
  },
  getLog() {
    const log = localStorage.getItem('nutrio_today_log');
    return log ? JSON.parse(log) : { kcal: 0, protein: 0, carbs: 0, fat: 0, items: [] };
  },
  saveCart(cartData) {
    localStorage.setItem('nutrio_cart', JSON.stringify(cartData));
  },
  getCart() {
    const cart = localStorage.getItem('nutrio_cart');
    return cart ? JSON.parse(cart) : [];
  },
  clearAll() {
    localStorage.removeItem('nutrio_profile');
    localStorage.removeItem('nutrio_today_log');
    localStorage.removeItem('nutrio_cart');
  }
};
