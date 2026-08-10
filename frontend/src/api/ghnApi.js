import axiosClient from "./axiosClient";

export const ghnApi = {
  getProvinces: async () => {
    const response = await axiosClient.get("/shipping/ghn/provinces");

    return response.data;
  },

  getDistricts: async (provinceId) => {
    const response = await axiosClient.get("/shipping/ghn/districts", {
      params: {
        province_id: provinceId,
      },
    });

    return response.data;
  },

  getWards: async (districtId) => {
    const response = await axiosClient.get("/shipping/ghn/wards", {
      params: {
        district_id: districtId,
      },
    });

    return response.data;
  },
};
