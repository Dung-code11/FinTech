import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavings } from '../context/SavingsContext';
import { useWallet } from '../context/WalletContext';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import SavingModal from '../components/savings/SavingModal';
import SavingsCard from '../components/savings/SavingsCard';
import { savingsService } from '../services/savingsService';
import styles from '../css/SavingsPage.module.css';
import {
  Plus,
  Search,
  Target,
  Repeat,
  PiggyBank,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Wallet
} from 'lucide-react';

const SavingsPage = ({ embedded = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('savings');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [savingType, setSavingType] = useState('goal');
  const [filterType, setFilterType] = useState('all');
  
  const navigate = useNavigate();
  const { savings, loading, error, loadSavings, selectedWalletId, setSelectedWalletId } = useSavings();
  const { wallets, loadWallets } = useWallet();

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  useEffect(() => {
    if (selectedWalletId) {
      loadSavings();
    }
  }, [selectedWalletId]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateSaving = (type) => {
    setSavingType(type);
    setShowSavingModal(true);
  };

  const filteredSavings = savings.filter(saving => {
    const matchesSearch = saving.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesType = filterType === 'all' || saving.type === filterType.toUpperCase();
    return matchesSearch && matchesType;
  });

  const totalTargetAmount = savings
    .filter(s => s.type === 'GOAL')
    .reduce((sum, s) => sum + (s.targetAmount || 0), 0);
  
  const totalSaved = savings
    .filter(s => s.type === 'GOAL')
    .reduce((sum, s) => sum + (s.currentAmount || 0), 0);
  
  const totalProgress = totalTargetAmount > 0 ? (totalSaved / totalTargetAmount) * 100 : 0;

  const recurringSavings = savings.filter(s => s.type === 'PERIODIC');
  const totalMonthlyRecurring = recurringSavings
    .filter(s => s.period === 'MONTHLY')
    .reduce((sum, s) => sum + (s.targetAmount || 0), 0);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  return (
    <div className={styles.savingsPage}>

      <main className={styles.mainContent}>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              <PiggyBank size={32} className={styles.titleIcon} />
              Tiết kiệm
            </h1>
            <p className={styles.pageDescription}>
              Đặt mục tiêu tiết kiệm và theo dõi tiến trình của bạn
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.createBtn} ${styles.goalBtn}`}
              onClick={() => handleCreateSaving('goal')}
            >
              <Target size={18} />
              <span>Mục tiêu mới</span>
            </button>
            <button
              className={`${styles.createBtn} ${styles.recurringBtn}`}
              onClick={() => handleCreateSaving('recurring')}
            >
              <Repeat size={18} />
              <span>Định kỳ</span>
            </button>
          </div>
        </div>

        {/* Wallet Selector */}
        <div className={styles.walletSelector}>
          <Wallet size={18} className={styles.walletIcon} />
          <select
            className={styles.walletSelect}
            value={selectedWalletId || ''}
            onChange={(e) => setSelectedWalletId(e.target.value)}
          >
            {wallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} - {wallet.type === 'CASH' ? 'Tiền mặt' : 'Thẻ tín dụng'}
              </option>
            ))}
          </select>
        </div>

        {/* Overview Stats */}
        <div className={styles.overviewStats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#e3f2fd', color: '#1976d2' }}>
              <Target size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Mục tiêu</span>
              <span className={styles.statValue}>{savings.filter(s => s.type === 'GOAL').length}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#d1fae5', color: '#10b981' }}>
              <PiggyBank size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Đã tiết kiệm</span>
              <span className={styles.statValue}>{savingsService.formatAmount(totalSaved)}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Định kỳ/tháng</span>
              <span className={styles.statValue}>{savingsService.formatAmount(totalMonthlyRecurring)}</span>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className={styles.overallProgress}>
          <div className={styles.progressHeader}>
            <span>Tiến độ chung</span>
            <span>{totalProgress.toFixed(1)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(totalProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersBar}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm mục tiêu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.typeFilter}>
            <button
              className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
              onClick={() => setFilterType('all')}
            >
              Tất cả
            </button>
            <button
              className={`${styles.filterBtn} ${filterType === 'goal' ? styles.active : ''}`}
              onClick={() => setFilterType('goal')}
            >
              Mục tiêu
            </button>
            <button
              className={`${styles.filterBtn} ${filterType === 'recurring' ? styles.active : ''}`}
              onClick={() => setFilterType('recurring')}
            >
              Định kỳ
            </button>
          </div>
        </div>

        {/* Savings Grid */}
        <div className={styles.savingsGrid}>
          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw size={40} className={styles.spinner} />
              <p>Đang tải danh sách tiết kiệm...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <AlertCircle size={40} />
              <p>{error}</p>
              <button onClick={loadSavings}>Thử lại</button>
            </div>
          ) : filteredSavings.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏦</div>
              <h3>Chưa có mục tiêu tiết kiệm nào</h3>
              <p>
                {searchQuery
                  ? 'Không tìm thấy kết quả phù hợp'
                  : 'Bắt đầu đặt mục tiêu tiết kiệm để đạt được ước mơ của bạn'}
              </p>
              {!searchQuery && (
                <div className={styles.emptyActions}>
                  <button onClick={() => handleCreateSaving('goal')}>
                    <Target size={18} />
                    Tạo mục tiêu
                  </button>
                  <button onClick={() => handleCreateSaving('recurring')}>
                    <Repeat size={18} />
                    Tiết kiệm định kỳ
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredSavings.map(saving => (
              <SavingsCard
                key={saving.id}
                saving={saving}
                onUpdate={loadSavings}
              />
            ))
          )}
        </div>

        {!embedded && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

        {/* Saving Modal */}
        <SavingModal
          isOpen={showSavingModal}
          onClose={() => setShowSavingModal(false)}
          savingType={savingType}
        />
      </main>
    </div>
  );
};

export default SavingsPage;
