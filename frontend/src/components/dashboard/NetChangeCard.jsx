import React, { useState } from 'react';
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

const NetChangeCard = () => {
  const [timeRange, setTimeRange] = useState('month'); // 'day', 'week', 'month', 'year', 'all'
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  // Dữ liệu thay đổi theo thời gian
  const timeRanges = [
    { id: 'day', label: 'Hôm nay', icon: <Clock size={14} />, value: '4.990.000₫' },
    { id: 'week', label: 'Tuần này', icon: <Calendar size={14} />, value: '12.450.000₫' },
    { id: 'month', label: 'Tháng này', icon: <Calendar size={14} />, value: '45.678.000₫' },
    { id: 'year', label: 'Năm nay', icon: <Calendar size={14} />, value: '356.890.000₫' },
    { id: 'all', label: 'Toàn thời gian', icon: <Infinity size={14} />, value: '1.234.567.000₫' },
  ];

  // Dữ liệu chi tiết theo thời gian
  const detailsByTime = {
    day: {
      expense: 120000,
      income: 5130000,
      net: 5010000,
      transactions: 8
    },
    week: {
      expense: 2450000,
      income: 14900000,
      net: 12450000,
      transactions: 42
    },
    month: {
      expense: 11100000,
      income: 22800000,
      net: 11700000,
      transactions: 156
    },
    year: {
      expense: 145000000,
      income: 256000000,
      net: 111000000,
      transactions: 1245
    },
    all: {
      expense: 567000000,
      income: 891000000,
      net: 324000000,
      transactions: 3567
    }
  };

  const currentData = detailsByTime[timeRange];
  const currentRange = timeRanges.find(r => r.id === timeRange);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Tính phần trăm thay đổi
  const calculateChange = () => {
    if (timeRange === 'day') return '+5.2%';
    if (timeRange === 'week') return '+12.3%';
    if (timeRange === 'month') return '+8.7%';
    if (timeRange === 'year') return '+15.4%';
    return '+23.1%';
  };

  return (
    <div className={styles.netChangeCard}>
      {/* Header với bộ lọc thời gian */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <h3>Thay đổi ròng</h3>
          
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
                    <span className={styles.rangeValue}>{range.value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className={styles.viewAllBtn}>
          <Filter size={14} />
          Lọc
        </button>
      </div>

      {/* Giá trị thay đổi ròng */}
      <div className={styles.netChangeValue}>
        {formatCurrency(currentData.net)}
        <span className={styles.changeBadge}>
          {calculateChange()}
        </span>
      </div>
      
      {/* Thống kê nhanh
      <div className={styles.quickStats}>
        <div className={styles.quickStat}>
          <span className={styles.statLabel}>Tổng giao dịch</span>
          <span className={styles.statNumber}>{currentData.transactions}</span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.statLabel}>Trung bình/ngày</span>
          <span className={styles.statNumber}>
            {formatCurrency(Math.round(currentData.net / 30))}
          </span>
        </div>
      </div> */}

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
                {currentData.transactions} giao dịch
              </span>
            </div>
            <div className={styles.breakdownRight}>
              <span className={`${styles.breakdownValue} ${styles.expense}`}>
                -{formatCurrency(currentData.expense)}
              </span>
              <span className={styles.breakdownPercent}>
                {Math.round((currentData.expense / (currentData.expense + currentData.income)) * 100)}%
              </span>
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
                {Math.round(currentData.transactions * 0.3)} giao dịch
              </span>
            </div>
            <div className={styles.breakdownRight}>
              <span className={`${styles.breakdownValue} ${styles.income}`}>
                +{formatCurrency(currentData.income)}
              </span>
              <span className={styles.breakdownPercent}>
                {Math.round((currentData.income / (currentData.expense + currentData.income)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ thu chi mini
      <div className={styles.miniChart}>
        <div className={styles.chartBar}>
          <div 
            className={styles.expenseBar} 
            style={{ 
              width: `${(currentData.expense / (currentData.expense + currentData.income)) * 100}%` 
            }}
          />
          <div 
            className={styles.incomeBar} 
            style={{ 
              width: `${(currentData.income / (currentData.expense + currentData.income)) * 100}%` 
            }}
          />
        </div>
        <div className={styles.chartLabels}>
          <span className={styles.expenseLabel}>
            <span className={styles.dot} style={{ background: '#ef4444' }} />
            Chi phí
          </span>
          <span className={styles.incomeLabel}>
            <span className={styles.dot} style={{ background: '#1976d2' }} />
            Thu nhập
          </span>
        </div>
      </div> */}

      {/* Nút xem chi tiết */}
      <button className={styles.detailedViewBtn}>
        Xem phân tích chi tiết
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default NetChangeCard;