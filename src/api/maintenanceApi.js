// src/api/maintenanceApi.js
import axiosInstance from './axios';

export const maintenanceApi = {
  getRequests: async (params) => {
    const response = await axiosInstance.get('/maintenance', { params });
    return response.data;
  },

  getRequest: async (id) => {
    const response = await axiosInstance.get(`/maintenance/${id}`);
    return response.data;
  },

  // ✅ Send JSON, not FormData
  createRequest: async (requestData) => {
    const response = await axiosInstance.post('/maintenance', requestData);
    return response.data;
  },

  updateRequest: async (id, requestData) => {
    const response = await axiosInstance.put(`/maintenance/${id}`, requestData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/maintenance/${id}/status`, { status });
    return response.data;
  },

  // ✅ Fixed endpoint
  getTenantRequests: async () => {
    const response = await axiosInstance.get('/tenant/maintenance');
    return response.data;
  },
};
