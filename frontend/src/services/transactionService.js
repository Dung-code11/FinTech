import API_ENDPOINTS from '../config/api';
import {
  extractDateKey,
  formatDateKeyForDisplay,
  formatLocalDate,
  formatLocalTime,
  getSortableTimestamp
} from '../utils/date';

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
    Accept: 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const normalizeSearchValue = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

const getDisplayAmount = (type, amount) => {
  if (type === 'EXPENSE') {
    return `-${amount.toLocaleString()} VND`;
  }

  if (type === 'INCOME') {
    return `+${amount.toLocaleString()} VND`;
  }

  return `${amount.toLocaleString()} VND`;
};

const iconRules = [
  { patterns: ['an', 'uong', 'buffet', 'lau', 'com', 'banh', 'tra sua', 'mixue', 'cafe'], icon: '🍜' },
  { patterns: ['xang', 'do xang', 'di chuyen', 'xe', 'bus', 'grab', 'taxi'], icon: '⛽' },
  { patterns: ['mua sam', 'shopping', 'online', 'shopee', 'lazada'], icon: '🛍️' },
  { patterns: ['giai tri', 'netflix', 'game', 'phim', 'karaoke'], icon: '🎮' },
  { patterns: ['luong', 'thu nhap', 'thuong', 'hoc bong', 'du an'], icon: '💼' },
  { patterns: ['me cho', 'bo cho', 'cho tien', 'qua tang', 'mung'], icon: '🎁' },
  { patterns: ['saving', 'tiet kiem', 'withdraw saving'], icon: '🏦' },
  { patterns: ['tra no', 'vay', 'debt'], icon: '💳' },
  { patterns: ['dau tu', 'crypto', 'bitcoin', 'chung khoan'], icon: '📈' },
  { patterns: ['nha', 'dien', 'nuoc', 'wifi', 'internet', 'phong tro'], icon: '🏠' },
  { patterns: ['suc khoe', 'benh vien', 'thuoc', 'kham'], icon: '💊' },
  { patterns: ['hoc', 'sach', 'khoa hoc', 'hoc phi'], icon: '📚' }
];

