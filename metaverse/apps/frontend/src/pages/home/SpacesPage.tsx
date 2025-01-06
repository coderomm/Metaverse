// src/pages/home/SpacesPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const SpacesPage = () => {
  const { isAuthenticated } = useAuth();
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch spaces data
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-purple-600 sm:text-5xl md:text-6xl">
          Welcome to Your ZEP Space
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Explore and create in your personal metaverse space.
        </p>
      </div>
    </div>
  );
};
