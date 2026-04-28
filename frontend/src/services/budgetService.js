import API_ENDPOINTS from '../config/api';

const handleResponse = async (response) => {
  const responseText = await response.text();
  
  try {
    if (!responseText || responseText.trim() === '') return {};
    return JSON.parse(responseText);
  } catch (e) {
    console.error('Parse error:', e);
    return { message: responseText };
  }
};

const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const budgetService = {
  // Lấy danh sách ngân sách theo ví
  async getBudgets(walletId) {
    try {
      const response = await fetch(`${API_ENDPOINTS.BUDGET.GET_ALL(walletId)}`, {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách ngân sách');
      }

      const budgets = Array.isArray(data) ? data : [];
      
      return {
        success: true,
        data: budgets
      };
    } catch (error) {
      console.error('Get budgets error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách ngân sách',
        data: []
      };
    }
  },

  // Lấy chi tiết ngân sách
  async getBudgetDetail(budgetId) {
    try {
      const response = await fetch(API_ENDPOINTS.BUDGET.GET_DETAIL(budgetId), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy thông tin ngân sách');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Get budget detail error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thông tin ngân sách',
        data: null
      };
    }
  },

  // Tạo ngân sách mới
  async createBudget(walletId, budgetData) {
    try {
      const response = await fetch(API_ENDPOINTS.BUDGET.CREATE(walletId), {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(budgetData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo ngân sách');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Create budget error:', error);
      return {
        success: false,
        error: error.message || 'Không thể tạo ngân sách',
        data: null
      };
    }
  },

  // Cập nhật ngân sách
  async updateBudget(budgetId, budgetData) {
    try {
      const response = await fetch(API_ENDPOINTS.BUDGET.UPDATE(budgetId), {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(budgetData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật ngân sách');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Update budget error:', error);
      return {
        success: false,
        error: error.message || 'Không thể cập nhật ngân sách',
        data: null
      };
    }
  },

  // Xóa ngân sách
  async deleteBudget(budgetId) {
    try {
      const response = await fetch(API_ENDPOINTS.BUDGET.DELETE(budgetId), {
        method: 'DELETE',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xóa ngân sách');
      }

      return {
        success: true,
        message: data.message || 'Xóa ngân sách thành công'
      };
    } catch (error) {
      console.error('Delete budget error:', error);
      return {
        success: false,
        error: error.message || 'Không thể xóa ngân sách'
      };
    }
  },

  // Format số tiền
  formatAmount(amount) {
    if (!amount && amount !== 0) return '0₫';
    if (amount >= 1_000_000_000) {
      return (amount / 1_000_000_000).toFixed(1) + 'B₫';
    } else if (amount >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1) + 'M₫';
    } else if (amount >= 1_000) {
      return (amount / 1_000).toFixed(1) + 'K₫';
    }
    return amount.toLocaleString('vi-VN') + '₫';
  }
};