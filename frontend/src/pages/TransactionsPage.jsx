import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import BottomNav from '../components/layout/BottomNav';
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
  Home
} from 'lucide-react';

const TransactionsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Dữ liệu mẫu - danh sách ví
  const wallets = [
    { id: 'all', name: 'Tất cả ví', icon: <Wallet size={16} />, balance: '0đ', color: '#64748b' },
    { id: 'cash', name: 'Ví tiền mặt', icon: <Wallet size={16} />, balance: '5.000.000đ', color: '#1976d2' },
    { id: 'credit', name: 'Thẻ tín dụng VPBank', icon: <CreditCard size={16} />, balance: '-2.500.000đ', color: '#ef4444' },
    { id: 'savings', name: 'Ví tiết kiệm', icon: <PiggyBank size={16} />, balance: '15.000.000đ', color: '#10b981' },
    { id: 'family', name: 'Ví gia đình', icon: <Home size={16} />, balance: '3.200.000đ', color: '#8b5cf6' },
  ];

  // Dữ liệu mẫu - giao dịch theo từng ví
  const transactionsByWallet = {
    all: [
      { id: 1, name: 'Ăn trưa', category: 'Ăn uống', amount: 120000, type: 'expense', date: '2026-03-13', time: '12:30', wallet: 'cash', icon: '🍜' },
      { id: 2, name: 'Lương tháng 3', category: 'Thu nhập', amount: 15000000, type: 'income', date: '2026-03-10', time: '09:00', wallet: 'cash', icon: '💰' },
      { id: 3, name: 'Thanh toán thẻ', category: 'Nợ', amount: 2500000, type: 'expense', date: '2026-03-15', time: '14:20', wallet: 'credit', icon: '💳' },
      { id: 4, name: 'Mua sắm', category: 'Mua sắm', amount: 450000, type: 'expense', date: '2026-03-08', time: '15:45', wallet: 'credit', icon: '🛍️' },
    ],
    cash: [
      { id: 1, name: 'Ăn trưa', category: 'Ăn uống', amount: 120000, type: 'expense', date: '2026-03-13', time: '12:30', wallet: 'cash', icon: '🍜' },
      { id: 2, name: 'Lương tháng 3', category: 'Thu nhập', amount: 15000000, type: 'income', date: '2026-03-10', time: '09:00', wallet: 'cash', icon: '💰' },
    ],
    credit: [
      { id: 3, name: 'Thanh toán thẻ', category: 'Nợ', amount: 2500000, type: 'expense', date: '2026-03-15', time: '14:20', wallet: 'credit', icon: '💳' },
      { id: 4, name: 'Mua sắm', category: 'Mua sắm', amount: 450000, type: 'expense', date: '2026-03-08', time: '15:45', wallet: 'credit', icon: '🛍️' },
    ],
    savings: [],
    family: [],
  };

  const transactions = transactionsByWallet[selectedWallet] || [];
  
  // Tính tổng theo ví được chọn
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  const periods = [
    { id: 'today', label: 'Hôm nay', date: 'Th 6, 13 thg 3' },
    { id: 'yesterday', label: 'Hôm qua', date: 'Th 5, 12 thg 3' },
    { id: 'week', label: 'Tuần này', date: '7 - 13 thg 3' },
    { id: 'month', label: 'Tháng này', date: 'Tháng 3/2026' },
    { id: 'custom', label: 'Tùy chọn', date: 'Chọn ngày' },
  ];

  const currentPeriod = periods.find(p => p.id === selectedPeriod);
  const selectedWalletData = wallets.find(w => w.id === selectedWallet);

  // Format số tiền
  const formatAmount = (amount) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

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
                <span>{formatAmount(totalExpense)}</span>
              </span>
              <span className={styles.statDivider}>|</span>
              <span className={styles.statItem}>
                <TrendingUp size={14} color="#1976d2" />
                <span>{formatAmount(totalIncome)}</span>
              </span>
              <span className={styles.statDivider}>|</span>
              <span className={styles.statItem}>
                <Wallet size={14} color="#64748b" />
                <span>{formatAmount(balance)}</span>
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
                {wallets.map(wallet => (
                  <button
                    key={wallet.id}
                    className={`${styles.walletOption} ${selectedWallet === wallet.id ? styles.active : ''}`}
                    onClick={() => {
                      setSelectedWallet(wallet.id);
                      setShowWalletDropdown(false);
                    }}
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
            <span className={styles.periodDate}>{currentPeriod?.date}</span>
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
                  {['Tất cả', 'Ăn uống', 'Mua sắm', 'Di chuyển', 'Hóa đơn', 'Giải trí'].map(cat => (
                    <button
                      key={cat}
                      className={`${styles.categoryChip} ${selectedCategory === cat ? styles.active : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Khoảng thời gian</label>
                <div className={styles.dateRange}>
                  <input type="date" className={styles.dateInput} />
                  <span>→</span>
                  <input type="date" className={styles.dateInput} />
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label>Số tiền</label>
                <div className={styles.amountRange}>
                  <input type="number" placeholder="Từ" className={styles.amountInput} />
                  <span>→</span>
                  <input type="number" placeholder="Đến" className={styles.amountInput} />
                </div>
              </div>
            </div>
            <div className={styles.filterActions}>
              <button className={styles.clearBtn}>
                <X size={16} />
                Xóa bộ lọc
              </button>
              <button className={styles.applyBtn}>
                <Check size={16} />
                Áp dụng
              </button>
            </div>
          </div>
        )}

        {/* Transactions Content */}
        <div className={styles.transactionsContent}>
          {/* Summary Card */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Chi tiêu hằng ngày</span>
              <span className={styles.summaryValue}>{formatAmount(totalExpense)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Ngày</span>
              <span className={styles.summaryDate}>{currentPeriod?.date}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#fee2e2', color: '#ef4444' }}>
                <ArrowDownRight size={20} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Chi phí</span>
                <span className={styles.statValue}>{formatAmount(totalExpense)}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#e3f2fd', color: '#1976d2' }}>
                <ArrowUpRight size={20} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Thu nhập</span>
                <span className={styles.statValue}>{formatAmount(totalIncome)}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#f1f5f9', color: '#64748b' }}>
                <Wallet size={20} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Số dư</span>
                <span className={styles.statValue}>{formatAmount(balance)}</span>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {transactions.length === 0 ? (
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
          ) : (
            <div className={viewMode === 'list' ? styles.transactionsList : styles.transactionsGrid}>
              {/* Group by date */}
              {Object.entries(
                transactions.reduce((groups, transaction) => {
                  const date = transaction.date;
                  if (!groups[date]) groups[date] = [];
                  groups[date].push(transaction);
                  return groups;
                }, {})
              ).map(([date, dateTransactions]) => (
                <div key={date} className={styles.dateGroup}>
                  <div className={styles.dateHeader}>
                    <span className={styles.date}>
                      {new Date(date).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className={styles.groupTotal}>
                      {formatAmount(dateTransactions.reduce((sum, t) => 
                        t.type === 'expense' ? sum - t.amount : sum + t.amount, 0
                      ))}
                    </span>
                  </div>
                  
                  {dateTransactions.map(transaction => (
                    <div key={transaction.id} className={styles.transactionCard}>
                      <div className={styles.transactionIcon}>
                        {transaction.icon}
                      </div>
                      <div className={styles.transactionInfo}>
                        <div className={styles.transactionMain}>
                          <span className={styles.transactionName}>{transaction.name}</span>
                          <span className={`${styles.transactionAmount} ${styles[transaction.type]}`}>
                            {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
                          </span>
                        </div>
                        <div className={styles.transactionMeta}>
                          <span className={styles.transactionCategory}>{transaction.category}</span>
                          <span className={styles.transactionTime}>{transaction.time}</span>
                          <span className={styles.transactionWallet}>
                            • {wallets.find(w => w.id === transaction.wallet)?.name}
                          </span>
                        </div>
                      </div>
                      <button className={styles.transactionMenu}>
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {transactions.length > 0 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled>
                <ChevronLeft size={18} />
              </button>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}>2</button>
              <button className={styles.pageBtn}>3</button>
              <span className={styles.pageDots}>...</span>
              <button className={styles.pageBtn}>10</button>
              <button className={styles.pageBtn}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Thêm giao dịch mới</h3>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <form className={styles.transactionForm}>
                  {/* Form fields sẽ được thêm sau */}
                  <p className={styles.modalPlaceholder}>
                    Form thêm giao dịch sẽ được hiển thị ở đây
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TransactionsPage;