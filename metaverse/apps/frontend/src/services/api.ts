// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { SignupInput, SigninInput } from '../utils/types';
import { toast } from 'sonner';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

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
  (error) => {
    console.error(error instanceof AxiosError ? error?.response?.data.message : error instanceof Error ? error.message : 'Some Brutal Error');
    toast.error(error instanceof AxiosError ? error?.response?.data.message : error instanceof Error ? error.message : 'Some Brutal Error');
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data: SignupInput) => api.post('/accounts/signup', data),
  signin: (data: SigninInput) => api.post('/accounts/signin', data),
  getMe: () => api.get('/user/me'),
  logout: () => api.post('/logout'),
};