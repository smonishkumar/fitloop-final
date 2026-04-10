import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#060c1d] selection:bg-primary/20 overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0 relative">
        <Header />
        <main className="flex-1 pt-20 overflow-y-auto relative custom-scrollbar">
          <div className="section-container py-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
