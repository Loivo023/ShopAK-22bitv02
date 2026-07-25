import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const usersApi = {
  async getAll() {
    try {
      const response = await axiosClient.get("/users");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch users");
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await axiosClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch user details");
      throw error;
    }
  },

  async updateRole(id, role) {
    try {
      const response = await axiosClient.patch(`/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to update user role");
      throw error;
    }
  },
};
