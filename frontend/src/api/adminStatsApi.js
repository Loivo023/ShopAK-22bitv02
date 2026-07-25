import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const adminStatsApi = {
  async getOverview() {
    try {
      const response = await axiosClient.get("/admin/stats/overview");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch overview stats");
      throw error;
    }
  },

  async getMonthlyRevenue(from, to) {
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const response = await axiosClient.get("/admin/stats/monthly-revenue", {
        params,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch monthly revenue");
      throw error;
    }
  },

  async getTopProducts(limit = 5) {
    try {
      const response = await axiosClient.get("/admin/stats/top-products", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch top products");
      throw error;
    }
  },
};
