// src/utils/auth.ts
export const authUtils = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token: string) => localStorage.setItem('token', token),
    removeToken: () => localStorage.removeItem('token'),
    isAuthenticated: () => !!localStorage.getItem('token')
  };