import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const ordersApi = {
  async checkout(cartItems) {
    try {
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };
      const response = await axiosClient.post("/orders/checkout", payload);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to place order");
      throw error;
    }
  },

  async getMyOrders() {
    try {
      const response = await axiosClient.get("/orders/my");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch orders");
      throw error;
    }
  },

  async getOrderById(id) {
    try {
      const response = await axiosClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch order details");
      throw error;
    }
  },

  async getAllForAdmin() {
    try {
      const response = await axiosClient.get("/orders/admin/all");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch all orders");
      throw error;
    }
  },

  async adminUpdateStatus(orderId, status) {
    try {
      const response = await axiosClient.patch(`/orders/${orderId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to update order status");
      throw error;
    }
  },

  async adminUpdateItemQuantity(orderId, itemId, quantity) {
    try {
      const response = await axiosClient.patch(
        `/orders/${orderId}/items/quantity`,
        {
          item_id: itemId,
          quantity,
        },
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to update item quantity");
      throw error;
    }
  },
};
