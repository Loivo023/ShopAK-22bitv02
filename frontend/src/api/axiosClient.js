import axios from 'axios';
import { getToken } from '../auth/token';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  },
);

export default axiosClient;