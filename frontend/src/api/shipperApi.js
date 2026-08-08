import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const shipperApi = {
  async getAvailable() {
    try {
      const response = await axiosClient.get("/shipper/available");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch available deliveries");
      throw error;
    }
  },

  async getMyDeliveries() {
    try {
      const response = await axiosClient.get("/shipper/my-deliveries");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch your deliveries");
      throw error;
    }
  },

  async getDelivery(orderId) {
    try {
      const response = await axiosClient.get(`/shipper/${orderId}`);

      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch delivery details");

      throw error;
    }
  },

  async accept(orderId) {
    try {
      const response = await axiosClient.post(`/shipper/${orderId}/accept`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to accept delivery");
      throw error;
    }
  },

  async updateStatus(orderId, status) {
    try {
      const response = await axiosClient.patch(`/shipper/${orderId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to update delivery status");
      throw error;
    }
  },

  async failDelivery(orderId, reason) {
    try {
      const response = await axiosClient.patch(`/shipper/${orderId}/failure`, {
        reason,
      });

      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to mark delivery as failed");

      throw error;
    }
  },
};
