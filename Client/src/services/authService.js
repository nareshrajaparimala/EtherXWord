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
      if (credentials.rememberMe) {
        // Store in localStorage for persistent login
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userProfile', JSON.stringify(response.data.user));
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Store in sessionStorage for session-only login
        sessionStorage.setItem('accessToken', response.data.accessToken);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        sessionStorage.setItem('userProfile', JSON.stringify(response.data.user));
        localStorage.removeItem('rememberMe');
        // Clear any existing localStorage tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
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
    localStorage.removeItem('userProfile');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('savedEmail');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userProfile');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken') || !!sessionStorage.getItem('accessToken');
  },

  getToken: () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  },

  getUserProfile: () => {
    const profile = localStorage.getItem('userProfile') || sessionStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  }
};