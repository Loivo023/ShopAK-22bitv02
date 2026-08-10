import axiosClient from "./axiosClient";

export const shippingApi = {
  calculateFee: async ({
    shippingProvider,
    toDistrictId,
    toWardCode,
    weight = 500,
  }) => {
    const response = await axiosClient.post("/shipping/calculate-fee", {
      shipping_provider: shippingProvider,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      weight,
    });

    return response.data;
  },
};
