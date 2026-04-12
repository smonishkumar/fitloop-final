import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  maxRedirects: 5,
});

// Add auth token request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitloop_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
};

export const productService = {
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
};

export const wardrobeService = {
  getWardrobe: () => apiClient.get('/wardrobe'),
  addToWardrobe: (item) => apiClient.post('/wardrobe', item),
  removeFromWardrobe: (id) => apiClient.delete(`/wardrobe/${id}`),
};

export const measurementService = {
  getLatest: (userId) => apiClient.get(`/measurements/${userId}`),
  saveMeasurements: (data) => apiClient.post('/measurements', data),
  scanBody: (file, metadata = {}, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.height_cm !== undefined && metadata.height_cm !== null) {
      formData.append('height_cm', String(metadata.height_cm));
    }
    if (metadata.weight_kg !== undefined && metadata.weight_kg !== null) {
      formData.append('weight_kg', String(metadata.weight_kg));
    }
    if (metadata.gender) {
      formData.append('gender', metadata.gender);
    }
    if (metadata.body_type) {
      formData.append('body_type', metadata.body_type);
    }

    return apiClient.post('/measurements/scan', formData, {
      signal: options.signal,
    });
  }
};

export const fitScoreService = {
  calculate: (itemId) => apiClient.post('/fitscore', { item_id: itemId }),
};

export const cartService = {
  getCart: () => apiClient.get('/cart'),
  addToCart: (item) => apiClient.post('/cart/add', item),
  removeFromCart: (id) => apiClient.delete(`/cart/${id}`),
};

// Backward compatibility or generic export if needed
const api = {
  fetchProducts: async () => {
    try {
      const res = await apiClient.get('/products');
      return res.data || [];
    } catch {
      return [];
    }
  },
  fetchOrders: async () => {
    try {
      const res = await apiClient.get('/orders');
      return res.data || [];
    } catch {
      return [];
    }
  },
  fetchAnalyticsSummary: async () => {
    try {
      const res = await apiClient.get('/analytics/summary');
      return res.data;
    } catch {
      return null;
    }
  },
  fetchWardrobe: async () => {
    try {
      const res = await apiClient.get('/wardrobe');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },
  fetchDashboardOverview: async () => {
    try {
      const res = await apiClient.get('/analytics/summary');
      return res.data;
    } catch {
      return null;
    }
  }
};

export default api;
