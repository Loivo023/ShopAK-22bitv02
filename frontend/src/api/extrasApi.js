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
  apply: async (code, orderAmount) => {
    const response = await axiosClient.post("/vouchers/apply", {
      code,
      order_amount: orderAmount,
    });

    return response.data;
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
  // ==========================================
  // GET NORMAL CHAT MESSAGES
  // ==========================================
  async getMessages(channel) {
    try {
      return (await axiosClient.get(`/chat/${channel}`)).data;
    } catch (e) {
      console.error("Failed to load chat messages:", e);
      return [];
    }
  },

  // ==========================================
  // GET FAQ BOT MESSAGES
  // ==========================================
  async getBotMessages(userId) {
    try {
      return (await axiosClient.get(`/chat/bot/${userId}`)).data;
    } catch (e) {
      console.error("Failed to load bot messages:", e);
      throw e;
    }
  },

  // ==========================================
  // SEND NORMAL CHAT MESSAGE
  // ==========================================
  async sendMessage(channel, message) {
    try {
      return (
        await axiosClient.post("/chat", {
          channel,
          message,
        })
      ).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },

  // ==========================================
  // SEND MESSAGE TO FAQ BOT
  // ==========================================
  async sendToBot(channel, message) {
    try {
      return (
        await axiosClient.post("/chat/bot", {
          channel,
          message,
        })
      ).data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },

  // ==========================================
  // ADMIN SUPPORT CONVERSATIONS
  // ==========================================
  async getSupportList() {
    try {
      return (await axiosClient.get("/chat/admin/support-list")).data;
    } catch (e) {
      console.error("Failed to load support list:", e);
      return [];
    }
  },

  // ==========================================
  // ADMIN SHIPPER CONVERSATIONS
  // ==========================================
  async getShipperList() {
    try {
      return (await axiosClient.get("/chat/admin/shipper-list")).data;
    } catch (e) {
      console.error("Failed to load shipper list:", e);
      return [];
    }
  },
};
