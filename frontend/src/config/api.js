// Lấy API URL từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`
  },
  WALLET: {
    GET_ALL: `${API_BASE_URL}/wallet`,
    GET_BY_ID: (id) => `${API_BASE_URL}/wallet/${id}`,
    CREATE: `${API_BASE_URL}/wallet`,
    UPDATE: (id) => `${API_BASE_URL}/wallet/${id}`,
    DELETE: (id) => `${API_BASE_URL}/wallet/${id}`
  },
  CATEGORY: {
    GET_ALL: (type) => `${API_BASE_URL}/category?type=${type}`,
    CREATE: `${API_BASE_URL}/category`,
    UPDATE: (id) => `${API_BASE_URL}/category/${id}`,
    DELETE: (id) => `${API_BASE_URL}/category/${id}`
  },
  SUB_CATEGORY: {
    GET_BY_CATEGORY: (categoryId) => `${API_BASE_URL}/sub-category/${categoryId}`,
    CREATE: `${API_BASE_URL}/sub-category`,
    DELETE: (id) => `${API_BASE_URL}/sub-category/${id}`
  },
  TRANSACTION: {
    GET_ALL: `${API_BASE_URL}/transaction`,
    GET_BY_ID: (id) => `${API_BASE_URL}/transaction/${id}`,
    CREATE: `${API_BASE_URL}/transaction`,
    UPDATE: (id) => `${API_BASE_URL}/transaction/${id}`,
    DELETE: (id) => `${API_BASE_URL}/transaction/${id}`
  }
};

export default API_ENDPOINTS;