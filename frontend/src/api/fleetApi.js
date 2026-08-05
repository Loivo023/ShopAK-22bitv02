import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const fleetApi = {
  async getAll() {
    try {
      return (await axiosClient.get("/fleet")).data;
    } catch (e) {
      handleApiError(e, "Failed to fetch fleet");
      throw e;
    }
  },
  async create(vehicle) {
    try {
      return (await axiosClient.post("/fleet", vehicle)).data;
    } catch (e) {
      handleApiError(e, "Failed to add vehicle");
      throw e;
    }
  },
  async update(id, data) {
    try {
      return (await axiosClient.patch(`/fleet/${id}`, data)).data;
    } catch (e) {
      handleApiError(e, "Failed to update vehicle");
      throw e;
    }
  },
  async remove(id) {
    try {
      await axiosClient.delete(`/fleet/${id}`);
    } catch (e) {
      handleApiError(e, "Failed to remove vehicle");
      throw e;
    }
  },
};
