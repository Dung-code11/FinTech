import React, { createContext, useState, useContext, useEffect } from 'react';
import { savingsService } from '../services/savingsService';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from './WalletContext';

export const SavingsContext = createContext();

export const SavingsProvider = ({ children }) => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const { isAuthenticated } = useAuth();
  const { wallets } = useWallet();

  // Khi có ví, tự động chọn ví đầu tiên
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  // Load savings khi có ví được chọn
  useEffect(() => {
    if (isAuthenticated && selectedWalletId) {
      loadSavings();
    }
  }, [isAuthenticated, selectedWalletId]);

  const loadSavings = async () => {
    if (!selectedWalletId) return;
    
    setLoading(true);
    setError(null);
    
    const result = await savingsService.getSavingsByWallet(selectedWalletId);
    
    if (result.success) {
      setSavings(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const createSaving = async (savingData) => {
    if (!selectedWalletId) return;
    
    setLoading(true);
    setError(null);
    
    const result = await savingsService.createSaving(selectedWalletId, savingData);
    
    if (result.success) {
      await loadSavings();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const depositToSaving = async (savingId, depositData) => {
    setLoading(true);
    setError(null);
    
    const result = await savingsService.depositToSaving(savingId, depositData);
    
    if (result.success) {
      await loadSavings();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const withdrawFromSaving = async (savingId, withdrawData) => {
    setLoading(true);
    setError(null);
    
    const result = await savingsService.withdrawFromSaving(savingId, withdrawData);
    
    if (result.success) {
      await loadSavings();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const value = {
    savings,
    loading,
    error,
    selectedWalletId,
    setSelectedWalletId,
    loadSavings,
    createSaving,
    depositToSaving,
    withdrawFromSaving
  };

  return (
    <SavingsContext.Provider value={value}>
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
};