// src/api/leaseApi.js
import axiosInstance from './axios';

export const leaseApi = {
  // ✅ FIXED - Use /leases not /landlord/leases
  getLeases: async () => {
    const response = await axiosInstance.get('/leases');
    return response.data;
  },

  getLease: async (id) => {
    const response = await axiosInstance.get(`/leases/${id}`);
    return response.data;
  },

  // ✅ FIXED - Changed from /landlord/leases to /leases
  createLease: async (leaseData) => {
    const response = await axiosInstance.post('/leases', leaseData);
    return response.data;
  },

  // ✅ FIXED - Changed from /landlord/leases to /leases
  updateLease: async (id, leaseData) => {
    const response = await axiosInstance.put(`/leases/${id}`, leaseData);
    return response.data;
  },

  // ✅ FIXED - Changed from /landlord/leases to /leases
  terminateLease: async (id, terminationData) => {
    const response = await axiosInstance.post(`/leases/${id}/terminate`, terminationData);
    return response.data;
  },

  generateLeasePDF: async (id) => {
    const response = await axiosInstance.get(`/leases/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // For tenant dashboard
  getTenantLease: async () => {
    const response = await axiosInstance.get('/leases/my-active-lease');
    return response.data;
  },
};
