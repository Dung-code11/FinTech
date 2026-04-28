import API_ENDPOINTS from '../config/api';

const handleResponse = async (response) => {
  const responseText = await response.text();
  
  console.log('Savings API Response:', {
    status: response.status,
    text: responseText
  });

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

export const savingsService = {
  // Lấy tất cả tiết kiệm theo ví
  async getSavingsByWallet(walletId) {
    try {
      console.log('Fetching savings for wallet:', walletId);
      const response = await fetch(API_ENDPOINTS.SAVINGS.GET_BY_WALLET(walletId), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách tiết kiệm');
      }

      const savings = Array.isArray(data) ? data : [];
      
      // Format lại dữ liệu
      const formattedSavings = savings.map(saving => ({
        id: saving.id,
        title: saving.title,
        currency: saving.currency,
        targetAmount: saving.targetAmount,
        currentAmount: saving.currentAmount || 0,
        progress: saving.progress || 0,
        type: saving.type, // GOAL / PERIODIC
        category: saving.category,
        targetDate: saving.targetDate,
        period: saving.period, // WEEKLY / MONTHLY / YEARLY
        walletId: saving.walletId,
        transactions: saving.transactions || []
      }));
      
      console.log('Formatted savings:', formattedSavings);
      
      return {
        success: true,
        data: formattedSavings
      };
    } catch (error) {
      console.error('Get savings by wallet error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách tiết kiệm',
        data: []
      };
    }
  },

  // Tạo mục tiêu tiết kiệm mới
  async createSaving(walletId, savingData) {
    try {
      console.log('Creating saving with data:', savingData);
      
      const requestData = {
        title: savingData.title,
        currency: savingData.currency || 'VND',
        targetAmount: parseFloat(savingData.targetAmount),
        type: savingData.type, // GOAL / PERIODIC
        category: savingData.category,
        targetDate: savingData.type === 'GOAL' ? savingData.targetDate : null,
        period: savingData.type === 'PERIODIC' ? savingData.period : null
      };
      
      console.log('Request data:', requestData);
      
      const response = await fetch(API_ENDPOINTS.SAVINGS.CREATE(walletId), {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(requestData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo tiết kiệm');
      }

      // Format lại response
      const formattedSaving = {
        id: data.id,
        title: data.title,
        currency: data.currency,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        progress: data.progress || 0,
        type: data.type,
        category: data.category,
        targetDate: data.targetDate,
        period: data.period,
        walletId: data.walletId,
        transactions: data.transactions || []
      };

      return {
        success: true,
        data: formattedSaving
      };
    } catch (error) {
      console.error('Create saving error:', error);
      return {
        success: false,
        error: error.message || 'Không thể tạo tiết kiệm',
        data: null
      };
    }
  },

  // Nạp tiền vào tiết kiệm
  async depositToSaving(savingId, depositData) {
    try {
      console.log('Depositing to saving:', { savingId, depositData });
      
      const requestData = {
        amount: parseFloat(depositData.amount),
        walletId: depositData.walletId,
        note: depositData.note || '',
        transactionDate: depositData.transactionDate || new Date().toISOString()
      };
      
      const response = await fetch(API_ENDPOINTS.SAVINGS.DEPOSIT(savingId), {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(requestData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể nạp tiền vào tiết kiệm');
      }

      // Format lại response
      const formattedSaving = {
        id: data.id,
        title: data.title,
        currency: data.currency,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        progress: data.progress || 0,
        type: data.type,
        category: data.category,
        targetDate: data.targetDate,
        period: data.period,
        walletId: data.walletId,
        transactions: data.transactions || []
      };

      return {
        success: true,
        data: formattedSaving
      };
    } catch (error) {
      console.error('Deposit to saving error:', error);
      return {
        success: false,
        error: error.message || 'Không thể nạp tiền vào tiết kiệm',
        data: null
      };
    }
  },

  // Rút tiền từ tiết kiệm
  async withdrawFromSaving(savingId, withdrawData) {
    try {
      console.log('Withdrawing from saving:', { savingId, withdrawData });
      
      const requestData = {
        amount: parseFloat(withdrawData.amount),
        walletId: withdrawData.walletId,
        note: withdrawData.note || '',
        transactionDate: withdrawData.transactionDate || new Date().toISOString()
      };
      
      const response = await fetch(API_ENDPOINTS.SAVINGS.WITHDRAW(savingId), {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(requestData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể rút tiền từ tiết kiệm');
      }

      const formattedSaving = {
        id: data.id,
        title: data.title,
        currency: data.currency,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        progress: data.progress || 0,
        type: data.type,
        category: data.category,
        targetDate: data.targetDate,
        period: data.period,
        walletId: data.walletId,
        transactions: data.transactions || []
      };

      return {
        success: true,
        data: formattedSaving
      };
    } catch (error) {
      console.error('Withdraw from saving error:', error);
      return {
        success: false,
        error: error.message || 'Không thể rút tiền từ tiết kiệm',
        data: null
      };
    }
  },

  // Format số tiền
  formatAmount(amount, currency = 'VND') {
    if (!amount && amount !== 0) return '0₫';
    const symbol = currency === 'VND' ? '₫' : '$';
    if (amount >= 1_000_000_000) {
      return (amount / 1_000_000_000).toFixed(1) + symbol;
    } else if (amount >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1) + 'M' + symbol;
    } else if (amount >= 1_000) {
      return (amount / 1_000).toFixed(1) + 'K' + symbol;
    }
    return amount.toLocaleString('vi-VN') + symbol;
  },

  // Tính phần trăm tiến độ
  calculateProgress(currentAmount, targetAmount) {
    if (!targetAmount || targetAmount === 0) return 0;
    return (currentAmount / targetAmount) * 100;
  }
};