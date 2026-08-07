import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const wishlistApi = {
  async getAll() {
    try {
      return (await axiosClient.get("/wishlist")).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async add(id) {
    try {
      return (await axiosClient.post(`/wishlist/${id}`)).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async remove(id) {
    try {
      await axiosClient.delete(`/wishlist/${id}`);
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
};

export const recentlyViewedApi = {
  async track(id) {
    try {
      await axiosClient.post(`/recently-viewed/${id}`);
    } catch (e) {
      /* silent */
    }
  },
  async getAll() {
    try {
      return (await axiosClient.get("/recently-viewed")).data;
    } catch (e) {
      return [];
    }
  },
};

export const voucherApi = {
  async apply(code, orderAmount) {
    try {
      return (
        await axiosClient.post("/vouchers/apply", {
          code,
          order_amount: orderAmount,
        })
      ).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async getAll() {
    try {
      return (await axiosClient.get("/vouchers")).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async create(v) {
    try {
      return (await axiosClient.post("/vouchers", v)).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async remove(id) {
    try {
      await axiosClient.delete(`/vouchers/${id}`);
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
};

export const profileApi = {
  async getMe() {
    try {
      return (await axiosClient.get("/profile/me")).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async update(data) {
    try {
      return (await axiosClient.patch("/profile/me", data)).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async changePassword(data) {
    try {
      return (await axiosClient.post("/profile/change-password", data)).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async getAddresses() {
    try {
      return (await axiosClient.get("/profile/addresses")).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async addAddress(data) {
    try {
      return (await axiosClient.post("/profile/addresses", data)).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async removeAddress(id) {
    try {
      await axiosClient.delete(`/profile/addresses/${id}`);
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
};

export const chatApi = {
  async getMessages(channel) {
    try {
      return (await axiosClient.get(`/chat/${channel}`)).data;
    } catch (e) {
      return [];
    }
  },
  async sendMessage(channel, message) {
    try {
      return (await axiosClient.post("/chat", { channel, message })).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async sendToBot(channel, message) {
    try {
      return (await axiosClient.post("/chat/bot", { channel, message })).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
  async getSupportList() {
    try {
      return (await axiosClient.get("/chat/admin/support-list")).data;
    } catch (e) {
      return [];
    }
  },
  async getShipperList() {
    try {
      return (await axiosClient.get("/chat/admin/shipper-list")).data;
    } catch (e) {
      return [];
    }
  },
};
