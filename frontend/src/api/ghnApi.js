import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const ghnApi = {
  async getProvinces() {
    try {
      return (await axiosClient.get("/shipping/ghn/provinces")).data;
    } catch (e) {
      handleApiError(e, "Failed to load provinces");
      throw e;
    }
  },
  async getDistricts(provinceId) {
    try {
      return (
        await axiosClient.get("/shipping/ghn/districts", {
          params: { province_id: provinceId },
        })
      ).data;
    } catch (e) {
      handleApiError(e, "Failed to load districts");
      throw e;
    }
  },
  async getWards(districtId) {
    try {
      return (
        await axiosClient.get("/shipping/ghn/wards", {
          params: { district_id: districtId },
        })
      ).data;
    } catch (e) {
      handleApiError(e, "Failed to load wards");
      throw e;
    }
  },
};
