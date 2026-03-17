import React from "react";
import styles from "../../css/DashboardPage.module.css";
import { MoreHorizontal, Plus, Wallet } from "lucide-react";

export const DailyExpenseCard = () => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <h3>Chi Tiêu Hằng Ngày</h3>
        <button className={styles.moreBtn}>
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className={styles.statValue}>5.113.000₫</div>
      <div className={styles.statFooter}>
        <span className={styles.statChange}>-2.3%</span>
        <span className={styles.statDate}>so với hôm qua</span>
      </div>
    </div>
  );
};

export const WalletCard = ({ onClick }) => {
  return (
    <div
      className={`${styles.statCard} ${styles.walletCard}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.walletIcon}>
        <Wallet size={24} />
      </div>
      <div className={styles.walletInfo}>
        <h3>Ví mới</h3>
        <p className={styles.walletDate}>Tháng 🏠 tháng 3 năm 2026</p>
      </div>
      <button className={styles.addWalletBtn}>
        <Plus size={20} />
      </button>
    </div>
  );
};
