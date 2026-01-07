// Local Storage Helpers

export const setToken = (token) => {
  try {
    localStorage.setItem('token', token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

export const setUser = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = () => {
  try {
    localStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

export const setItem = (key, value) => {
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return defaultValue;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};
