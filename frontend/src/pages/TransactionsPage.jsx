import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useTransaction } from '../context/TransactionContext';
import { useCategory } from '../context/CategoryContext';
import BottomNav from '../components/layout/BottomNav';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import styles from '../css/TransactionsPage.module.css';
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  CreditCard,
  PiggyBank,
  Home,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';

const TransactionsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [amountRange, setAmountRange] = useState({
    min: '',
    max: ''
  });

  const navigate = useNavigate();
  const { wallets, loadWallets, updateWalletBalance } = useWallet();
  const { 
    transactions, 
    loading, 
    error,
    loadTransactions,
    getGroupedTransactions,
    getTotals,
    deleteTransaction 
  } = useTransaction();
  const { expenseCategories, incomeCategories, loadAllCategories } = useCategory();

  // Format số tiền
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format số tiền rút gọn
  const formatCompactAmount = (amount) => {
    if (!amount && amount !== 0) return '0₫';
    
    const absValue = Math.abs(amount);
    
    if (absValue >= 1_000_000_000) {
      return (amount / 1_000_000_000).toFixed(1) + 'B₫';
    } else if (absValue >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1) + 'M₫';
    } else if (absValue >= 1_000) {
      return (amount / 1_000).toFixed(1) + 'K₫';
    }
    
    return amount.toLocaleString('vi-VN') + '₫';
  };

  // Tính số dư hiện tại của từng ví
  const calculateWalletBalances = () => {
    const balances = {};
    
    wallets.forEach(w => {
      if (w.type === 'CASH') {
        balances[w.id] = w.initialBalance || 0;
      } else {
        balances[w.id] = (w.creditLimit || 0) - (w.unpaidBalance || 0);
      }
    });

    transactions.forEach(t => {
      if (t.type === 'INCOME' && balances[t.walletId] !== undefined) {
        balances[t.walletId] += t.amount;
      } else if (t.type === 'EXPENSE' && balances[t.walletId] !== undefined) {
        balances[t.walletId] -= t.amount;
      } else if (t.type === 'TRANSFER' && t.walletId && t.toWalletId) {
        if (balances[t.walletId] !== undefined) {
          balances[t.walletId] -= t.amount;
        }
        if (balances[t.toWalletId] !== undefined) {
          balances[t.toWalletId] += t.amount;
        }
      }
    });

    return balances;
  };

  // Lấy số dư hiện tại của ví được chọn
  const getCurrentWalletBalance = (walletId) => {
    if (walletId === 'all') return null;
    
    const balances = calculateWalletBalances();
    const wallet = wallets.find(w => w.id === walletId);
    
    if (!wallet) return 0;
    
    if (wallet.type === 'CASH') {
      return balances[walletId] || 0;
    } else {
      const availableBalance = balances[walletId] || 0;
      const creditLimit = wallet.creditLimit || 0;
      return creditLimit - availableBalance;
    }
  };

  // Format wallets cho dropdown với số dư động
  const walletOptions = [
    { 
      id: 'all', 
      name: 'Tất cả ví', 
      icon: <Wallet size={16} />, 
      balance: '0₫', 
      color: '#64748b' 
    },
    ...(Array.isArray(wallets) ? wallets.map(w => {
      const currentBalance = getCurrentWalletBalance(w.id);
      const balanceDisplay = w.type === 'CASH' 
        ? formatCompactAmount(currentBalance)
        : formatCompactAmount(w.creditLimit - currentBalance) + ' (dư nợ)';
      
      return {
        id: w.id,
        name: w.name,
        icon: w.type === 'CASH' ? <Wallet size={16} /> : <CreditCard size={16} />,
        balance: balanceDisplay,
        color: w.type === 'CASH' ? '#1976d2' : '#ef4444'
      };
    }) : [])
  ];

  // Format categories cho filter - SỬA LẠI ĐỂ DÙNG ID
  const categoryOptions = [
    { id: 'all', name: 'Tất cả' },
    ...(Array.isArray(expenseCategories) ? expenseCategories.map(c => ({ 
      id: c.id, // Dùng ID thật
      name: c.name 
    })) : []),
    ...(Array.isArray(incomeCategories) ? incomeCategories.map(c => ({ 
      id: c.id, // Dùng ID thật
      name: c.name 
    })) : [])
  ];

  const selectedWalletData = walletOptions.find(w => w.id === selectedWallet) || walletOptions[0];

  // Filter transactions - SỬA LẠI PHẦN LỌC THEO DANH MỤC
  const filters = {
    walletId: selectedWallet !== 'all' ? selectedWallet : null,
    searchQuery,
    category: selectedCategory !== 'all' ? selectedCategory : null, // Giờ là ID
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    minAmount: amountRange.min ? parseFloat(amountRange.min) : null,
    maxAmount: amountRange.max ? parseFloat(amountRange.max) : null
  };

  const totals = getTotals(filters);
  const groupedTransactions = getGroupedTransactions(filters);

  // Xử lý chọn ví
  const handleWalletSelect = (walletId) => {
    console.log('Selected wallet ID:', walletId);
    setSelectedWallet(walletId);
    setShowWalletDropdown(false);
  };

  // Xử lý chọn danh mục
  const handleCategorySelect = (categoryId) => {
    console.log('Selected category ID:', categoryId);
    setSelectedCategory(categoryId);
  };

  // Xử lý xóa giao dịch
  const handleDeleteTransaction = async (transaction) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      await deleteTransaction(transaction.id);
    }
  };

  // Xử lý sửa giao dịch
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setDateRange({ startDate: '', endDate: '' });
    setAmountRange({ min: '', max: '' });
    setSelectedPeriod('month');
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
  };

  const periods = [
    { id: 'today', label: 'Hôm nay', days: 1 },
    { id: 'yesterday', label: 'Hôm qua', days: -1 },
    { id: 'week', label: 'Tuần này', days: 7 },
    { id: 'month', label: 'Tháng này', days: 30 },
    { id: 'custom', label: 'Tùy chọn', days: null }
  ];

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadWallets();
    loadAllCategories();
    loadTransactions();
  }, []);

  return (
    <div className={styles.transactionsPage}>
      <main className={styles.mainContent}>
        {/* Transactions Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Giao dịch</h1>
            <div className={styles.statsBadge}>
              <span className={styles.statItem}>
                <TrendingDown size={14} color="#ef4444" />
                <span>{formatCompactAmount(totals.totalExpense)}</span>
              </span>
              <span className={styles.statDivider}>|</span>
              <span className={styles.statItem}>
                <TrendingUp size={14} color="#1976d2" />
                <span>{formatCompactAmount(totals.totalIncome)}</span>
              </span>
              <span className={styles.statDivider}>|</span>
              <span className={styles.statItem}>
                <Wallet size={14} color="#64748b" />
                <span>{formatCompactAmount(totals.totalIncome - totals.totalExpense)}</span>
              </span>
            </div>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            <span>Thêm giao dịch</span>
          </button>
        </div>

        {/* Wallet Selector */}
        <div className={styles.walletSelector}>
          <div className={styles.walletSelectorHeader}>
            <Wallet size={18} className={styles.walletIcon} />
            <span className={styles.walletSelectorLabel}>Chọn ví:</span>
          </div>
          
          <div className={styles.walletDropdown}>
            <button 
              className={styles.walletDropdownBtn}
              onClick={() => setShowWalletDropdown(!showWalletDropdown)}
            >
              <span className={styles.selectedWallet}>
                {selectedWalletData?.icon}
                <span>{selectedWalletData?.name}</span>
              </span>
              <span className={styles.walletBalance}>{selectedWalletData?.balance}</span>
              <ChevronDown 
                size={18} 
                className={`${styles.dropdownIcon} ${showWalletDropdown ? styles.rotated : ''}`} 
              />
            </button>

            {showWalletDropdown && (
              <div className={styles.walletDropdownMenu}>
                {walletOptions.map(wallet => (
                  <button
                    key={wallet.id}
                    className={`${styles.walletOption} ${selectedWallet === wallet.id ? styles.active : ''}`}
                    onClick={() => handleWalletSelect(wallet.id)}
                  >
                    <span className={styles.walletOptionIcon} style={{ color: wallet.color }}>
                      {wallet.icon}
                    </span>
                    <div className={styles.walletOptionInfo}>
                      <span className={styles.walletOptionName}>{wallet.name}</span>
                      <span className={styles.walletOptionBalance} style={{ color: wallet.color }}>
                        {wallet.balance}
                      </span>
                    </div>
                    {selectedWallet === wallet.id && (
                      <Check size={16} className={styles.walletOptionCheck} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className={styles.filtersBar}>
          <div className={styles.periodSelector}>
            <Calendar size={18} className={styles.calendarIcon} />
            <select 
              className={styles.periodSelect}
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.searchBar}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm giao dịch..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterActions}>
            <button 
              className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Lọc</span>
              {(dateRange.startDate || dateRange.endDate || amountRange.min || amountRange.max || selectedCategory !== 'all') && (
                <span className={styles.filterBadge} />
              )}
            </button>
            <button className={styles.exportBtn}>
              <Download size={18} />
            </button>
            <div className={styles.viewToggle}>
              <button 
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋
              </button>
              <button 
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
              >
                🔲
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.advancedFilters}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Danh mục</label>
                <div className={styles.categoryFilter}>
                  {categoryOptions.map(cat => (
                    <button
                      key={cat.id}
                      className={`${styles.categoryChip} ${selectedCategory === cat.id ? styles.active : ''}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Khoảng thời gian</label>
                <div className={styles.dateRange}>
                  <input 
                    type="date" 
                    className={styles.dateInput} 
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                  <span>→</span>
                  <input 
                    type="date" 
                    className={styles.dateInput}
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label>Số tiền</label>
                <div className={styles.amountRange}>
                  <input 
                    type="number" 
                    placeholder="Từ" 
                    className={styles.amountInput}
                    value={amountRange.min}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                  <span>→</span>
                  <input 
                    type="number" 
                    placeholder="Đến" 
                    className={styles.amountInput}
                    value={amountRange.max}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className={styles.filterActions}>
              <button className={styles.clearBtn} onClick={resetFilters}>
                <X size={16} />
                Xóa bộ lọc
              </button>
              <button className={styles.applyBtn} onClick={applyFilters}>
                <Check size={16} />
                Áp dụng
              </button>
            </div>
          </div>
        )}

        {/* Transactions Content */}
        <div className={styles.transactionsContent}>
          {/* Loading State */}
          {loading && (
            <div className={styles.loadingState}>
              <RefreshCw size={40} className={styles.spinner} />
              <p>Đang tải giao dịch...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Có lỗi xảy ra</h3>
              <p>{error}</p>
              <button className={styles.retryBtn} onClick={loadTransactions}>
                Thử lại
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && groupedTransactions.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Wallet size={64} />
              </div>
              <h3 className={styles.emptyTitle}>Chưa có giao dịch nào</h3>
              <p className={styles.emptyDescription}>
                {selectedWallet === 'all' 
                  ? 'Chưa có giao dịch nào được ghi nhận. Nhấn vào nút "+" để bắt đầu thêm giao dịch mới.'
                  : `Ví "${selectedWalletData?.name}" chưa có giao dịch nào. Nhấn vào nút "+" để thêm giao dịch cho ví này.`
                }
              </p>
              <button 
                className={styles.emptyAddBtn}
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={18} />
                Thêm giao dịch đầu tiên
              </button>
            </div>
          )}

          {/* Transactions List */}
          {!loading && !error && groupedTransactions.length > 0 && (
            <div className={viewMode === 'list' ? styles.transactionsList : styles.transactionsGrid}>
              {groupedTransactions.map(group => (
                <div key={group.date} className={styles.dateGroup}>
                  <div className={styles.dateHeader}>
                    <span className={styles.date}>{group.displayDate}</span>
                    <span className={`${styles.groupTotal} ${group.total >= 0 ? styles.positive : styles.negative}`}>
                      {formatCompactAmount(Math.abs(group.total))}
                      {group.total >= 0 ? ' (thu)' : ' (chi)'}
                    </span>
                  </div>
                  
                  {group.transactions.map(transaction => {
                    const wallet = Array.isArray(wallets) ? wallets.find(w => w.id === transaction.walletId) : null;
                    return (
                      <div key={transaction.id} className={styles.transactionCard}>
                        <div className={styles.transactionIcon}>
                          {transaction.icon}
                        </div>
                        <div className={styles.transactionInfo}>
                          <div className={styles.transactionMain}>
                            <span className={styles.transactionName}>
                              {transaction.description || 'Không có mô tả'}
                            </span>
                            <span className={`${styles.transactionAmount} ${styles[transaction.type?.toLowerCase()]}`}>
                              {transaction.displayAmount}
                            </span>
                          </div>
                          <div className={styles.transactionMeta}>
                            <span className={styles.transactionCategory}>
                              {transaction.categoryName || 'Khác'}
                            </span>
                            <span className={styles.transactionTime}>
                              {transaction.displayTime}
                            </span>
                            {wallet && (
                              <span className={styles.transactionWallet}>
                                • {wallet.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={styles.transactionActions}>
                          <button 
                            className={styles.actionBtn}
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDeleteTransaction(transaction)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && groupedTransactions.length > 0 && (
            <div className={styles.pagination}>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}>2</button>
              <button className={styles.pageBtn}>3</button>
              <span className={styles.pageDots}>...</span>
              <button className={styles.pageBtn}>10</button>
              <button 
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <AddTransactionModal 
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            wallets={wallets}
            categories={{ expense: expenseCategories, income: incomeCategories }}
            onSuccess={() => {
              loadTransactions();
              loadWallets();
            }}
          />
        )}

        {/* Edit Transaction Modal */}
        {showEditModal && selectedTransaction && (
          <AddTransactionModal 
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTransaction(null);
            }}
            transaction={selectedTransaction}
            wallets={wallets}
            categories={{ expense: expenseCategories, income: incomeCategories }}
            isEditing={true}
            onSuccess={() => {
              loadTransactions();
              loadWallets();
            }}
          />
        )}

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};

export default TransactionsPage;