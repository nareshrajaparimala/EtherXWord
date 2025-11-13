import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5030';

export const authService = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  signin: async (credentials) => {
    const response = await api.post('/auth/signin', credentials);
    if (response.data.accessToken) {
      const storage = credentials.rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', response.data.accessToken);
      storage.setItem('refreshToken', response.data.refreshToken);
      storage.setItem('userProfile', JSON.stringify(response.data.user));
      
      // Also save to localStorage for compatibility
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userProfile', JSON.stringify(response.data.user));
      
      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      window.dispatchEvent(new Event('storage'));
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (newPassword, confirmPassword, resetToken) => {
    const response = await api.post('/auth/reset-password', 
      { newPassword, confirmPassword },
      { headers: { Authorization: `Bearer ${resetToken}` } }
    );
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  }
};