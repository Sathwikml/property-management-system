import axiosInstance from './axios';

export const paymentApi = {
  /**
   * Get all payments with optional filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} Payment list
   */
  getPayments: async (params) => {
    const response = await axiosInstance.get('/payments', { params });
    return response.data;
  },

  /**
   * Get a single payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise} Payment details
   */
  getPayment: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  },

  /**
   * Create a new payment
   * @param {Object} paymentData - Payment information
   * @returns {Promise} Created payment
   */
  createPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments', paymentData);
    return response.data;
  },

  /**
   * Submit a payment for processing
   * @param {number} paymentId - Payment ID
   * @param {Object} paymentData - Additional payment data
   * @returns {Promise} Submitted payment
   */
  submitPayment: async (paymentId, paymentData) => {
    const response = await axiosInstance.post('/payments/submit', {
      paymentId,
      ...paymentData
    });
    return response.data;
  },

  /**
   * Update payment status
   * @param {number} id - Payment ID
   * @param {string} status - New payment status
   * @returns {Promise} Updated payment
   */
  updatePaymentStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/payments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get all payments for the current tenant
   * @returns {Promise} Tenant's payment list
   */
  getTenantPayments: async () => {
    const response = await axiosInstance.get('/tenant/payments');
    return response.data;
  },

  /**
   * Get upcoming payments
   * @returns {Promise} Upcoming payment list
   */
  getUpcomingPayments: async () => {
    const response = await axiosInstance.get('/payments/upcoming');
    return response.data;
  },

  /**
   * Record a payment
   * @param {Object} paymentData - Payment record data
   * @returns {Promise} Recorded payment
   */
  recordPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/record', paymentData);
    return response.data;
  },

  /**
   * Generate payment receipt
   * @param {number} id - Payment ID
   * @returns {Promise<Blob>} Receipt file blob
   */
  generateReceipt: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Delete a payment
   * @param {number} id - Payment ID
   * @returns {Promise} Deletion confirmation
   */
  deletePayment: async (id) => {
    const response = await axiosInstance.delete(`/payments/${id}`);
    return response.data;
  },

  /**
   * Get payment statistics
   * @param {Object} params - Query parameters (e.g., date range)
   * @returns {Promise} Payment statistics
   */
  getPaymentStats: async (params) => {
    const response = await axiosInstance.get('/payments/stats', { params });
    return response.data;
  },

  /**
   * Get overdue payments
   * @returns {Promise} Overdue payment list
   */
  getOverduePayments: async () => {
    const response = await axiosInstance.get('/payments/overdue');
    return response.data;
  },
};
