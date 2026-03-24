import React, { createContext, useState, useEffect, useContext } from "react";
import { walletService } from "../services/walletService";
import { useAuth } from "../hooks/useAuth";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load wallets khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadWallets();
    }
  }, [isAuthenticated]);

  const loadWallets = async () => {
    setLoading(true);
    setError(null);

    const result = await walletService.getWallets();

    if (result.success) {
      setWallets(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const getWalletById = async (walletId) => {
    setLoading(true);
    setError(null);

    const result = await walletService.getWalletById(walletId);

    setLoading(false);
    return result;
  };

  const createWallet = async (walletData) => {
    setLoading(true);
    setError(null);

    const result = await walletService.createWallet(walletData);

    if (result.success) {
      // Load lại danh sách ví sau khi tạo thành công
      await loadWallets();
    } else {
      setError(result.error);
    }

    setLoading(false);
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

  // Tính tổng số dư tất cả ví
  const getTotalBalance = () => {
    return wallets.reduce((total, wallet) => {
      if (wallet.type === "CASH") {
        return total + (wallet.balance || 0);
      } else {
        // Với thẻ tín dụng, tính số dư khả dụng = creditLimit - unpaidBalance
        const availableCredit =
          (wallet.creditLimit || 0) - (wallet.unpaidBalance || 0);
        return total + availableCredit;
      }
    }, 0);
  };

  // Lấy danh sách ví để hiển thị trong dropdown
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

// Custom hook để sử dụng WalletContext
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
