// src/components/layout/Layout.tsx
import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let isHide = false;
  const location = useLocation();
  if (location.pathname === '/accounts/signin' || location.pathname === '/accounts/signup' || location.pathname === '/play') {
    isHide = true;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isHide && <Navbar />}
      <main className={`flex-grow ${isHide ? 'h-screen' : ''}`}>
        {children}
      </main>
      {!isHide && <Footer />}
    </div>
  );
};