import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-md">
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
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div
                  ref={dropdownRef}
                  className="relative group"
                  onClick={() => {
                    // Only toggle dropdown on mobile
                    if (window.innerWidth < 1024) {
                      setIsDropdownOpen(!isDropdownOpen);
                    }
                  }}
                >
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2">
                    <img src={user?.imageUrl} className="w-10 h-10 rounded-full shadow-2xl shadow-purple-500" alt="User" />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={`absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-md py-1 ring-1 ring-black ring-opacity-5 
                      ${isDropdownOpen ? 'block lg:hidden' : 'hidden'} 
                      lg:group-hover:block transition-all duration-200 ease-in-out`}
                  >
                    <div className="px-4 py-2 border-b">
                      <p className="text-base text-purple-500">{user?.email} | <span className='text-gray-950'>{user?.role === 'Admin' ? user.role : ''}</span></p>
                    </div>
                    {user?.role === "Admin" && (
                      <>
                        <Link to="/admin/avatar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Create Avatar
                        </Link>
                        <Link to="/admin/element" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Create Elements
                        </Link>
                        <Link to="/admin/map" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Create Map
                        </Link>
                      </>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <div className="border-t">
                      <button
                        onClick={logout}
                        className="flex items-center justify-start gap-1 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4" />Log out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/accounts/signin" className="text-gray-700 hover:text-gray-900 px-3 py-2">Sign In</Link>
                <Link to="/accounts/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};