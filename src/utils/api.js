// src/utils/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://signature-server-5olu.onrender.com',
   withCredentials: true,
});

// 🔐 Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⚠️ Handle 401 Unauthorized (token expired or invalid)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔐 Session expired. Logging out...');
      localStorage.removeItem('token');
      window.location.href = '/'; // Redirect to login
    }

    // Optionally handle retries
    // if (error.response?.status >= 500 && !error.config._retry) {
    //   error.config._retry = true;
    //   return API(error.config); // Retry once
    // }

    return Promise.reject(error);
  }
);

export default API;
