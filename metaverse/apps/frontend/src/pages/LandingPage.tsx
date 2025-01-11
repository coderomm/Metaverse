import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  if (isAuthenticated) {
    return <Navigate to="/home/spaces" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text--highlight sm:text-5xl md:text-6xl">
          Easy and Fun Metaverse, <span className="text-purple-500">Meety</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Join our community and explore the endless possibilities of the metaverse.
        </p>
      </div>
    </div>
  );
};