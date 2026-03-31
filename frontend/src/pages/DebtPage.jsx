import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDebt } from "../context/DebtContext";
import { useWallet } from "../context/WalletContext";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import DebtModal from "../components/debt/DebtModal";
import PayModal from "../components/debt/PayModal";
import { debtService } from "../services/debtService";
import styles from "../css/DebtPage.module.css";
import {
  Plus,
  Search,
  TrendingDown,
  Wallet,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Calendar,
  Users,
} from "lucide-react";

const DebtPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("debt");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Thêm trigger refresh
  
  const navigate = useNavigate();
  const { debts, loading, error, loadDebts, createDebt, payDebt } = useDebt();
  const { wallets, loadWallets } = useWallet();

  // Load dữ liệu khi component mount và khi refreshTrigger thay đổi
  useEffect(() => {
    loadWallets();
    loadDebts();
  }, [refreshTrigger]); // Thêm refreshTrigger vào dependency

  // Hàm refresh toàn bộ dữ liệu
  const refreshAllData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateDebt = async (debtData) => {
    const result = await createDebt(debtData);
    if (result.success) {
      setShowDebtModal(false);
      refreshAllData(); // Refresh sau khi tạo
    } else {
      alert(result.error || "Không thể tạo khoản nợ");
    }
  };

  const handlePayDebt = async (debtId, paymentData) => {
    console.log('Paying debt:', { debtId, paymentData });
    
    try {
      const result = await payDebt(debtId, paymentData);
      console.log('Payment result:', result);
      
      if (result.success) {
        setShowPayModal(false);
        setSelectedDebt(null);
        refreshAllData(); // Refresh sau khi trả nợ thành công
        
        // Hiển thị thông báo thành công
        alert('Trả nợ thành công!');
        return result;
      } else {
        alert(result.error || "Không thể trả nợ");
        return result;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
      return { success: false, error: error.message };
    }
  };

  const handleOpenPayModal = (debt) => {
    setSelectedDebt(debt);
    setShowPayModal(true);
  };

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const remaining = (debt.amount || 0) - (debt.paidAmount || 0);
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && remaining > 0) ||
      (filterStatus === "completed" && remaining <= 0);
    return matchesSearch && matchesStatus;
  });

  const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalPaid = debts.reduce((sum, d) => sum + (d.paidAmount || 0), 0);
  const totalRemaining = totalDebt - totalPaid;
  const overallProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;

  return (
    <div className={styles.debtPage}>
      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              <CreditCard size={32} className={styles.titleIcon} />
              Quản lý nợ
            </h1>
            <p className={styles.pageDescription}>
              Theo dõi và quản lý các khoản nợ của bạn
            </p>
          </div>
          <button
            className={styles.createBtn}
            onClick={() => setShowDebtModal(true)}
          >
            <Plus size={20} />
            <span>Thêm khoản nợ</span>
          </button>
        </div>

        {/* Overview Stats */}
        <div className={styles.overviewStats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fee2e2', color: '#ef4444' }}>
              <CreditCard size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Tổng nợ</span>
              <span className={styles.statValue}>{debtService.formatAmount(totalDebt)}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#d1fae5', color: '#10b981' }}>
              <TrendingDown size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Đã trả</span>
              <span className={styles.statValue}>{debtService.formatAmount(totalPaid)}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <Wallet size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Còn lại</span>
              <span className={styles.statValue}>{debtService.formatAmount(totalRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.overallProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
          <span className={styles.progressText}>
            Đã trả {overallProgress.toFixed(1)}% tổng nợ
          </span>
        </div>

        {/* Filters */}
        <div className={styles.filtersBar}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm khoản nợ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.statusFilter}>
            <button
              className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Tất cả
            </button>
            <button
              className={`${styles.filterBtn} ${filterStatus === 'active' ? styles.active : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              Đang trả
            </button>
            <button
              className={`${styles.filterBtn} ${filterStatus === 'completed' ? styles.active : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Đã xong
            </button>
          </div>
        </div>

        {/* Debts Grid */}
        <div className={styles.debtsGrid}>
          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw size={40} className={styles.spinner} />
              <p>Đang tải danh sách nợ...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <AlertCircle size={40} />
              <p>{error}</p>
              <button onClick={refreshAllData}>Thử lại</button>
            </div>
          ) : filteredDebts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💸</div>
              <h3>Chưa có khoản nợ nào</h3>
              <p>
                {searchQuery
                  ? 'Không tìm thấy khoản nợ phù hợp'
                  : 'Bắt đầu thêm khoản nợ để quản lý'}
              </p>
              {!searchQuery && (
                <button onClick={() => setShowDebtModal(true)}>
                  <Plus size={18} />
                  Thêm khoản nợ
                </button>
              )}
            </div>
          ) : (
            filteredDebts.map(debt => {
              const remaining = (debt.amount || 0) - (debt.paidAmount || 0);
              const progress = debt.amount > 0 ? ((debt.paidAmount || 0) / debt.amount) * 100 : 0;
              const isCompleted = remaining <= 0;
              
              return (
                <div key={debt.id} className={`${styles.debtCard} ${isCompleted ? styles.completed : ''}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h3>{debt.name}</h3>
                      <span className={`${styles.debtType} ${isCompleted ? styles.completed : styles.active}`}>
                        {isCompleted ? 'Đã hoàn thành' : 'Đang trả'}
                      </span>
                    </div>
                    <div className={styles.cardActions}>
                      <button 
                        className={styles.payBtn}
                        onClick={() => handleOpenPayModal(debt)}
                        disabled={isCompleted}
                      >
                        Trả nợ
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.amountSection}>
                      <div className={styles.amountItem}>
                        <span className={styles.amountLabel}>Tổng nợ</span>
                        <span className={styles.amountValue}>
                          {debtService.formatAmount(debt.amount)}
                        </span>
                      </div>
                      <div className={styles.amountItem}>
                        <span className={styles.amountLabel}>Đã trả</span>
                        <span className={styles.amountValue}>
                          {debtService.formatAmount(debt.paidAmount || 0)}
                        </span>
                      </div>
                      <div className={styles.amountItem}>
                        <span className={styles.amountLabel}>Còn lại</span>
                        <span className={`${styles.amountValue} ${remaining > 0 ? styles.remaining : styles.completedAmount}`}>
                          {debtService.formatAmount(remaining)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Tiến độ trả nợ</span>
                        <span className={styles.progressValue}>{progress.toFixed(1)}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={`${styles.progressFill} ${progress >= 100 ? styles.completedFill : ''}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <div className={styles.infoItem}>
                        <Calendar size={14} />
                        <span>Hạn: {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('vi-VN') : 'Không có'}</span>
                      </div>
                      {debt.lender && (
                        <div className={styles.infoItem}>
                          <Users size={14} />
                          <span>Chủ nợ: {debt.lender}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Debt Modal */}
        <DebtModal
          isOpen={showDebtModal}
          onClose={() => setShowDebtModal(false)}
          onSave={handleCreateDebt}
          wallets={wallets}
        />

        {/* Pay Modal */}
        {selectedDebt && (
          <PayModal
            isOpen={showPayModal}
            onClose={() => {
              setShowPayModal(false);
              setSelectedDebt(null);
            }}
            debt={selectedDebt}
            wallets={wallets}
            onPay={handlePayDebt}
          />
        )}
      </main>
    </div>
  );
};

export default DebtPage;