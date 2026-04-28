import React from "react";
import styles from "../../css/DashboardPage.module.css";
import { MoreHorizontal, Plus, Wallet, CreditCard, TrendingUp, TrendingDown } from "lucide-react";

// Card hiển thị thông tin một ví
export const WalletCard = ({ wallet, onClick, transactions = [] }) => {
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // CÁCH 1: Lấy số dư trực tiếp từ wallet (ĐÃ ĐÚNG)
  const getCurrentBalance = () => {
    if (!wallet) return 0;
    
    if (wallet.type === 'CASH') {
      // Số dư hiện tại đã được tính từ backend, không cần tính lại
      return wallet.balance || 0;
    } else {
      // Với thẻ tín dụng, dùng unpaidBalance
      return wallet.unpaidBalance || 0;
    }
  };

  // CÁCH 2: Nếu muốn tính từ transactions, phải tính từ 0
  const calculateBalanceFromTransactions = () => {
    if (!wallet) return 0;
    
    // KHÔNG dùng wallet.balance hoặc wallet.initialBalance làm gốc
    // Vì các transactions đã được tính vào số dư hiện tại rồi
    let balance = 0;
    
    const walletTransactions = transactions.filter(t => t.walletId === wallet.id);
    
    walletTransactions.forEach(t => {
      if (t.type === 'INCOME') {
        balance += t.amount;
      } else if (t.type === 'EXPENSE') {
        balance -= t.amount;
      }
    });
    
    return balance;
  };

  const currentBalance = getCurrentBalance(); // Dùng cách 1 (đúng)
  // const currentBalance = calculateBalanceFromTransactions(); // Dùng cách 2 (nếu transactions là tất cả từ đầu)

  return (
    <div 
      className={styles.statCard} 
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.statHeader}>
        <h3>{wallet?.name || 'Ví mới'}</h3>
        <button className={styles.moreBtn} aria-label="Xem thêm">
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className={styles.walletCardContent}>
        <div className={styles.walletIconLarge} style={{ backgroundColor: `${getWalletColor()}20`, color: getWalletColor() }}>
          {wallet?.type === 'CREDIT' ? <CreditCard size={32} /> : <Wallet size={32} />}
        </div>
        
        <div className={styles.walletDetails}>
          <div className={styles.walletType}>
            {wallet?.type === 'CREDIT' ? 'Thẻ tín dụng' : 'Tiền mặt'}
          </div>
          
          {wallet?.type === 'CREDIT' ? (
            <>
              <div className={styles.walletBalance}>
                <span className={styles.balanceLabel}>Hạn mức</span>
                <span className={styles.balanceValue}>{formatAmount(wallet.creditLimit)}</span>
              </div>
              <div className={styles.walletBalance}>
                <span className={styles.balanceLabel}>Dư nợ hiện tại</span>
                <span className={styles.debtValue}>{formatAmount(currentBalance)}</span>
              </div>
              <div className={styles.walletBalance}>
                <span className={styles.balanceLabel}>Còn lại</span>
                <span className={styles.balanceValue} style={{ color: '#10b981' }}>
                  {formatAmount((wallet.creditLimit || 0) - currentBalance)}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.walletBalance}>
              <span className={styles.balanceLabel}>Số dư</span>
              <span className={styles.balanceValue}>{formatAmount(currentBalance)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Thêm hàm getWalletColor bên ngoài
const getWalletColor = (wallet) => {
  if (wallet?.type === 'CREDIT') return '#ef4444';
  return '#1976d2';
};

// Card thêm ví mới
export const AddWalletCard = ({ onClick }) => {
  return (
    <div 
      className={`${styles.statCard} ${styles.addWalletCard}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.addWalletContent}>
        <div className={styles.addWalletIcon}>
          <Plus size={32} />
        </div>
        <h3>Thêm ví mới</h3>
        <p>Tạo ví mới để quản lý tài chính</p>
      </div>
    </div>
  );
};

// Component bọc các card ví (dùng trong trang chủ)
export const WalletGrid = ({ wallets = [], transactions = [], onAddWallet, onSelectWallet }) => {
  console.log('WalletGrid - Rendering wallets:', wallets.length);
  
  return (
    <div className={styles.walletGrid}>
      {Array.isArray(wallets) && wallets.map((wallet) => (
        <WalletCard 
          key={wallet.id} 
          wallet={wallet} 
          transactions={transactions}
          onClick={() => onSelectWallet?.(wallet)}
        />
      ))}
      <AddWalletCard onClick={onAddWallet} />
    </div>
  );
};

// Card chi tiêu hàng ngày
export const DailyExpenseCard = ({ todayExpense = 5113000, yesterdayExpense = 5234000 }) => {
  const calculateChange = () => {
    if (yesterdayExpense === 0) return "0%";
    const change = ((todayExpense - yesterdayExpense) / yesterdayExpense) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const change = calculateChange();
  const isIncrease = todayExpense > yesterdayExpense;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <h3>Chi Tiêu Hằng Ngày</h3>
        <button className={styles.moreBtn} aria-label="Xem thêm">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className={styles.statValue}>{formatAmount(todayExpense)}</div>
      <div className={styles.statFooter}>
        <span className={`${styles.statChange} ${isIncrease ? styles.increase : styles.decrease}`}>
          {isIncrease ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </span>
        <span className={styles.statDate}>so với hôm qua</span>
      </div>
    </div>
  );
};