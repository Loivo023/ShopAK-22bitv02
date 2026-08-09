import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const authApi = {
  async register(data) {
    try {
      const response = await axiosClient.post("/register", data);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to register");
      throw error;
    }
  },

  async login(data) {
    try {
      const response = await axiosClient.post("/login", data);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to login");
      throw error;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await axiosClient.post("/forgot-password", null, {
        params: { email },
      });

      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to request password reset");
      throw error;
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await axiosClient.post("/reset-password", null, {
        params: {
          token,
          new_password: newPassword,
        },
      });

      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to reset password");
      throw error;
    }
  },
};
