import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:3000",
});

export default api;