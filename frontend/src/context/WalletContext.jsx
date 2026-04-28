import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { walletService } from "../services/walletService";
import { useAuth } from "../hooks/useAuth";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const loadingRef = useRef(false); // Thêm ref để tránh duplicate calls

  useEffect(() => {
    if (isAuthenticated) {
      loadWallets();
    }
  }, [isAuthenticated]);

  const loadWallets = async () => {
    // Tránh gọi đồng thời nhiều lần
    if (loadingRef.current) {
      console.log('⚠️ loadWallets already in progress, skipping...');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    const result = await walletService.getWallets();

    if (result.success) {
      // Kiểm tra duplicate IDs trước khi set state
      const uniqueWallets = result.data.filter((wallet, index, self) => 
        index === self.findIndex(w => w.id === wallet.id)
      );
      
      if (uniqueWallets.length !== result.data.length) {
        console.warn('⚠️ Duplicate wallets detected and removed!', {
          original: result.data.length,
          unique: uniqueWallets.length
        });
      }
      
      setWallets(uniqueWallets);
    } else {
      setError(result.error);
    }

    setLoading(false);
    loadingRef.current = false;
  };

  const getWalletById = async (walletId) => {
    setLoading(true);
    setError(null);

    const result = await walletService.getWalletById(walletId);

    setLoading(false);
    return result;
  };

  const createWallet = async (walletData) => {
    // Thêm debounce cho create
    if (loadingRef.current) {
      console.log('⚠️ Already creating wallet, skipping...');
      return { success: false, error: 'Đang xử lý, vui lòng đợi' };
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    const result = await walletService.createWallet(walletData);

    if (result.success) {
      // Đợi 500ms trước khi reload để tránh race condition
      setTimeout(async () => {
        await loadWallets();
      }, 500);
    } else {
      setError(result.error);
    }

    setLoading(false);
    loadingRef.current = false;
    return result;
  };

  const updateWallet = async (walletId, walletData) => {
    setLoading(true);
    setError(null);

    const result = await walletService.updateWallet(walletId, walletData);

    if (result.success) {
      await loadWallets();
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const deleteWallet = async (walletId) => {
    setLoading(true);
    setError(null);

    const result = await walletService.deleteWallet(walletId);

    if (result.success) {
      await loadWallets();
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const getTotalBalance = () => {
    return wallets.reduce((total, wallet) => {
      if (wallet.type === "CASH") {
        return total + (wallet.balance || 0);
      } else {
        const availableCredit =
          (wallet.creditLimit || 0) - (wallet.unpaidBalance || 0);
        return total + availableCredit;
      }
    }, 0);
  };

  const getWalletOptions = () => {
    return [
      { id: "all", name: "Tất cả ví", type: "ALL" },
      ...wallets.map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        balance: wallet.type === "CASH" ? wallet.balance : wallet.creditLimit,
        unpaidBalance: wallet.unpaidBalance,
      })),
    ];
  };

  const value = {
    wallets,
    loading,
    error,
    loadWallets,
    getWalletById,
    createWallet,
    updateWallet,
    deleteWallet,
    getTotalBalance,
    getWalletOptions,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};