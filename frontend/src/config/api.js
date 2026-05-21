// Lấy API URL từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  },
  BUDGET: {
    GET_ALL: (walletId) => `${API_BASE_URL}/budgets/${walletId}`,
    GET_DETAIL: (budgetId) => `${API_BASE_URL}/budgets/detail/${budgetId}`,
    CREATE: (walletId) => `${API_BASE_URL}/budgets/${walletId}`,
    UPDATE: (budgetId) => `${API_BASE_URL}/budgets/${budgetId}`,
    DELETE: (budgetId) => `${API_BASE_URL}/budgets/${budgetId}`
  },
  DEBT: {
    GET_ALL: `${API_BASE_URL}/debts`,
    GET_BY_ID: (id) => `${API_BASE_URL}/debts/${id}`,
    CREATE: `${API_BASE_URL}/debts`,
    PAY: (id) => `${API_BASE_URL}/debts/${id}/pay`,
    GET_PAYMENTS: (id) => `${API_BASE_URL}/debts/${id}/payments`
  },
  SAVINGS: {
    GET_BY_WALLET: (walletId) => `${API_BASE_URL}/savings/${walletId}`,
    CREATE: (walletId) => `${API_BASE_URL}/savings/${walletId}`,
    DEPOSIT: (savingId) => `${API_BASE_URL}/savings/deposit/${savingId}`,
    WITHDRAW: (savingId) => `${API_BASE_URL}/savings/withdraw/${savingId}`
  },
  AI: {
    CHAT: `${API_BASE_URL}/ai/chat`
  },
  ADMIN: {
    STATS: `${API_BASE_URL}/admin/stats`,
    USERS: `${API_BASE_URL}/admin/users`,
    USER_BY_ID: (id) => `${API_BASE_URL}/admin/users/${id}`,
    USER_STATUS: (id) => `${API_BASE_URL}/admin/users/${id}/status`,
    USER_ROLE: (id) => `${API_BASE_URL}/admin/users/${id}/role`,
    WALLETS: `${API_BASE_URL}/admin/wallets`,
    CATEGORIES: `${API_BASE_URL}/admin/categories`,
    UPDATE_CATEGORY: (id) => `${API_BASE_URL}/admin/categories/${id}`,
    DELETE_CATEGORY: (id) => `${API_BASE_URL}/admin/categories/${id}`,
    TRANSACTIONS: `${API_BASE_URL}/admin/transactions`,
    DELETE_TRANSACTION: (id) => `${API_BASE_URL}/admin/transactions/${id}`,
    DEBTS: `${API_BASE_URL}/admin/debts`,
    SAVINGS: `${API_BASE_URL}/admin/savings`,
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`
  },
  USER: {
    PROFILE: `${API_BASE_URL}/user/profile`
  }
};

export default API_ENDPOINTS;
