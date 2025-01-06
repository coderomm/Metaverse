import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-auto px-6 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Meety</span>
              </div>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link to="#" className="text-gray-700 hover:text-gray-900 px-3 py-2">About</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/home/spaces" className="text-gray-700 hover:text-gray-900 px-3 py-2">Home</Link>
                <button onClick={logout} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">Logout</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-gray-700 hover:text-gray-900 px-3 py-2">Sign In</Link>
                <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};