import axiosClient from "./axiosClient";

export const reviewsApi = {
  getProductReviews: async (productId) => {
    const response = await axiosClient.get(`/reviews/product/${productId}`);

    return response.data;
  },

  getProductRatingSummary: async (productId) => {
    const response = await axiosClient.get(
      `/reviews/product/${productId}/summary`,
    );

    return response.data;
  },

  createReview: async (productId, rating, comment) => {
    const response = await axiosClient.post("/reviews", {
      product_id: productId,
      rating,
      comment,
    });

    return response.data;
  },

  updateReview: async (reviewId, rating, comment) => {
    const response = await axiosClient.patch(`/reviews/${reviewId}`, {
      rating,
      comment,
    });

    return response.data;
  },

  deleteReview: async (reviewId) => {
    await axiosClient.delete(`/reviews/${reviewId}`);
  },
};
