import React, { useState, useEffect } from 'react';
import styles from '../../css/DashboardPage.module.css';
import { 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Infinity,
  Filter,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

const NetChangeCard = ({ 
  transactions = [], 
  wallets = [],
  selectedWalletId = 'all',
  onViewDetails 
}) => {
  const [timeRange, setTimeRange] = useState('month'); // 'day', 'week', 'month', 'year', 'all'
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  // Lấy thông tin ví được chọn
  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  // Lọc giao dịch theo ví và thời gian
  const getFilteredTransactions = () => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    let filtered = transactions;
    
    // Lọc theo ví
    if (selectedWalletId !== 'all') {
      filtered = filtered.filter(t => t.walletId === selectedWalletId);
    }
    
    // Lọc theo thời gian
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(timeRange) {
      case 'day':
        filtered = filtered.filter(t => new Date(t.createdAt) >= today);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(t => new Date(t.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(t => new Date(t.createdAt) >= monthAgo);
        break;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = filtered.filter(t => new Date(t.createdAt) >= yearAgo);
        break;
      case 'all':
      default:
        // Không lọc theo thời gian
        break;
    }
    
    return filtered;
  };

  // Tính toán số liệu từ giao dịch thực tế
  const calculateMetrics = () => {
    const filteredTransactions = getFilteredTransactions();
    
    let totalExpense = 0;
    let totalIncome = 0;
    let expenseCount = 0;
    let incomeCount = 0;
    
    filteredTransactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        totalExpense += t.amount || 0;
        expenseCount++;
      } else if (t.type === 'INCOME') {
        totalIncome += t.amount || 0;
        incomeCount++;
      }
    });
    
    const netChange = totalIncome - totalExpense;
    const totalTransactions = filteredTransactions.length;
    
    return {
      expense: totalExpense,
      income: totalIncome,
      net: netChange,
      expenseCount,
      incomeCount,
      totalTransactions,
      expensePercentage: totalExpense + totalIncome > 0 
        ? Math.round((totalExpense / (totalExpense + totalIncome)) * 100) 
        : 0,
      incomePercentage: totalExpense + totalIncome > 0 
        ? Math.round((totalIncome / (totalExpense + totalIncome)) * 100) 
        : 0
    };
  };

  const metrics = calculateMetrics();

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Tính phần trăm thay đổi so với kỳ trước
  const calculateChange = () => {
    // Có thể tính dựa trên dữ liệu thực tế
    if (metrics.net > 0) {
      return `+${Math.round((metrics.net / (metrics.expense || 1)) * 100)}%`;
    } else {
      return `${Math.round((metrics.net / (metrics.income || 1)) * 100)}%`;
    }
  };

  // Format label cho time range
  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case 'day': return 'Hôm nay';
      case 'week': return '7 ngày qua';
      case 'month': return '30 ngày qua';
      case 'year': return '365 ngày qua';
      case 'all': return 'Toàn thời gian';
      default: return 'Tháng này';
    }
  };

  const timeRanges = [
    { id: 'day', label: 'Hôm nay', icon: <Clock size={14} /> },
    { id: 'week', label: 'Tuần này', icon: <Calendar size={14} /> },
    { id: 'month', label: 'Tháng này', icon: <Calendar size={14} /> },
    { id: 'year', label: 'Năm nay', icon: <Calendar size={14} /> },
    { id: 'all', label: 'Toàn thời gian', icon: <Infinity size={14} /> },
  ];

  const currentRange = timeRanges.find(r => r.id === timeRange);

  return (
    <div className={styles.netChangeCard}>
      {/* Header với bộ lọc thời gian */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <h3>
            {selectedWalletId === 'all' 
              ? 'Thay đổi ròng' 
              : `Biến động - ${selectedWallet?.name || 'Ví'}`
            }
          </h3>
          
          {/* Time Range Selector */}
          <div className={styles.timeRangeSelector}>
            <button 
              className={styles.timeRangeBtn}
              onClick={() => setShowTimeOptions(!showTimeOptions)}
            >
              {currentRange?.icon}
              <span>{currentRange?.label}</span>
              <ChevronRight 
                size={14} 
                className={`${styles.chevron} ${showTimeOptions ? styles.rotated : ''}`} 
              />
            </button>
            
            {showTimeOptions && (
              <div className={styles.timeRangeDropdown}>
                {timeRanges.map(range => (
                  <button
                    key={range.id}
                    className={`${styles.timeOption} ${timeRange === range.id ? styles.active : ''}`}
                    onClick={() => {
                      setTimeRange(range.id);
                      setShowTimeOptions(false);
                    }}
                  >
                    {range.icon}
                    <span>{range.label}</span>
                    <span className={styles.rangeValue}>
                      {range.id === 'day' && formatCurrency(metrics.net)}
                      {range.id === 'week' && formatCurrency(metrics.net)}
                      {range.id === 'month' && formatCurrency(metrics.net)}
                      {range.id === 'year' && formatCurrency(metrics.net)}
                      {range.id === 'all' && formatCurrency(metrics.net)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className={styles.viewAllBtn} onClick={onViewDetails}>
          <Filter size={14} />
          Chi tiết
        </button>
      </div>

      {/* Thông tin thời gian */}
      <div className={styles.timeInfo}>
        <Calendar size={14} />
        <span>{getTimeRangeLabel()}</span>
        <span className={styles.transactionCount}>
          {metrics.totalTransactions} giao dịch
        </span>
      </div>

      {/* Giá trị thay đổi ròng */}
      <div className={styles.netChangeValue}>
        {formatCurrency(metrics.net)}
        {metrics.totalTransactions > 0 && (
          <span className={`${styles.changeBadge} ${metrics.net >= 0 ? styles.positive : styles.negative}`}>
            {metrics.net >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {calculateChange()}
          </span>
        )}
      </div>

      {/* Chi tiết thu chi */}
      <div className={styles.netChangeBreakdown}>
        <div className={styles.breakdownItem}>
          <div className={`${styles.breakdownIcon} ${styles.expense}`}>
            <ArrowDownCircle size={18} />
          </div>
          <div className={styles.breakdownDetails}>
            <div className={styles.breakdownLeft}>
              <span className={styles.breakdownLabel}>Chi phí</span>
              <span className={styles.breakdownSub}>
                {metrics.expenseCount} giao dịch
              </span>
            </div>
            <div className={styles.breakdownRight}>
              <span className={`${styles.breakdownValue} ${styles.expense}`}>
                -{formatCurrency(metrics.expense)}
              </span>
              {metrics.totalTransactions > 0 && (
                <span className={styles.breakdownPercent}>
                  {metrics.expensePercentage}%
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.breakdownItem}>
          <div className={`${styles.breakdownIcon} ${styles.income}`}>
            <ArrowUpCircle size={18} />
          </div>
          <div className={styles.breakdownDetails}>
            <div className={styles.breakdownLeft}>
              <span className={styles.breakdownLabel}>Thu nhập</span>
              <span className={styles.breakdownSub}>
                {metrics.incomeCount} giao dịch
              </span>
            </div>
            <div className={styles.breakdownRight}>
              <span className={`${styles.breakdownValue} ${styles.income}`}>
                +{formatCurrency(metrics.income)}
              </span>
              {metrics.totalTransactions > 0 && (
                <span className={styles.breakdownPercent}>
                  {metrics.incomePercentage}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ thu chi mini */}
      {metrics.totalTransactions > 0 && (
        <div className={styles.miniChart}>
          <div className={styles.chartBar}>
            <div 
              className={styles.expenseBar} 
              style={{ 
                width: `${metrics.expensePercentage}%` 
              }}
            />
            <div 
              className={styles.incomeBar} 
              style={{ 
                width: `${metrics.incomePercentage}%` 
              }}
            />
          </div>
          <div className={styles.chartLabels}>
            <span className={styles.expenseLabel}>
              <span className={styles.dot} style={{ background: '#ef4444' }} />
              Chi phí {metrics.expensePercentage}%
            </span>
            <span className={styles.incomeLabel}>
              <span className={styles.dot} style={{ background: '#1976d2' }} />
              Thu nhập {metrics.incomePercentage}%
            </span>
          </div>
        </div>
      )}

      {/* Nút xem chi tiết */}
      <button className={styles.detailedViewBtn} onClick={onViewDetails}>
        Xem phân tích chi tiết
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default NetChangeCard;