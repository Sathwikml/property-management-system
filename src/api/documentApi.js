import axiosInstance from './axios';

export const documentApi = {
  getDocuments: async (params) => {
    const response = await axiosInstance.get('/documents', { params });
    return response.data;
  },

  getDocument: async (id) => {
    const response = await axiosInstance.get(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (formData) => {
    const response = await axiosInstance.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadDocument: async (id) => {
    const response = await axiosInstance.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await axiosInstance.delete(`/documents/${id}`);
    return response.data;
  },

  getLeaseDocuments: async (leaseId) => {
    const response = await axiosInstance.get(`/documents/lease/${leaseId}`);
    return response.data;
  },

  getPropertyDocuments: async (propertyId) => {
    const response = await axiosInstance.get(`/documents/property/${propertyId}`);
    return response.data;
  },
};