import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const paymentsApi = {
  async createStripeSession(orderId) {
    try {
      const response = await axiosClient.post(
        "/payments/stripe/create-session",
        { order_id: orderId },
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to start Stripe payment");
      throw error;
    }
  },

  async createPaypalOrder(orderId) {
    try {
      const response = await axiosClient.post("/payments/paypal/create-order", {
        order_id: orderId,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to start PayPal payment");
      throw error;
    }
  },

  async capturePaypalOrder(paypalOrderId, orderId) {
    try {
      const response = await axiosClient.post(
        "/payments/paypal/capture-order",
        {
          paypal_order_id: paypalOrderId,
          order_id: orderId,
        },
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to capture PayPal payment");
      throw error;
    }
  },

  async createVnpayUrl(orderId) {
    try {
      const response = await axiosClient.post("/payments/vnpay/create-url", {
        order_id: orderId,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to start VNPay payment");
      throw error;
    }
  },

  async confirm(orderId, provider) {
    try {
      const response = await axiosClient.post("/payments/confirm", {
        order_id: orderId,
        provider,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to confirm payment");
      throw error;
    }
  },
};
