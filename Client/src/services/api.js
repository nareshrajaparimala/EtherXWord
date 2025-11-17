import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5030';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken
          });
          
          // Store new token in the same storage as the refresh token
          if (localStorage.getItem('refreshToken')) {
            localStorage.setItem('accessToken', response.data.accessToken);
          } else {
            sessionStorage.setItem('accessToken', response.data.accessToken);
          }
          
          return api.request(error.config);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userProfile');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('userProfile');
          window.location.href = '/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;