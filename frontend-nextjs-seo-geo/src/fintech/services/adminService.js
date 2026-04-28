import API_ENDPOINTS from '../config/api';

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!response.ok) {
    const error = data.message || data.error || `Lỗi ${response.status}`;
    throw new Error(error);
  }
  return data;
};

export const adminService = {

  // ========== THỐNG KÊ HỆ THỐNG ==========
  async getStats() {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.STATS, {
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========== QUẢN LÝ NGƯỜI DÙNG ==========
  async getUsers(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${API_ENDPOINTS.ADMIN.USERS}?${query}` : API_ENDPOINTS.ADMIN.USERS;
      const res = await fetch(url, { headers: getHeaders() });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserById(id) {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.USER_BY_ID(id), {
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async toggleUserStatus(id, active) {
    try {
      const res = await fetch(`${API_ENDPOINTS.ADMIN.USER_STATUS(id)}?active=${active}`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateUserRole(id, role) {
    try {
      const res = await fetch(`${API_ENDPOINTS.ADMIN.USER_ROLE(id)}?role=${role}`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========== QUẢN LÝ VÍ ==========
  async getWallets() {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.WALLETS, {
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========== QUẢN LÝ GIAO DỊCH ==========
  async getTransactions(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${API_ENDPOINTS.ADMIN.TRANSACTIONS}?${query}` : API_ENDPOINTS.ADMIN.TRANSACTIONS;
      const res = await fetch(url, { headers: getHeaders() });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteTransaction(id) {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.DELETE_TRANSACTION(id), {
        method: 'DELETE',
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========== QUẢN LÝ NỢ ==========
  async getDebts() {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.DEBTS, {
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========== QUẢN LÝ TIẾT KIỆM ==========
  async getSavings() {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.SAVINGS, {
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========== DASHBOARD ==========
  async getDashboard() {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.DASHBOARD, {
        headers: getHeaders()
      });
      return { success: true, data: await handleResponse(res) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
