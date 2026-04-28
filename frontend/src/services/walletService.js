import API_ENDPOINTS from '../config/api';

const handleResponse = async (response) => {
  const responseText = await response.text();

  console.log('Wallet API Response:', {
    status: response.status,
    text: responseText,
  });

  if (!responseText || responseText.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    return { message: responseText };
  }
};

const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const getErrorMessage = (data, fallback) => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  return fallback;
};

const toNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const normalizeWalletType = (type) => {
  return String(type || '').toUpperCase() === 'CREDIT' ? 'CREDIT' : 'CASH';
};

const normalizeWallet = (wallet = {}) => {
  const type = normalizeWalletType(wallet.type);
  const normalizedWallet = {
    ...wallet,
    type,
    currency: wallet.currency || 'VND',
  };

  if (type === 'CREDIT') {
    const creditLimit = toNumber(wallet.creditLimit);
    const unpaidBalance = toNumber(wallet.unpaidBalance);
    const availableBalance = Math.max(creditLimit - unpaidBalance, 0);

    return {
      ...normalizedWallet,
      balance: availableBalance,
      initialBalance: 0,
      creditLimit,
      unpaidBalance,
      availableBalance,
      displayBalance: `${availableBalance.toLocaleString('vi-VN')}₫`,
      displayUnpaid: `${unpaidBalance.toLocaleString('vi-VN')}₫`,
    };
  }

  const initialBalance = toNumber(wallet.balance ?? wallet.initialBalance);

  return {
    ...normalizedWallet,
    balance: initialBalance,
    initialBalance,
    creditLimit: toNumber(wallet.creditLimit),
    unpaidBalance: toNumber(wallet.unpaidBalance),
    availableBalance: initialBalance,
    displayBalance: `${initialBalance.toLocaleString('vi-VN')}₫`,
    displayUnpaid: '0₫',
  };
};

const normalizeWalletTypeForRequest = (type) => {
  if (type === 'cash') return 'CASH';
  if (type === 'credit') return 'CREDIT';
  return normalizeWalletType(type);
};

export const walletService = {
  async getWallets() {
    try {
      const response = await fetch(API_ENDPOINTS.WALLET.GET_ALL, {
        method: 'GET',
        headers: createHeaders(true),
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Khong the lay danh sach vi'));
      }

      const wallets = Array.isArray(data) ? data.map(normalizeWallet) : [];

      return {
        success: true,
        data: wallets,
      };
    } catch (error) {
      console.error('Get wallets error:', error);
      return {
        success: false,
        error: error.message || 'Khong the lay danh sach vi',
      };
    }
  },

  async getWalletById(walletId) {
    try {
      const response = await fetch(API_ENDPOINTS.WALLET.GET_BY_ID(walletId), {
        method: 'GET',
        headers: createHeaders(true),
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Khong the lay thong tin vi'));
      }

      return {
        success: true,
        data: normalizeWallet(data),
      };
    } catch (error) {
      console.error('Get wallet by id error:', error);
      return {
        success: false,
        error: error.message || 'Khong the lay thong tin vi',
      };
    }
  },

  async createWallet(walletData) {
    try {
      const walletType = normalizeWalletTypeForRequest(walletData.type);
      const requestData = {
        name: walletData.name,
        currency: walletData.currency,
        type: walletType,
        initialBalance:
          walletType === 'CASH'
            ? toNumber(walletData.initialBalance ?? walletData.balance)
            : null,
        creditLimit: walletType === 'CREDIT' ? toNumber(walletData.creditLimit) : null,
        unpaidBalance: walletType === 'CREDIT' ? toNumber(walletData.unpaidBalance) : null,
        expiryDate:
          walletType === 'CREDIT' ? walletData.dueDate || walletData.expiryDate || null : null,
      };

      const response = await fetch(API_ENDPOINTS.WALLET.CREATE, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(requestData),
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Khong the tao vi moi'));
      }

      return {
        success: true,
        message: getErrorMessage(data, 'Tao vi thanh cong'),
        data,
      };
    } catch (error) {
      console.error('Create wallet error:', error);
      return {
        success: false,
        error: error.message || 'Khong the tao vi moi',
      };
    }
  },

  async updateWallet(walletId, walletData) {
    try {
      const walletType = normalizeWalletTypeForRequest(walletData.type);
      const requestData = {
        name: walletData.name,
        currency: walletData.currency,
        type: walletType,
        initialBalance:
          walletType === 'CASH'
            ? toNumber(walletData.initialBalance ?? walletData.balance)
            : null,
        creditLimit: walletType === 'CREDIT' ? toNumber(walletData.creditLimit) : null,
        unpaidBalance: walletType === 'CREDIT' ? toNumber(walletData.unpaidBalance) : null,
        expiryDate:
          walletType === 'CREDIT' ? walletData.dueDate || walletData.expiryDate || null : null,
      };

      const response = await fetch(API_ENDPOINTS.WALLET.UPDATE(walletId), {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(requestData),
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Khong the cap nhat vi'));
      }

      return {
        success: true,
        message: getErrorMessage(data, 'Cap nhat vi thanh cong'),
        data,
      };
    } catch (error) {
      console.error('Update wallet error:', error);
      return {
        success: false,
        error: error.message || 'Khong the cap nhat vi',
      };
    }
  },

  async deleteWallet(walletId) {
    try {
      const response = await fetch(API_ENDPOINTS.WALLET.DELETE(walletId), {
        method: 'DELETE',
        headers: createHeaders(true),
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Khong the xoa vi'));
      }

      return {
        success: true,
        message: getErrorMessage(data, 'Xoa vi thanh cong'),
        data,
      };
    } catch (error) {
      console.error('Delete wallet error:', error);
      return {
        success: false,
        error: error.message || 'Khong the xoa vi',
      };
    }
  },

  formatWalletForUI(walletResponse) {
    return normalizeWallet(walletResponse);
  },
};
