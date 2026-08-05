import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const shippingApi = {
  async calculateFee({
    shippingProvider,
    toDistrictId,
    toWardCode,
    weight = 500,
  }) {
    try {
      const response = await axiosClient.post("/shipping/calculate-fee", {
        shipping_provider: shippingProvider,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        weight,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to calculate shipping fee");
      throw error;
    }
  },
};
