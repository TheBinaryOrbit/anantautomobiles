import axios from 'axios';

const BASE_URL =  'https://backend.yaytech.in/api';  

const api = axios.create({ baseURL: BASE_URL });

// Attach token from sessionStorage on every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('bs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error shape
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err?.message || 'Unknown error';
    return Promise.reject(new Error(msg));
  }
);

export default api;
