const API_BASE_URL = 'http://localhost:8000';

const api = {
  fetchProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products/`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  fetchOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders/`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  fetchAnalyticsSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  fetchWardrobe: async () => {
    const res = await fetch(`${API_BASE_URL}/wardrobe/`);
    if (!res.ok) throw new Error('Failed to fetch wardrobe');
    return res.json();
  },

  fetchDashboardOverview: async () => {
    // This could be a specialized endpoint or a combination of others
    const analytics = await api.fetchAnalyticsSummary();
    return analytics;
  }
};

export default api;
