import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from "framer-motion"

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 20) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }
  })

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
    <motion.header
      animate={{
        y: isScrolled ? 16 : 0,
        backgroundColor: isScrolled ? "#ffffff" : "#ffffff",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed wrapper top-0 z-50 flex items-center gap-2 p-4 md:px-12 w-full mx-auto">
      <div className="flex max-w-7xl w-full justify-between mx-auto bg-[#f3f4f626] shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-[#1118271a] p-6 rounded-2xl">
        <Link to={user?.email ? '/home/spaces' : '/'} className="flex items-center justify-start text-purple-500 text-3xl md:text-5xl font-bold m-0">Towny</Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div
                ref={dropdownRef}
                className="relative group"
                onClick={() => {
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
                  <Link to="/accounts/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
              <Link to="/accounts/signin" className="text-[#6758ff] bg-[#f3f2ff] hover:bg-[#e9e8ff] px-3 font-semibold text-[14px] h-10 rounded-lg inline-flex items-center justify-center outline-none">Sign In</Link>
              <Link to="/accounts/signup" className="text-[#ffffff] bg-[#6758ff] hover:bg-[#5246cc] px-3 font-semibold text-[14px] h-10 rounded-lg inline-flex items-center justify-center outline-none">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};