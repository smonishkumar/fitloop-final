import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import BodyIntelligence from './pages/BodyIntelligence';
import Wardrobe from './pages/Wardrobe';
import OutfitEngine from './pages/OutfitEngine';
import SmartShopping from './pages/SmartShopping';
import VirtualTryOn from './pages/VirtualTryOn';
import Products from './pages/Products';
import Orders from './pages/Orders';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="body-intelligence" element={<BodyIntelligence />} />
            <Route path="wardrobe" element={<Wardrobe />} />
            <Route path="outfit-engine" element={<OutfitEngine />} />
            <Route path="smart-shopping" element={<SmartShopping />} />
            <Route path="virtual-try-on" element={<VirtualTryOn />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
