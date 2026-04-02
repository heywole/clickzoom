import api from '../utils/api';

// Auth
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  googleAuth: () => { window.location.href = `https://clickzoom-production.up.railway.app/api/auth/google`; },
};

// User
export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  updatePreferences: (data) => api.put('/user/preferences', data),
  deleteAccount: () => api.delete('/user/account'),
};

// Tutorials
export const tutorialService = {
  create: (data) => api.post('/tutorials', data),
  getAll: (params) => api.get('/tutorials', { params }),
  getById: (id) => api.get(`/tutorials/${id}`),
  update: (id, data) => api.put(`/tutorials/${id}`, data),
  delete: (id) => api.delete(`/tutorials/${id}`),
  publish: (id) => api.post(`/tutorials/${id}/publish`),
  cancel: (id) => api.post(`/tutorials/${id}/cancel`),
  cancel: (id) => api.post(`/tutorials/${id}/cancel`),
  generate: (id, data) => api.post(`/tutorials/${id}/generate`, data),
};

// Tutorial Steps
export const stepService = {
  create: (tutorialId, data) => api.post(`/tutorials/${tutorialId}/steps`, data),
  getAll: (tutorialId) => api.get(`/tutorials/${tutorialId}/steps`),
  update: (tutorialId, stepId, data) => api.put(`/tutorials/${tutorialId}/steps/${stepId}`, data),
  delete: (tutorialId, stepId) => api.delete(`/tutorials/${tutorialId}/steps/${stepId}`),
  reorder: (tutorialId, data) => api.post(`/tutorials/${tutorialId}/steps/reorder`, data),
};

// Content
export const contentService = {
  getByTutorial: (tutorialId) => api.get(`/content/${tutorialId}`),
  getStatus: (tutorialId) => api.get(`/content/${tutorialId}/status`),
  retry: (tutorialId) => api.post(`/content/${tutorialId}/retry`),
  delete: (id) => api.delete(`/content/${id}`),
};

// Automation
export const automationService = {
  capture: (data) => api.post('/automate/capture', data),
  getStatus: (jobId) => api.get(`/automate/status/${jobId}`),
  cancel: (jobId) => api.post(`/automate/cancel/${jobId}`),
};

// Voice
export const voiceService = {
  getOptions: () => api.get('/voice/options'),
  preview: (data) => api.post('/voice/preview', data),
  getLanguages: () => api.get('/language/list'),
};

// Wallet
export const walletService = {
  getStatus: () => api.get('/wallet/status'),
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  updateLimits: (data) => api.put('/wallet/limits', data),
};
