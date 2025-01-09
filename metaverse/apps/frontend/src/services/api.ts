// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { SignupInput, SigninInput } from '../types';

const BACKEND_URL = 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data: SignupInput) => api.post('/signup', data),
  signin: (data: SigninInput) => api.post('/signin', data),
  logout: () => api.post('/logout'),
};