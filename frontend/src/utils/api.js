import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const submitReport = (formData) => api.post('/api/reports', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getAllReports = (params) => api.get('/api/reports', { params });
export const getReportById = (id) => api.get(`/api/reports/${id}`);
export const updateReport = (id, data) => api.put(`/api/reports/${id}`, data);
export const deleteReport = (id) => api.delete(`/api/reports/${id}`);
export const getMediaUrl = (path) => `${API_BASE}/uploads/${path}`;

export default api;
