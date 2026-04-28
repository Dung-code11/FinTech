import React, { createContext, useState, useContext, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../hooks/useAuth';

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load transactions khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
    }
  }, [isAuthenticated]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    const result = await transactionService.getAllTransactions();
    
    if (result.success) {
      // Kiểm tra result.data có phải là mảng không
      const transactionsData = Array.isArray(result.data) ? result.data : [];
      
      const formattedTransactions = transactionsData
        .map(t => transactionService.formatTransaction(t))
        .filter(t => t !== null); // Loại bỏ các transaction null
      
      setTransactions(formattedTransactions);
    } else {
      setError(result.error);
      setTransactions([]); // Set mảng rỗng khi lỗi
    }

    setLoading(false);
  };

  const getTransactionById = async (transactionId) => {
    setLoading(true);
    setError(null);

    const result = await transactionService.getTransactionById(transactionId);
    
    setLoading(false);
    return result;
  };

  const createTransaction = async (transactionData) => {
    setLoading(true);
    setError(null);

    const result = await transactionService.createTransaction(transactionData);
    
    if (result.success) {
      const formattedTransaction = transactionService.formatTransaction(result.data);
      if (formattedTransaction) {
        setTransactions(prev => [formattedTransaction, ...prev]);
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const updateTransaction = async (transactionId, transactionData) => {
    setLoading(true);
    setError(null);

    const result = await transactionService.updateTransaction(transactionId, transactionData);
    
    if (result.success) {
      const formattedTransaction = transactionService.formatTransaction(result.data);
      if (formattedTransaction) {
        setTransactions(prev => 
          prev.map(t => t.id === transactionId ? formattedTransaction : t)
        );
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const deleteTransaction = async (transactionId) => {
    setLoading(true);
    setError(null);

    const result = await transactionService.deleteTransaction(transactionId);
    
    if (result.success) {
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  // Lọc giao dịch
  const filterTransactions = (filters) => {
    return transactionService.filterTransactions(transactions, filters);
  };

  // Nhóm giao dịch theo ngày
  const getGroupedTransactions = (filters = {}) => {
    const filtered = transactionService.filterTransactions(transactions, filters);
    return transactionService.groupTransactionsByDate(filtered);
  };

  // Tính tổng thu/chi
  const getTotals = (filters = {}) => {
    const filtered = transactionService.filterTransactions(transactions, filters);
    return transactionService.calculateTotals(filtered);
  };

  const value = {
    transactions,
    loading,
    error,
    loadTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    filterTransactions,
    getGroupedTransactions,
    getTotals
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};