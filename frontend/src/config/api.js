import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://khalafiati.io/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access denied');
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (formData) => api.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleBan: (id) => api.patch(`/users/${id}/ban`),
};

export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  uploadThumbnail: (id, formData) => api.post(`/categories/${id}/thumbnail`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const imagesAPI = {
  getAll: (params) => api.get('/images', { params }),
  getById: (id) => api.get(`/images/${id}`),
  upload: (formData) => api.post('/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, data) => api.put(`/images/${id}`, data),
  delete: (id) => api.delete(`/images/${id}`),
  move: (id, categoryId) => api.patch(`/images/${id}/move`, { categoryId }),
  like: (id) => api.post(`/images/${id}/like`),
  unlike: (id) => api.delete(`/images/${id}/like`),
  getMostLiked: (params) => api.get('/images/most-liked', { params }),
  getLatest: (params) => api.get('/images/latest', { params }),
  getFeatured: (params) => api.get('/images/featured', { params }),
  getPopular: (params) => api.get('/images/popular', { params }),
};

export const statsAPI = {
  getDashboard: () => api.get('/dashboard/stats'),
  getUserGrowth: (days = 30) => api.get(`/dashboard/user-growth?days=${days}`),
  getUploadTrends: (days = 30) => api.get(`/dashboard/upload-trends?days=${days}`),
  getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
  getTopContributors: (limit = 10) => api.get(`/dashboard/top-contributors?limit=${limit}`),
  getRecentActivities: (limit = 20) => api.get(`/dashboard/recent-activities?limit=${limit}`),
  getPopularContent: () => api.get('/dashboard/popular-content'),
  getSystemHealth: () => api.get('/dashboard/system-health'),
};

export const likesAPI = {
  toggleLike: (imageId) => api.post(`/likes/images/${imageId}/like`),
  getMyLikes: (params) => api.get('/likes/my-likes', { params }),
  checkLikeStatus: (imageId) => api.get(`/likes/images/${imageId}/like/status`),
  getImageLikes: (imageId, params) => api.get(`/likes/images/${imageId}/likes`, { params }),
};

export const reportsAPI = {
  create: (data) => api.post('/reports', data),
  getMyReports: (params) => api.get('/reports/my-reports', { params }),
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  updateStatus: (id, data) => api.patch(`/reports/${id}/status`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  getByKey: (key) => api.get(`/settings/${key}`),
  update: (key, data) => api.put(`/settings/${key}`, data),
  delete: (key) => api.delete(`/settings/${key}`),
  initialize: () => api.post('/settings/init'),
};

export default api;
