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

  fetchWardrobe: async (user_id) => {
    const res = await fetch(`${API_BASE_URL}/wardrobe/${user_id}`);
    if (!res.ok) throw new Error('Failed to fetch wardrobe');
    return res.json();
  },

  addToWardrobe: async (itemData) => {
    const res = await fetch(`${API_BASE_URL}/wardrobe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Failed to add wardrobe item');
    return res.json();
  },

  fetchDashboardOverview: async () => {
    const analytics = await api.fetchAnalyticsSummary();
    return analytics;
  },

  generateRecommendations: async (user_id) => {
    const res = await fetch(`${API_BASE_URL}/recommendations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to generate recommendations');
    }
    return res.json();
  }
};

export default api;
