// src/api/productsApi.js
import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const productsApi = {
  async getAll(params = {}) {
    try {
      const response = await axiosClient.get("/products", { params });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch products");
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch product details");
      throw error;
    }
  },
};
