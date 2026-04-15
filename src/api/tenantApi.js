import axiosInstance from './axios';

export const tenantApi = {
  getTenants: async () => {
    const response = await axiosInstance.get('/landlord/tenants');
    return response.data;
  },

  getTenant: async (id) => {
    const response = await axiosInstance.get(`/landlord/tenants/${id}`);
    return response.data;
  },

  sendNotice: async (tenantId, noticeData) => {
    const response = await axiosInstance.post(`/landlord/tenants/${tenantId}/notice`, noticeData);
    return response.data;
  },

  deleteTenant: async (id) => {
    const response = await axiosInstance.delete(`/landlord/tenants/${id}`);
    return response.data;
  }
};