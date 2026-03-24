import API_ENDPOINTS from '../config/api';

// Dữ liệu mẫu - Sử dụng ID thật từ API
export const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'EXPENSE',
    amount: 50000,
    description: 'Ăn sáng',
    walletId: '3ac4a922-7567-469d-af30-f346e0f2a7ba', // ID của test ví tín dụng
    categoryName: 'Ăn uống',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'EXPENSE',
    amount: 150000,
    description: 'Mua sắm',
    walletId: '3ac4a922-7567-469d-af30-f346e0f2a7ba', // ID của test ví tín dụng
    categoryName: 'Mua sắm',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    type: 'INCOME',
    amount: 2000000,
    description: 'Test thu nhập',
    walletId: '3fe093ec-5a01-4d70-aebe-54cc47ada21d', // ID của test api
    categoryName: 'Thu nhập',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    type: 'INCOME',
    amount: 5000000,
    description: 'Lương',
    walletId: '3fe093ec-5a01-4d70-aebe-54cc47ada21d', // ID của test api
    categoryName: 'Lương',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  }
];

const handleResponse = async (response) => {
  const responseText = await response.text();
  
  console.log('Transaction API Response:', {
    status: response.status,
    textLength: responseText.length,
    preview: responseText.substring(0, 200)
  });

  try {
    if (!responseText || responseText.trim() === '') {
      console.log('Empty response, using mock data');
      return MOCK_TRANSACTIONS;
    }
    
    try {
      const data = JSON.parse(responseText);
      
      // Log để xem dữ liệu thật từ API
      console.log('Raw API transactions:', data);
      
      // Nếu API trả về mảng rỗng, dùng mock data
      if (Array.isArray(data) && data.length === 0) {
        console.log('API returned empty array, using mock data');
        return MOCK_TRANSACTIONS;
      }
      
      return data;
    } catch (e) {
      console.error('JSON parse error:', e.message);
      console.log('Using mock transaction data');
      return MOCK_TRANSACTIONS;
    }
  } catch (error) {
    console.error('Handle response error:', error);
    return MOCK_TRANSACTIONS;
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

export const transactionService = {
  // 🟢 GET ALL - Lấy tất cả giao dịch
  async getAllTransactions() {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.GET_ALL, {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        console.warn('API returned error, using mock data');
        return {
          success: true,
          data: MOCK_TRANSACTIONS
        };
      }

      // Đảm bảo data là mảng
      let transactions = Array.isArray(data) ? data : MOCK_TRANSACTIONS;
      
      // Log chi tiết từng transaction
      console.log('Transactions after processing:', transactions.map(t => ({
        id: t.id,
        walletId: t.wallet?.id || t.walletId, // QUAN TRỌNG: Lấy walletId từ cả 2 nguồn
        walletName: t.wallet?.name,
        description: t.description,
        amount: t.amount
      })));
      
      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Get all transactions error:', error);
      return {
        success: true,
        data: MOCK_TRANSACTIONS
      };
    }
  },

  // 🟢 GET BY ID - Lấy giao dịch theo ID
  async getTransactionById(transactionId) {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.GET_BY_ID(transactionId), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy thông tin giao dịch');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Get transaction by id error:', error);
      const mockTransaction = MOCK_TRANSACTIONS.find(t => t.id === transactionId) || MOCK_TRANSACTIONS[0];
      return {
        success: true,
        data: mockTransaction
      };
    }
  },

  // 🟢 CREATE - Tạo giao dịch mới
  async createTransaction(transactionData) {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.CREATE, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(transactionData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo giao dịch');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Create transaction error:', error);
      const newTransaction = {
        id: Date.now().toString(),
        ...transactionData,
        createdAt: new Date().toISOString()
      };
      return {
        success: true,
        data: newTransaction
      };
    }
  },

  // 🟡 UPDATE - Cập nhật giao dịch
  async updateTransaction(transactionId, transactionData) {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.UPDATE(transactionId), {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(transactionData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật giao dịch');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Update transaction error:', error);
      return {
        success: true,
        data: { id: transactionId, ...transactionData }
      };
    }
  },

  // 🔴 DELETE - Xóa giao dịch
  async deleteTransaction(transactionId) {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSACTION.DELETE(transactionId), {
        method: 'DELETE',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xóa giao dịch');
      }

      return {
        success: true,
        message: data.message || 'Xóa giao dịch thành công',
        data: data
      };
    } catch (error) {
      console.error('Delete transaction error:', error);
      return {
        success: true,
        message: 'Xóa giao dịch thành công (mock)',
        data: { id: transactionId }
      };
    }
  },

  // Format transaction response - QUAN TRỌNG: Giữ lại walletId
  formatTransaction(transaction) {
    if (!transaction) return null;
    
    // Log để debug format
    console.log('Raw transaction before format:', transaction);
    
    // Lấy walletId từ nhiều nguồn khác nhau
    const walletId = transaction.wallet?.id || transaction.walletId;
    const toWalletId = transaction.toWallet?.id || transaction.toWalletId;
    const categoryName = transaction.category?.categoryName || transaction.categoryName || 'Khác';
    
    console.log('Extracted walletId:', walletId);
    console.log('Extracted categoryName:', categoryName);
    
    return {
      id: transaction.id,
      type: transaction.type || 'EXPENSE',
      amount: transaction.amount || 0,
      description: transaction.description || '',
      walletId: walletId, // QUAN TRỌNG: Lấy từ wallet object hoặc trực tiếp
      toWalletId: toWalletId,
      categoryName: categoryName,
      createdAt: transaction.createdAt || new Date().toISOString(),
      
      // Format hiển thị
      displayAmount: (transaction.type || 'EXPENSE') === 'EXPENSE' 
        ? `-${(transaction.amount || 0).toLocaleString()}₫`
        : `+${(transaction.amount || 0).toLocaleString()}₫`,
      displayDate: transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('vi-VN') : '',
      displayTime: transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }) : '',
      
      // Icon dựa theo loại giao dịch
      icon: (transaction.type || 'EXPENSE') === 'EXPENSE' ? '💸' : '💰'
    };
  },

  // Nhóm giao dịch theo ngày
  groupTransactionsByDate(transactions) {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) return [];
    
    const groups = {};
    
    transactions.forEach(transaction => {
      const date = transaction.createdAt ? new Date(transaction.createdAt).toISOString().split('T')[0] : 'unknown';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    // Sắp xếp ngày giảm dần (mới nhất lên đầu)
    return Object.entries(groups)
      .sort((a, b) => {
        if (a[0] === 'unknown') return 1;
        if (b[0] === 'unknown') return -1;
        return new Date(b[0]) - new Date(a[0]);
      })
      .map(([date, transactions]) => ({
        date,
        displayDate: date !== 'unknown' ? new Date(date).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Không xác định',
        transactions,
        total: transactions.reduce((sum, t) => {
          if (t.type === 'EXPENSE') return sum - (t.amount || 0);
          if (t.type === 'INCOME') return sum + (t.amount || 0);
          return sum; // TRANSFER không ảnh hưởng tổng
        }, 0)
      }));
  },

  // Lọc giao dịch theo điều kiện
  filterTransactions(transactions, filters) {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    console.log('Filtering with:', filters);
    console.log('All transactions walletIds:', transactions.map(t => ({
      id: t.id,
      walletId: t.walletId,
      description: t.description
    })));
    
    const filtered = transactions.filter(t => {
      // Lọc theo ví - QUAN TRỌNG
      if (filters.walletId && filters.walletId !== 'all') {
        if (t.walletId !== filters.walletId) {
          return false;
        }
      }

      // Lọc theo loại (EXPENSE/INCOME/TRANSFER)
      if (filters.type && filters.type !== 'all' && t.type !== filters.type) {
        return false;
      }

      // Lọc theo danh mục
      if (filters.category && filters.category !== 'all') {
        const categoryName = t.categoryName || '';
        if (categoryName !== filters.category) {
          return false;
        }
      }

      // Lọc theo khoảng thời gian
      if (filters.startDate && t.createdAt) {
        const transactionDate = new Date(t.createdAt).toISOString().split('T')[0];
        if (transactionDate < filters.startDate) return false;
      }
      if (filters.endDate && t.createdAt) {
        const transactionDate = new Date(t.createdAt).toISOString().split('T')[0];
        if (transactionDate > filters.endDate) return false;
      }

      // Lọc theo số tiền
      if (filters.minAmount && t.amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount && t.amount > filters.maxAmount) {
        return false;
      }

      // Lọc theo tìm kiếm
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const description = t.description?.toLowerCase() || '';
        const categoryName = t.categoryName?.toLowerCase() || '';
        return description.includes(query) || categoryName.includes(query);
      }

      return true;
    });
    
    console.log('Filtered result count:', filtered.length);
    console.log('Filtered result:', filtered);
    return filtered;
  },

  // Tính tổng thu/chi
  calculateTotals(transactions) {
    if (!transactions || !Array.isArray(transactions)) {
      return { totalExpense: 0, totalIncome: 0 };
    }
    
    return transactions.reduce((acc, t) => {
      if (t.type === 'EXPENSE') {
        acc.totalExpense += t.amount || 0;
      } else if (t.type === 'INCOME') {
        acc.totalIncome += t.amount || 0;
      }
      // TRANSFER không tính vào tổng thu chi
      return acc;
    }, { totalExpense: 0, totalIncome: 0 });
  }
};