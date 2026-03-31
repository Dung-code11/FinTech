import React, { createContext, useState, useContext, useEffect } from 'react';
import { debtService } from '../services/debtService';
import { useAuth } from '../hooks/useAuth';

export const DebtContext = createContext();

export const DebtProvider = ({ children }) => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadDebts();
    }
  }, [isAuthenticated]);

  const loadDebts = async () => {
    setLoading(true);
    setError(null);
    
    const result = await debtService.getAllDebts();
    
    if (result.success) {
      setDebts(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const createDebt = async (debtData) => {
    setLoading(true);
    setError(null);
    
    const result = await debtService.createDebt(debtData);
    
    if (result.success) {
      await loadDebts();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const payDebt = async (debtId, paymentData) => {
    setLoading(true);
    setError(null);
    
    console.log('Paying debt with ID:', debtId, 'Data:', paymentData);
    
    const result = await debtService.payDebt(debtId, paymentData);
    
    if (result.success) {
      await loadDebts();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const getPaymentHistory = async (debtId) => {
    return await debtService.getPaymentHistory(debtId);
  };

  const value = {
    debts,
    loading,
    error,
    loadDebts,
    createDebt,
    payDebt,
    getPaymentHistory
  };

  return (
    <DebtContext.Provider value={value}>
      {children}
    </DebtContext.Provider>
  );
};

export const useDebt = () => {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebt must be used within a DebtProvider');
  }
  return context;
};