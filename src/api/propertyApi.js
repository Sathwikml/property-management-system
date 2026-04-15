import axiosInstance from './axios';

export const propertyApi = {
  getProperties: async () => {
    const response = await axiosInstance.get('/properties');
    return response.data;
  },

  getProperty: async (id) => {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data;
  },

  // ✅ MUST use /landlord/properties
  createProperty: async (propertyData) => {
    const response = await axiosInstance.post('/landlord/properties', propertyData);
    return response.data;
  },

  // ✅ MUST use /landlord/properties
  updateProperty: async (id, propertyData) => {
    const response = await axiosInstance.put(`/landlord/properties/${id}`, propertyData);
    return response.data;
  },

  // ✅ MUST use /landlord/properties
  deleteProperty: async (id) => {
    const response = await axiosInstance.delete(`/landlord/properties/${id}`);
    return response.data;
  },

  uploadImages: async (id, formData) => {
    const response = await axiosInstance.post(`/landlord/properties/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};