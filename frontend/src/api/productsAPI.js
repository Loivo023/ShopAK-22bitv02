import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';

export const productsApi = {
  async getAll(params = {}) {
    try {
      const response = await axiosClient.get('/products', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch products');
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch product details');
      throw error;
    }
  },

  async searchProduct(keyword) {
    try {
      const response = await axiosClient.get('/products', {
        params: { search: keyword },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to search products');
      throw error;
    }
  },

 
  async create(product) {
    try {
      const response = await axiosClient.post('/products', product);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create product');
      throw error;
    }
  },

  async delete(id) {
    try {
      await axiosClient.delete(`/products/${id}`);
    } catch (error) {
      handleApiError(error, 'Failed to delete product');
      throw error;
    }
  },
};