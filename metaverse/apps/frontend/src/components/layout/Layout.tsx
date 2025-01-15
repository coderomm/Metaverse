// src/components/layout/Layout.tsx
import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPlayPage = location.pathname === '/play';

  return (
    <div className="flex flex-col min-h-screen">
      {!isPlayPage && <Navbar />}
      <main className={`flex-grow ${isPlayPage ? 'h-screen' : ''}`}>
        {children}
      </main>
      {!isPlayPage && <Footer />}
    </div>
  );
};