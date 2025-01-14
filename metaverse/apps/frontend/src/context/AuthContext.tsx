import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { User } from '../types';
import { toast } from 'sonner';
import SpinLoader from '../components/ui/SpinLoader';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (toke: string, user: User) => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const { data } = await authApi.getMe();
      setUser(data.user);
      setIsAuthenticated(true);
      toast.info('Hello ' + data.user.email)
    } catch (error) {
      console.error('Error fetching current user:', error);
      toast.error('Error fetching current user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    navigate('/home/spaces');
    toast.info('Hello ' + userData.email)
  };

  const logout = async () => {
    try {
      await authApi.logout();
      toast.info('Logout successful')
    } catch (error) {
      console.error('Logout error:', error);
      toast.info('Logout error: ' + error)
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-dvh my-8">
      <SpinLoader />
    </div>
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};