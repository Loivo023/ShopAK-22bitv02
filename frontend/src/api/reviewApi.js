import axiosClient from "./axiosClient";
import { handleApiError } from "./errorHandler";

export const reviewApi = {
  async getAllReviews() {
    try {
      const response = await axiosClient.get("/reviews/admin/all");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to load reviews");
      throw error;
    }
  },

  async deleteReview(reviewId) {
    try {
      const response = await axiosClient.delete(`/reviews/admin/${reviewId}`);

      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to delete review");
      throw error;
    }
  },
};
