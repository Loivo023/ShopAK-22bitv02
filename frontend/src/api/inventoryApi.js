import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const inventoryApi = {
  async getAll() {
    try {
      return (await axiosClient.get("/inventory")).data;
    } catch (e) {
      handleApiError(e, "Failed to fetch inventory");
      throw e;
    }
  },
  async adjust(productId, changeAmount, reason) {
    try {
      return (
        await axiosClient.post("/inventory/adjust", {
          product_id: productId,
          change_amount: changeAmount,
          reason,
        })
      ).data;
    } catch (e) {
      handleApiError(e, "Failed to adjust stock");
      throw e;
    }
  },
  async getLogs() {
    try {
      return (await axiosClient.get("/inventory/logs")).data;
    } catch (e) {
      handleApiError(e, "Failed to fetch logs");
      throw e;
    }
  },
};
