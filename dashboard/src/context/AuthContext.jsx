import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// A static demo token - the backend will accept this in demo mode
const DEMO_TOKEN = 'demo-token-fitloop-2024';
const DEMO_USER = {
  name: 'XYZ',
  role: 'Pro Plan',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDysVj_9v_RR3uqelJ60d91icVlkBHnWNT0A_cTQWd_0Xv6boyx6dccR_9QaH97I5P8sifzyiMv8B8eJRz-vuayOwjXi5DCF2JxqrgAu0vu0hUW5J0bvQ-ZM-b4s3_ImNMNoxrQZTOf4Cx0Sq-2xEA3qSEffzFcVvrX71lIIS_MjUQdTTMFeuxnSoS6oH46BHGwpCOhXDPjYvqFIeLl8mB3WJ3JRGtg6374wo4j45JihpnSv09okvEZjXxszYvBjsepXMQe_aV9sA'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const token = localStorage.getItem('fitloop_auth_token');
    const savedUser = localStorage.getItem('fitloop_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(DEMO_USER);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const userToStore = userData || DEMO_USER;
    setUser(userToStore);
    // Store demo token so the API interceptor can use it
    localStorage.setItem('fitloop_auth_token', DEMO_TOKEN);
    localStorage.setItem('fitloop_user', JSON.stringify(userToStore));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitloop_auth_token');
    localStorage.removeItem('fitloop_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

