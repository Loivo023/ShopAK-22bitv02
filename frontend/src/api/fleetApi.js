import axiosClient from "./axiosClient";

export const fleetApi = {
  getAll: async () => {
    const res = await axiosClient.get("/fleet");
    return res.data;
  },

  create: async (vehicle) => {
    const res = await axiosClient.post("/fleet", vehicle);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.patch(`/fleet/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    await axiosClient.delete(`/fleet/${id}`);
  },
};