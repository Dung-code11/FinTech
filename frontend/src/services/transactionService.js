import API_ENDPOINTS from '../config/api';

const handleResponse = async (response) => {
  const responseText = await response.text();

  console.log('Transaction API Response:', {
    status: response.status,
    textLength: responseText.length,
    preview: responseText.substring(0, 200)
  });

  if (!responseText || responseText.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Transaction parse error:', error.message);
    return { message: responseText };
  }
};

const getErrorMessage = (data, fallback) => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (data && typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }

  return fallback;
};

const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

export const transactionService = {
  async getAllTransactions() {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.GET_ALL, {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể lấy danh sách giao dịch'));
      }

      if (data !== null && !Array.isArray(data)) {
        throw new Error('Dữ liệu giao dịch không hợp lệ');
      }

      const transactions = Array.isArray(data) ? data : [];

      console.log(
        'Transactions after processing:',
        transactions.map((transaction) => ({
          id: transaction.id,
          walletId: transaction.wallet?.id || transaction.walletId,
          walletName: transaction.wallet?.name,
          description: transaction.description,
          amount: transaction.amount
        }))
      );

      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Get all transactions error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách giao dịch',
        data: []
      };
    }
  },

  async getTransactionById(transactionId) {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.GET_BY_ID(transactionId), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể lấy thông tin giao dịch'));
      }

      if (!data || Array.isArray(data)) {
        throw new Error('Dữ liệu giao dịch không hợp lệ');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get transaction by id error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thông tin giao dịch',
        data: null
      };
    }
  },

  async createTransaction(transactionData) {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.CREATE, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(transactionData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể tạo giao dịch'));
      }

      if (!data || Array.isArray(data)) {
        throw new Error('Phản hồi tạo giao dịch không hợp lệ');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Create transaction error:', error);
      return {
        success: false,
        error: error.message || 'Không thể tạo giao dịch'
      };
    }
  },

  async updateTransaction(transactionId, transactionData) {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.UPDATE(transactionId), {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(transactionData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể cập nhật giao dịch'));
      }

      if (!data || Array.isArray(data)) {
        throw new Error('Phản hồi cập nhật giao dịch không hợp lệ');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Update transaction error:', error);
      return {
        success: false,
        error: error.message || 'Không thể cập nhật giao dịch'
      };
    }
  },

  async deleteTransaction(transactionId) {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.DELETE(transactionId), {
        method: 'DELETE',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể xóa giao dịch'));
      }

      return {
        success: true,
        message: getErrorMessage(data, 'Xóa giao dịch thành công'),
        data
      };
    } catch (error) {
      console.error('Delete transaction error:', error);
      return {
        success: false,
        error: error.message || 'Không thể xóa giao dịch'
      };
    }
  },

  formatTransaction(transaction) {
    if (!transaction) return null;

    console.log('Raw transaction before format:', transaction);

    const type = transaction.type || 'EXPENSE';
    const amount = Number(transaction.amount) || 0;
    const walletId = transaction.wallet?.id || transaction.walletId || null;
    const toWalletId = transaction.toWallet?.id || transaction.toWalletId || null;
    const categoryId = transaction.category?.id || transaction.categoryId || null;
    const categoryName =
      transaction.category?.categoryName ||
      transaction.category?.name ||
      transaction.categoryName ||
      'Khác';
    const createdAt = transaction.createdAt || new Date().toISOString();

    console.log('Extracted walletId:', walletId);
    console.log('Extracted categoryId:', categoryId);
    console.log('Extracted categoryName:', categoryName);

    return {
      id: transaction.id,
      type,
      amount,
      description: transaction.description || '',
      walletId,
      toWalletId,
      categoryId,
      categoryName,
      createdAt,
      displayAmount:
        type === 'EXPENSE'
          ? `-${amount.toLocaleString()}₫`
          : `+${amount.toLocaleString()}₫`,
      displayDate: new Date(createdAt).toLocaleDateString('vi-VN'),
      displayTime: new Date(createdAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      icon: type === 'EXPENSE' ? '💸' : '💰'
    };
  },

  groupTransactionsByDate(transactions) {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) return [];

    const groups = {};

    transactions.forEach((transaction) => {
      const date = transaction.createdAt
        ? new Date(transaction.createdAt).toISOString().split('T')[0]
        : 'unknown';

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(transaction);
    });

    return Object.entries(groups)
      .sort((a, b) => {
        if (a[0] === 'unknown') return 1;
        if (b[0] === 'unknown') return -1;
        return new Date(b[0]) - new Date(a[0]);
      })
      .map(([date, groupedTransactions]) => ({
        date,
        displayDate:
          date !== 'unknown'
            ? new Date(date).toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Không xác định',
        transactions: groupedTransactions,
        total: groupedTransactions.reduce((sum, transaction) => {
          if (transaction.type === 'EXPENSE') return sum - (transaction.amount || 0);
          if (transaction.type === 'INCOME') return sum + (transaction.amount || 0);
          return sum;
        }, 0)
      }));
  },

  filterTransactions(transactions, filters) {
    if (!transactions || !Array.isArray(transactions)) return [];

    console.log('Filtering with:', filters);
    console.log(
      'All transactions wallet/category:',
      transactions.map((transaction) => ({
        id: transaction.id,
        walletId: transaction.walletId,
        categoryId: transaction.categoryId,
        categoryName: transaction.categoryName,
        description: transaction.description
      }))
    );

    const filtered = transactions.filter((transaction) => {
      if (filters.walletId && filters.walletId !== 'all' && transaction.walletId !== filters.walletId) {
        return false;
      }

      if (filters.type && filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }

      if (filters.category && filters.category !== 'all') {
        const transactionCategoryId = transaction.categoryId || '';
        const transactionCategoryName = transaction.categoryName || '';

        if (
          transactionCategoryId !== filters.category &&
          transactionCategoryName !== filters.category
        ) {
          return false;
        }
      }

      if (filters.startDate && transaction.createdAt) {
        const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
        if (transactionDate < filters.startDate) return false;
      }

      if (filters.endDate && transaction.createdAt) {
        const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
        if (transactionDate > filters.endDate) return false;
      }

      if (filters.minAmount && transaction.amount < filters.minAmount) {
        return false;
      }

      if (filters.maxAmount && transaction.amount > filters.maxAmount) {
        return false;
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const description = transaction.description?.toLowerCase() || '';
        const categoryName = transaction.categoryName?.toLowerCase() || '';
        return description.includes(query) || categoryName.includes(query);
      }

      return true;
    });

    console.log('Filtered result count:', filtered.length);
    console.log('Filtered result:', filtered);
    return filtered;
  },

  calculateTotals(transactions) {
    if (!transactions || !Array.isArray(transactions)) {
      return { totalExpense: 0, totalIncome: 0 };
    }

    return transactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === 'EXPENSE') {
          accumulator.totalExpense += transaction.amount || 0;
        } else if (transaction.type === 'INCOME') {
          accumulator.totalIncome += transaction.amount || 0;
        }

        return accumulator;
      },
      { totalExpense: 0, totalIncome: 0 }
    );
  }
};
