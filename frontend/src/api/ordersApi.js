import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const ordersApi = {
  async checkout(
    cartItems,
    {
      shippingAddress,
      shippingProvider = "IN_HOUSE",
      shippingFee = 0,
      toName,
      toPhone,
      toDistrictId,
      toWardCode,
    },
  ) {
    try {
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        shipping_provider: shippingProvider,
        shipping_fee: shippingFee,
        to_name: toName,
        to_phone: toPhone,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
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

  async shipOrder(orderId, carrier, trackingNumber) {
    try {
      const response = await axiosClient.post(`/orders/${orderId}/ship`, {
        carrier,
        tracking_number: trackingNumber,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to mark order as shipped");
      throw error;
    }
  },
};