const getTransactionIcon = ({ type, categoryName, description }) => {
  if (type === 'TRANSFER') return '🔄';

  const haystack = normalizeSearchValue(`${categoryName || ''} ${description || ''}`);
  const matchedRule = iconRules.find((rule) =>
    rule.patterns.some((pattern) => haystack.includes(pattern))
  );

  if (matchedRule) {
    return matchedRule.icon;
  }

  if (type === 'EXPENSE') return '💸';
  if (type === 'INCOME') return '💰';
  return '📄';
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
        throw new Error(getErrorMessage(data, 'Khong the lay danh sach giao dich'));
      }

      if (data !== null && !Array.isArray(data)) {
        throw new Error('Du lieu giao dich khong hop le');
      }

      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };
    } catch (error) {
      console.error('Get all transactions error:', error);
      return {
        success: false,
        error: error.message || 'Khong the lay danh sach giao dich',
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
        throw new Error(getErrorMessage(data, 'Khong the lay thong tin giao dich'));
      }

      if (!data || Array.isArray(data)) {
        throw new Error('Du lieu giao dich khong hop le');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get transaction by id error:', error);
      return {
        success: false,
        error: error.message || 'Khong the lay thong tin giao dich',
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
        throw new Error(getErrorMessage(data, 'Khong the tao giao dich'));
      }

      if (!data || Array.isArray(data)) {
        throw new Error('Phan hoi tao giao dich khong hop le');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Create transaction error:', error);
      return {
        success: false,
        error: error.message || 'Khong the tao giao dich'
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
        throw new Error(getErrorMessage(data, 'Khong the cap nhat giao dich'));
      }

      if (!data || Array.isArray(data)) {
        throw new Error('Phan hoi cap nhat giao dich khong hop le');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Update transaction error:', error);
      return {
        success: false,
        error: error.message || 'Khong the cap nhat giao dich'
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
        throw new Error(getErrorMessage(data, 'Khong the xoa giao dich'));
      }

      return {
        success: true,
        message: getErrorMessage(data, 'Xoa giao dich thanh cong'),
        data
      };
    } catch (error) {
      console.error('Delete transaction error:', error);
      return {
        success: false,
        error: error.message || 'Khong the xoa giao dich'
      };
    }
  },

  formatTransaction(transaction) {
    if (!transaction) return null;

    const type = transaction.type || 'EXPENSE';
    const amount = Number(transaction.amount) || 0;
    const walletId = transaction.wallet?.id || transaction.walletId || null;
    const walletName = transaction.wallet?.name || transaction.walletName || '';
    const toWalletId = transaction.toWallet?.id || transaction.toWalletId || null;
    const toWalletName = transaction.toWallet?.name || transaction.toWalletName || '';
    const categoryId = transaction.category?.id || transaction.categoryId || null;
    const categoryName =
      transaction.category?.categoryName ||
      transaction.category?.name ||
      transaction.categoryName ||
      'Khac';
    const createdAt = transaction.createdAt || new Date().toISOString();
    const dateKey = extractDateKey(createdAt);

    return {
      id: transaction.id,
      type,
      amount,
      description: transaction.description || '',
      walletId,
      walletName,
      toWalletId,
      toWalletName,
      categoryId,
      categoryName,
      createdAt,
      dateKey,
      displayAmount: getDisplayAmount(type, amount),
      displayDate: dateKey
        ? formatDateKeyForDisplay(dateKey, 'vi-VN')
        : formatLocalDate(createdAt, 'vi-VN'),
      displayTime: formatLocalTime(createdAt, 'vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      icon: getTransactionIcon({
        type,
        categoryName,
        description: transaction.description || ''
      })
    };
  },

  groupTransactionsByDate(transactions) {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) return [];

    const groups = {};

    transactions.forEach((transaction) => {
      const dateKey = transaction.dateKey || extractDateKey(transaction.createdAt) || 'unknown';

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(transaction);
    });

    return Object.entries(groups)
      .sort((first, second) => {
        if (first[0] === 'unknown') return 1;
        if (second[0] === 'unknown') return -1;
        return second[0].localeCompare(first[0]);
      })
      .map(([date, groupedTransactions]) => ({
        date,
        displayDate:
          date !== 'unknown'
            ? formatDateKeyForDisplay(date, 'vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Khong xac dinh',
        transactions: [...groupedTransactions].sort(
          (first, second) => getSortableTimestamp(second.createdAt) - getSortableTimestamp(first.createdAt)
        ),
        total: groupedTransactions.reduce((sum, transaction) => {
          if (transaction.type === 'EXPENSE') return sum - (transaction.amount || 0);
          if (transaction.type === 'INCOME') return sum + (transaction.amount || 0);
          return sum;
        }, 0)
      }));
  },

  filterTransactions(transactions, filters) {
    if (!transactions || !Array.isArray(transactions)) return [];

    const query = normalizeSearchValue(filters.searchQuery);

    return transactions.filter((transaction) => {
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

      const transactionDate = transaction.dateKey || extractDateKey(transaction.createdAt);

      if (filters.startDate && transactionDate && transactionDate < filters.startDate) {
        return false;
      }

      if (filters.endDate && transactionDate && transactionDate > filters.endDate) {
        return false;
      }

      if (filters.minAmount !== null && filters.minAmount !== undefined && transaction.amount < filters.minAmount) {
        return false;
      }

      if (filters.maxAmount !== null && filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) {
        return false;
      }

      if (query) {
        const searchableValues = [
          transaction.description,
          transaction.categoryName,
          transaction.walletName,
          transaction.toWalletName,
          transaction.type,
          transaction.amount
        ];

        const matched = searchableValues.some((value) =>
          normalizeSearchValue(value).includes(query)
        );

        if (!matched) {
          return false;
        }
      }

      return true;
    });
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
