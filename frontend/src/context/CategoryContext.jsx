import React, { createContext, useState, useContext, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../hooks/useAuth';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadAllCategories();
    }
  }, [isAuthenticated]);

  const loadAllCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load expense categories
      const expenseResult = await categoryService.getCategories('EXPENSE');
      if (expenseResult.success) {
        const formattedExpense = (Array.isArray(expenseResult.data) ? expenseResult.data : []).map(c => 
          categoryService.formatCategory(c)
        );
        setExpenseCategories(formattedExpense);
      }

      // Load income categories
      const incomeResult = await categoryService.getCategories('INCOME');
      if (incomeResult.success) {
        const formattedIncome = (Array.isArray(incomeResult.data) ? incomeResult.data : []).map(c => 
          categoryService.formatCategory(c)
        );
        setIncomeCategories(formattedIncome);
      }
    } catch (err) {
      console.error('Load categories error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    expenseCategories: Array.isArray(expenseCategories) ? expenseCategories : [],
    incomeCategories: Array.isArray(incomeCategories) ? incomeCategories : [],
    loading,
    error,
    loadAllCategories,
    // ... các functions khác giữ nguyên
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};