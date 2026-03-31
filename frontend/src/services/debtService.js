import API_ENDPOINTS from '../config/api';

const handleResponse = async (response) => {
  const responseText = await response.text();
  
  console.log('Debt API Response:', {
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

export const debtService = {
  // Lấy tất cả khoản nợ
  async getAllDebts() {
    try {
      console.log('Fetching all debts...');
      const response = await fetch(API_ENDPOINTS.DEBT.GET_ALL, {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách khoản nợ');
      }

      const debts = Array.isArray(data) ? data : [];
      
      // Format lại dữ liệu cho đồng bộ với backend
      const formattedDebts = debts.map(debt => ({
        id: debt.id,
        name: debt.name,
        amount: debt.totalAmount || 0,
        paidAmount: debt.paidAmount || 0,
        remainingAmount: debt.remainingAmount || (debt.totalAmount - (debt.paidAmount || 0)),
        lender: debt.lender || '',
        dueDate: debt.targetDate,
        walletId: debt.walletId,
        note: debt.note || '',
        createdAt: debt.createdDate,
        currency: debt.currency
      }));
      
      console.log('Formatted debts:', formattedDebts);
      
      return {
        success: true,
        data: formattedDebts
      };
    } catch (error) {
      console.error('Get all debts error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách khoản nợ',
        data: []
      };
    }
  },

  // Lấy chi tiết khoản nợ
  async getDebtById(debtId) {
    try {
      const response = await fetch(API_ENDPOINTS.DEBT.GET_BY_ID(debtId), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy thông tin khoản nợ');
      }

      const formattedDebt = {
        id: data.id,
        name: data.name,
        amount: data.totalAmount || 0,
        paidAmount: data.paidAmount || 0,
        remainingAmount: data.remainingAmount || (data.totalAmount - (data.paidAmount || 0)),
        lender: data.lender || '',
        dueDate: data.targetDate,
        walletId: data.walletId,
        note: data.note || '',
        createdAt: data.createdDate,
        currency: data.currency
      };

      return {
        success: true,
        data: formattedDebt
      };
    } catch (error) {
      console.error('Get debt by id error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thông tin khoản nợ',
        data: null
      };
    }
  },

  // Tạo khoản nợ mới
  async createDebt(debtData) {
    try {
      console.log('Creating debt with data:', debtData);
      
      const requestData = {
        name: debtData.name,
        totalAmount: parseFloat(debtData.amount),
        lender: debtData.lender || '',
        targetDate: debtData.dueDate,
        walletId: debtData.walletId,
        note: debtData.note || '',
        currency: 'VND'
      };
      
      console.log('Request data:', requestData);
      
      const response = await fetch(API_ENDPOINTS.DEBT.CREATE, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(requestData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo khoản nợ');
      }

      const formattedDebt = {
        id: data.id,
        name: data.name,
        amount: data.totalAmount || 0,
        paidAmount: 0,
        remainingAmount: data.totalAmount || 0,
        lender: data.lender || '',
        dueDate: data.targetDate,
        walletId: data.walletId,
        note: data.note || '',
        createdAt: data.createdDate,
        currency: data.currency
      };

      return {
        success: true,
        data: formattedDebt
      };
    } catch (error) {
      console.error('Create debt error:', error);
      return {
        success: false,
        error: error.message || 'Không thể tạo khoản nợ',
        data: null
      };
    }
  },

  // Trả nợ - QUAN TRỌNG: Thêm title vào request
  async payDebt(debtId, paymentData) {
    try {
      console.log('Paying debt:', { debtId, paymentData });
      
      const id = String(debtId);
      
      // Backend yêu cầu trường title
      const requestData = {
        title: paymentData.title || `Trả nợ`, // Thêm title bắt buộc
        amount: paymentData.amount,
        walletId: paymentData.walletId,
        note: paymentData.note || ''
      };
      
      console.log('Pay request data:', requestData);
      
      const response = await fetch(API_ENDPOINTS.DEBT.PAY(id), {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(requestData)
      });

      const data = await handleResponse(response);
      console.log('Pay response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Không thể trả nợ (${response.status})`);
      }

      // Format response trả nợ
      const formattedPayment = {
        id: data.id,
        title: data.title,
        amount: data.amount,
        paymentDate: data.paymentDate,
        walletId: data.walletId,
        debtId: data.debtId,
        note: data.note
      };

      console.log('Payment formatted:', formattedPayment);

      return {
        success: true,
        data: formattedPayment
      };
    } catch (error) {
      console.error('Pay debt error:', error);
      return {
        success: false,
        error: error.message || 'Không thể trả nợ',
        data: null
      };
    }
  },

  // Lấy lịch sử trả nợ
  async getPaymentHistory(debtId) {
    try {
      const response = await fetch(API_ENDPOINTS.DEBT.GET_PAYMENTS(debtId), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy lịch sử trả nợ');
      }

      const payments = Array.isArray(data) ? data : [];
      
      const formattedPayments = payments.map(payment => ({
        id: payment.id,
        title: payment.title,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        walletId: payment.walletId,
        debtId: payment.debtId,
        note: payment.note
      }));
      
      return {
        success: true,
        data: formattedPayments
      };
    } catch (error) {
      console.error('Get payment history error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy lịch sử trả nợ',
        data: []
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
  },

  // Tính phần trăm đã trả
  calculateProgress(paid, total) {
    if (!total || total === 0) return 0;
    return (paid / total) * 100;
  }
};