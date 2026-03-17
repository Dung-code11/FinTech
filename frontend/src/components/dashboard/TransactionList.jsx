import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import styles from '../../css/DashboardPage.module.css';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  LineChart,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Gamepad2,
  Briefcase,
  Gift,
  TrendingUp as Investment,
  Laptop,
  MoreHorizontal
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

// Custom tooltip styles
const getTooltipStyles = (context) => {
  const tooltipEl = document.createElement('div');
  tooltipEl.className = styles.customTooltip;
  return tooltipEl;
};

const TransactionList = () => {
  const [activeTab, setActiveTab] = useState('expense');
  const [chartType, setChartType] = useState('pie'); // 'pie' hoặc 'line'

  // Dữ liệu cho biểu đồ donut - Chi phí theo danh mục
  const expensePieData = {
    labels: ['Ăn uống', 'Mua sắm', 'Di chuyển', 'Hóa đơn', 'Giải trí'],
    datasets: [
      {
        data: [3500000, 2100000, 1500000, 2800000, 1200000],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 0,
        cutout: '70%',
        borderRadius: 8,
        spacing: 4,
      },
    ],
  };

  // Dữ liệu cho biểu đồ donut - Thu nhập theo danh mục
  const incomePieData = {
    labels: ['Lương', 'Thưởng', 'Đầu tư', 'Freelance', 'Khác'],
    datasets: [
      {
        data: [15000000, 3500000, 2000000, 1800000, 500000],
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#9C27B0',
          '#795548'
        ],
        borderWidth: 0,
        cutout: '70%',
        borderRadius: 8,
        spacing: 4,
      },
    ],
  };

  // Dữ liệu cho biểu đồ đường - Xu hướng chi tiêu theo ngày
  const expenseLineData = {
    labels: ['01/03', '08/03', '15/03', '22/03', '31/03'],
    datasets: [
      {
        label: 'Chi tiêu',
        data: [450000, 780000, 320000, 920000, 540000],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#FF6384',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#FF6384',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  // Dữ liệu cho biểu đồ đường - Xu hướng thu nhập theo ngày
  const incomeLineData = {
    labels: ['01/03', '08/03', '15/03', '22/03', '31/03'],
    datasets: [
      {
        label: 'Thu nhập',
        data: [5000000, 0, 2000000, 0, 15000000],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#4CAF50',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  // Dữ liệu chi tiết các khoản với icon
  const expenseDetails = [
    { 
      category: 'Ăn uống', 
      amount: '3.500.000₫', 
      percentage: 32, 
      color: '#FF6384',
      icon: <Coffee size={16} />,
      items: 24
    },
    { 
      category: 'Hóa đơn', 
      amount: '2.800.000₫', 
      percentage: 26, 
      color: '#4BC0C0',
      icon: <Home size={16} />,
      items: 8
    },
    { 
      category: 'Mua sắm', 
      amount: '2.100.000₫', 
      percentage: 19, 
      color: '#36A2EB',
      icon: <ShoppingBag size={16} />,
      items: 12
    },
    { 
      category: 'Di chuyển', 
      amount: '1.500.000₫', 
      percentage: 14, 
      color: '#FFCE56',
      icon: <Car size={16} />,
      items: 45
    },
    { 
      category: 'Giải trí', 
      amount: '1.200.000₫', 
      percentage: 9, 
      color: '#9966FF',
      icon: <Gamepad2 size={16} />,
      items: 6
    },
  ];

  const incomeDetails = [
    { 
      category: 'Lương', 
      amount: '15.000.000₫', 
      percentage: 65, 
      color: '#4CAF50',
      icon: <Briefcase size={16} />,
      date: '28/03/2026'
    },
    { 
      category: 'Thưởng', 
      amount: '3.500.000₫', 
      percentage: 15, 
      color: '#2196F3',
      icon: <Gift size={16} />,
      date: '15/03/2026'
    },
    { 
      category: 'Đầu tư', 
      amount: '2.000.000₫', 
      percentage: 9, 
      color: '#FF9800',
      icon: <Investment size={16} />,
      date: '20/03/2026'
    },
    { 
      category: 'Freelance', 
      amount: '1.800.000₫', 
      percentage: 8, 
      color: '#9C27B0',
      icon: <Laptop size={16} />,
      date: '25/03/2026'
    },
    { 
      category: 'Khác', 
      amount: '500.000₫', 
      percentage: 3, 
      color: '#795548',
      icon: <MoreHorizontal size={16} />,
      date: '10/03/2026'
    },
  ];

  const currentDetails = activeTab === 'expense' ? expenseDetails : incomeDetails;
  const totalAmount = currentDetails.reduce((sum, item) => {
    const num = parseInt(item.amount.replace(/[^0-9]/g, ''));
    return sum + num;
  }, 0);

  // Options cho biểu đồ donut
  const pieOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${(value / 1000000).toFixed(1)}M₫ (${percentage}%)`;
          }
        },
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        displayColors: true,
      }
    },
    maintainAspectRatio: false,
    cutout: '70%',
    radius: '90%',
  };

  // Options cho biểu đồ đường với tooltip hiển thị ngày đầy đủ
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // Custom label với ngày tháng đầy đủ
          label: (context) => {
            const value = context.raw;
            const formattedValue = new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
            
            return `${context.dataset.label}: ${formattedValue}`;
          },
          // Custom title với ngày tháng năm
          title: (context) => {
            const dateStr = context[0].label; // '01/03', '08/03', ...
            const [day, month] = dateStr.split('/');
            const year = '2026'; // Mặc định năm 2026
            const fullDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            
            // Format: Thứ Hai, ngày 01 tháng 03 năm 2026
            const options = { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            };
            
            // Chuyển sang tiếng Việt
            const vietnameseDate = fullDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            return vietnameseDate;
          },
          // Footer hiển thị thêm thông tin
          footer: (context) => {
            const dataIndex = context[0].dataIndex;
            const dayData = context[0].dataset.data[dataIndex];
            
            if (dayData === 0) {
              return ['⚠️ Không có giao dịch'];
            }
            
            const transactions = activeTab === 'expense' 
              ? [3, 5, 2, 7, 4][dataIndex] 
              : [1, 0, 1, 0, 1][dataIndex];
            
            return [`📊 ${transactions} giao dịch`];
          }
        },
        backgroundColor: 'white',
        titleColor: '#1e293b',
        titleFont: {
          size: 14,
          weight: 'bold',
          family: 'Segoe UI, sans-serif'
        },
        bodyColor: '#64748b',
        bodyFont: {
          size: 13,
          family: 'Segoe UI, sans-serif'
        },
        footerColor: '#94a3b8',
        footerFont: {
          size: 12,
          style: 'italic'
        },
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 16,
        boxPadding: 8,
        usePointStyle: true,
        boxWidth: 10,
        boxHeight: 10,
        displayColors: true,
        // Custom tooltip styles
        external: (context) => {
          // Custom tooltip positioning
          const { tooltip } = context;
          if (tooltip.opacity === 0) return;
          
          // Thêm class cho tooltip
          tooltip.options.backgroundColor = 'white';
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            if (value >= 1000000) {
              return `${value / 1000000}M`;
            } else if (value >= 1000) {
              return `${value / 1000}K`;
            }
            return value;
          },
          color: '#94a3b8',
        },
        grid: {
          color: '#eef2f6',
          drawBorder: false,
        },
        title: {
          display: true,
          text: 'Số tiền (VNĐ)',
          color: '#94a3b8',
          font: {
            size: 11,
            family: 'Segoe UI, sans-serif'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
            family: 'Segoe UI, sans-serif'
          }
        },
        title: {
          display: true,
          text: 'Ngày trong tháng 03/2026',
          color: '#94a3b8',
          font: {
            size: 11,
            family: 'Segoe UI, sans-serif'
          }
        }
      },
    },
    // Hover effects
    hover: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        hoverRadius: 8,
        hoverBorderWidth: 3,
      }
    }
  };

  // Tính tổng cho donut chart
  const totalSpending = expensePieData.datasets[0].data.reduce((a, b) => a + b, 0);
  const totalIncome = incomePieData.datasets[0].data.reduce((a, b) => a + b, 0);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={styles.transactionContainer}>
      {/* Header với tabs và toggle chart type */}
      <div className={styles.transactionHeader}>
        <div className={styles.tabHeaders}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'expense' ? styles.active : ''}`}
            onClick={() => setActiveTab('expense')}
          >
            <TrendingDown size={16} />
            Chi phí
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'income' ? styles.active : ''}`}
            onClick={() => setActiveTab('income')}
          >
            <TrendingUp size={16} />
            Thu nhập
          </button>
        </div>
        
        <div className={styles.chartToggle}>
          <button 
            className={`${styles.chartTypeBtn} ${chartType === 'pie' ? styles.active : ''}`}
            onClick={() => setChartType('pie')}
          >
            <PieChart size={16} />
          </button>
          <button 
            className={`${styles.chartTypeBtn} ${chartType === 'line' ? styles.active : ''}`}
            onClick={() => setChartType('line')}
          >
            <LineChart size={16} />
          </button>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className={styles.chartContainer}>
        {chartType === 'pie' ? (
          <div className={styles.pieChartWrapper}>
            <div className={styles.donutCenter}>
              <span className={styles.donutTotal}>
                {activeTab === 'expense' 
                  ? `${(totalSpending / 1000000).toFixed(1)}M` 
                  : `${(totalIncome / 1000000).toFixed(1)}M`
                }
              </span>
              <span className={styles.donutLabel}>
                {activeTab === 'expense' ? 'Tổng chi' : 'Tổng thu'}
              </span>
            </div>
            <Pie 
              data={activeTab === 'expense' ? expensePieData : incomePieData} 
              options={pieOptions}
            />
          </div>
        ) : (
          <div className={styles.lineChartWrapper}>
            <Line 
              data={activeTab === 'expense' ? expenseLineData : incomeLineData} 
              options={lineOptions}
            />
          </div>
        )}
      </div>

      {/* Xu hướng chi tiêu - hiển thị khi chọn biểu đồ đường */}
      {chartType === 'line' && (
        <div className={styles.trendInfo}>
          <div className={styles.trendHeader}>
            <Calendar size={14} />
            <span>Xu hướng tháng 3/2026</span>
          </div>
          <div className={styles.trendStats}>
            <div className={styles.trendStat}>
              <span className={styles.trendLabel}>Trung bình/ngày</span>
              <span className={styles.trendValue}>
                {formatCurrency(activeTab === 'expense' ? 602000 : 4400000)}
              </span>
            </div>
            <div className={styles.trendStat}>
              <span className={styles.trendLabel}>Cao nhất</span>
              <span className={styles.trendValue}>
                {formatCurrency(activeTab === 'expense' ? 920000 : 15000000)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách chi tiết theo danh mục */}
      <div className={styles.categoryList}>
        <div className={styles.categoryHeader}>
          <span>Danh mục</span>
          <span>Số tiền</span>
        </div>
        
        {currentDetails.map((item, index) => (
          <div key={index} className={styles.categoryItem}>
            <div className={styles.categoryInfo}>
              <div 
                className={styles.categoryDot} 
                style={{ backgroundColor: item.color }}
              />
              <span className={styles.categoryIcon}>
                {item.icon}
              </span>
              <div className={styles.categoryDetails}>
                <span className={styles.categoryName}>{item.category}</span>
                {activeTab === 'expense' ? (
                  <span className={styles.categoryItems}>{item.items} giao dịch</span>
                ) : (
                  <span className={styles.categoryDate}>{item.date}</span>
                )}
              </div>
            </div>
            <div className={styles.categoryAmount}>
              <span className={styles.amount}>{item.amount}</span>
              <span className={styles.percentage}>{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tổng cộng */}
      <div className={styles.totalSection}>
        <div className={styles.totalLabel}>
          Tổng {activeTab === 'expense' ? 'chi phí' : 'thu nhập'}
        </div>
        <div className={`${styles.totalAmount} ${activeTab === 'expense' ? styles.expense : styles.income}`}>
          {activeTab === 'expense' ? '11.100.000₫' : '22.800.000₫'}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;