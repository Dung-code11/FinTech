import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import styles from "../../css/DashboardPage.module.css";
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
  MoreHorizontal,
  Wallet,
  RefreshCw,
} from "lucide-react";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
);

const TransactionList = ({
  transactions = [],
  wallets = [],
  selectedWalletId = "all",
}) => {
  const [activeTab, setActiveTab] = useState("expense");
  const [chartType, setChartType] = useState("pie");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format currency rút gọn
  const formatCompactCurrency = (value) => {
    if (!value && value !== 0) return "0";

    const absValue = Math.abs(value);

    if (absValue >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + "B";
    } else if (absValue >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + "M";
    } else if (absValue >= 1_000) {
      return (value / 1_000).toFixed(1) + "K";
    }

    return value.toLocaleString("vi-VN") + "";
  };

  // Format currency đầy đủ (cho tooltip)
  const formatFullCurrency = (value) => {
    if (!value && value !== 0) return "0";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Debug: Log props nhận được
  useEffect(() => {
    console.log("TransactionList received props:", {
      transactionsCount: transactions.length,
      walletsCount: wallets.length,
      selectedWalletId,
    });
  }, [transactions, wallets, selectedWalletId]);

  // Lấy thông tin ví được chọn
  const selectedWallet = useMemo(() => {
    if (!Array.isArray(wallets)) return null;
    return wallets.find((w) => w.id === selectedWalletId);
  }, [wallets, selectedWalletId]);

  // Lấy giao dịch của ví được chọn
  const walletTransactions = useMemo(() => {
    if (selectedWalletId === "all" || !selectedWalletId) {
      console.log("No wallet selected");
      return [];
    }

    console.log("Filtering transactions for wallet:", selectedWalletId);
    console.log("All transactions:", transactions);

    const filtered = transactions.filter((t) => {
      const match = t.walletId === selectedWalletId;
      if (match) {
        console.log("Matched transaction:", t);
      }
      return match;
    });

    console.log(
      `Found ${filtered.length} transactions for wallet ${selectedWalletId}`,
    );
    return filtered;
  }, [transactions, selectedWalletId]);

  // Tính toán dữ liệu cho biểu đồ của ví được chọn
  const chartData = useMemo(() => {
    if (
      !selectedWallet ||
      selectedWalletId === "all" ||
      walletTransactions.length === 0
    ) {
      console.log("No data for chart:", {
        hasWallet: !!selectedWallet,
        isAll: selectedWalletId === "all",
        transactionCount: walletTransactions.length,
      });
      return {
        pieData: null,
        lineData: null,
        categoryDetails: [],
        totalAmount: 0,
      };
    }

    console.log("Calculating chart data for wallet:", selectedWallet.name);
    console.log("Wallet transactions:", walletTransactions);

    // Lọc giao dịch theo loại (chi/phí)
    const filteredTransactions = walletTransactions.filter(
      (t) =>
        t.type?.toUpperCase() ===
        (activeTab === "expense" ? "EXPENSE" : "INCOME"),
    );

    console.log(`Filtered by type (${activeTab}):`, filteredTransactions);

    // Tính toán cho biểu đồ tròn (theo danh mục)
    const categoryMap = new Map();
    filteredTransactions.forEach((t) => {
      const category = t.categoryName || "Khác";
      const amount = t.amount || 0;
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    });
    // Color mapping
    const colorMap = {
      "Thức ăn và Đồ uống": "#FF6384",
      "Ăn uống": "#FF6384",
      "Mua sắm": "#36A2EB",
      "Di chuyển": "#FFCE56",
      "Hóa đơn": "#4BC0C0",
      "Giải trí": "#9966FF",
      Lương: "#4CAF50",
      Thưởng: "#2196F3",
      "Đầu tư": "#FF9800",
      Freelance: "#9C27B0",
      Khác: "#795548",
    };
    const labels = Array.from(categoryMap.keys());
    const values = Array.from(categoryMap.values());

    const pieData =
      categoryMap.size > 0
        ? {
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: labels.map(
                  (label) => colorMap[label] || "#64748b",
                ),
                borderWidth: 0,
                cutout: "70%",
                borderRadius: 8,
                spacing: 4,
              },
            ],
            total: values.reduce((a, b) => a + b, 0),
          }
        : null;

    // Tính toán cho biểu đồ đường (theo thời gian)
    const dailyMap = new Map();
    filteredTransactions.forEach((t) => {
      const date = t.createdAt
        ? new Date(t.createdAt).toLocaleDateString("vi-VN")
        : "Không xác định";
      const amount = t.amount || 0;
      dailyMap.set(date, (dailyMap.get(date) || 0) + amount);
    });

    let lineData = null;
    if (dailyMap.size > 0) {
      const sortedDays = Array.from(dailyMap.entries()).sort((a, b) => {
        const dateA = a[0].split("/").reverse().join("-");
        const dateB = b[0].split("/").reverse().join("-");
        return new Date(dateA) - new Date(dateB);
      });

      const values = sortedDays.map(([, amount]) => amount);

      lineData = {
        labels: sortedDays.map(([date]) => date),
        datasets: [
          {
            label: activeTab === "expense" ? "Chi tiêu" : "Thu nhập",
            data: values,
            borderColor: activeTab === "expense" ? "#FF6384" : "#4CAF50",
            backgroundColor:
              activeTab === "expense"
                ? "rgba(255, 99, 132, 0.1)"
                : "rgba(76, 175, 80, 0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor:
              activeTab === "expense" ? "#FF6384" : "#4CAF50",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 8,
          },
        ],
        avg:
          values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0,
        max: Math.max(...values, 0),
      };
    }

    // Tính toán chi tiết danh mục
    const detailsMap = new Map();
    filteredTransactions.forEach((t) => {
      const category = t.categoryName || "Khác";
      const amount = t.amount || 0;
      const current = detailsMap.get(category) || { amount: 0, count: 0 };
      detailsMap.set(category, {
        amount: current.amount + amount,
        count: current.count + 1,
      });
    });

    const totalAmount = Array.from(detailsMap.values()).reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    // Icon mapping
    const iconMap = {
      "Thức ăn và Đồ uống": <Coffee size={16} />,
      "Ăn uống": <Coffee size={16} />,
      "Mua sắm": <ShoppingBag size={16} />,
      "Di chuyển": <Car size={16} />,
      "Hóa đơn": <Home size={16} />,
      "Giải trí": <Gamepad2 size={16} />,
      Lương: <Briefcase size={16} />,
      Thưởng: <Gift size={16} />,
      "Đầu tư": <Investment size={16} />,
      Freelance: <Laptop size={16} />,
      Khác: <MoreHorizontal size={16} />,
    };
    const categoryDetails = Array.from(detailsMap.entries())
      .map(([name, data]) => ({
        category: name,
        amount: data.amount,
        displayAmount: formatCompactCurrency(data.amount), // Sử dụng format rút gọn
        fullAmount: formatFullCurrency(data.amount), // Giữ full để dùng trong tooltip
        percentage:
          totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
        color: colorMap[name] || "#64748b",
        icon: iconMap[name] || <MoreHorizontal size={16} />,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      pieData,
      lineData,
      categoryDetails,
      totalAmount,
      totalDisplay: formatCompactCurrency(totalAmount),
      totalFull: formatFullCurrency(totalAmount),
    };
  }, [walletTransactions, activeTab, selectedWallet, selectedWalletId]);

  const {
    pieData,
    lineData,
    categoryDetails,
    totalAmount,
    totalDisplay,
    totalFull,
  } = chartData;

  // Options cho biểu đồ donut - Sử dụng format rút gọn
  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#64748b",
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatFullCurrency(value)} (${percentage}%)`; // Tooltip dùng full format
          },
        },
        backgroundColor: "white",
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
      },
    },
    maintainAspectRatio: false,
    cutout: "70%",
    radius: "80%",
  };

  // Options cho biểu đồ đường - Sử dụng format rút gọn
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#64748b",
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${formatFullCurrency(context.raw)}`; // Tooltip dùng full format
          },
        },
        backgroundColor: "white",
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCompactCurrency(value), // Trục Y dùng format rút gọn
          color: "#94a3b8",
        },
        grid: { color: "#eef2f6", drawBorder: false },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "#94a3b8",
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  // Nếu chưa chọn ví
  if (selectedWalletId === "all") {
    return (
      <div className={styles.transactionContainer}>
        <div className={styles.walletSelectMessage}>
          <Wallet size={48} />
          <h3>Vui lòng chọn một ví</h3>
          <p>Chọn ví từ danh sách để xem biểu đồ và thống kê chi tiết</p>
        </div>
      </div>
    );
  }

  // Nếu không tìm thấy ví
  if (!selectedWallet) {
    return (
      <div className={styles.transactionContainer}>
        <div className={styles.walletSelectMessage}>
          <Wallet size={48} />
          <h3>Không tìm thấy ví</h3>
          <p>Ví bạn chọn không tồn tại hoặc đã bị xóa</p>
        </div>
      </div>
    );
  }

  // Nếu ví không có giao dịch
  if (walletTransactions.length === 0) {
    return (
      <div className={styles.transactionContainer}>
        <div className={styles.noTransactions}>
          <Wallet size={48} />
          <h3>Ví "{selectedWallet?.name}" chưa có giao dịch</h3>
          <p className={styles.noTransactionsSub}>
            Thêm giao dịch để xem biểu đồ và thống kê
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.transactionContainer}>
      {/* Header với thông tin ví */}
      <div className={styles.transactionHeader}>
        <div className={styles.walletInfo}>
          <Wallet size={20} />
          <h3>Biến động - {selectedWallet?.name}</h3>
          <span className={styles.transactionCount}>
            {walletTransactions.length} giao dịch
          </span>
        </div>

        <div className={styles.tabHeaders}>
          <button
            className={`${styles.tabBtn} ${activeTab === "expense" ? styles.active : ""}`}
            onClick={() => setActiveTab("expense")}
          >
            <TrendingDown size={16} />
            Chi phí
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "income" ? styles.active : ""}`}
            onClick={() => setActiveTab("income")}
          >
            <TrendingUp size={16} />
            Thu nhập
          </button>
        </div>

        <div className={styles.chartToggle}>
          <button
            className={`${styles.chartTypeBtn} ${chartType === "pie" ? styles.active : ""}`}
            onClick={() => setChartType("pie")}
          >
            <PieChart size={16} />
          </button>
          <button
            className={`${styles.chartTypeBtn} ${chartType === "line" ? styles.active : ""}`}
            onClick={() => setChartType("line")}
          >
            <LineChart size={16} />
          </button>
        </div>
      </div>

      {/* Biểu đồ của ví được chọn */}
      <div className={styles.chartContainer}>
        {chartType === "pie" ? (
          <div className={styles.pieChartWrapper}>
            {pieData ? (
              <>
                <div className={styles.donutCenter}>
                  <span className={styles.donutTotal}>
                    {formatCompactCurrency(pieData.total)}{" "}
                    {/* Tổng ở giữa donut dùng format rút gọn */}
                  </span>
                  <span className={styles.donutLabel}>
                    {activeTab === "expense" ? "Tổng chi" : "Tổng thu"}
                  </span>
                </div>
                <Pie data={pieData} options={pieOptions} />
              </>
            ) : (
              <div className={styles.noDataMessage}>
                Không có {activeTab === "expense" ? "chi phí" : "thu nhập"} nào
              </div>
            )}
          </div>
        ) : (
          <div className={styles.lineChartWrapper}>
            {lineData ? (
              <Line data={lineData} options={lineOptions} />
            ) : (
              <div className={styles.noDataMessage}>
                Không có dữ liệu xu hướng
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thông tin xu hướng */}
      {chartType === "line" && lineData && (
        <div className={styles.trendInfo}>
          <div className={styles.trendHeader}>
            <Calendar size={14} />
            <span>Xu hướng theo ngày</span>
          </div>
          <div className={styles.trendStats}>
            <div className={styles.trendStat}>
              <span className={styles.trendLabel}>Trung bình/ngày</span>
              <span className={styles.trendValue}>
                {formatCompactCurrency(lineData.avg)} {/* Format rút gọn */}
              </span>
            </div>
            <div className={styles.trendStat}>
              <span className={styles.trendLabel}>Cao nhất</span>
              <span className={styles.trendValue}>
                {formatCompactCurrency(lineData.max)} {/* Format rút gọn */}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách chi tiết theo danh mục */}
      {categoryDetails.length > 0 && (
        <div className={styles.categoryList}>
          <div className={styles.categoryHeader}>
            <span>Danh mục</span>
            <span>Số tiền</span>
          </div>

          {categoryDetails.map((item, index) => (
            <div key={index} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <div
                  className={styles.categoryDot}
                  style={{ backgroundColor: item.color }}
                />
                <span className={styles.categoryIcon}>{item.icon}</span>
                <div className={styles.categoryDetails}>
                  <span className={styles.categoryName}>{item.category}</span>
                  <span className={styles.categoryItems}>
                    {item.count} giao dịch
                  </span>
                </div>
              </div>
              <div className={styles.categoryAmount}>
                <span className={styles.amount}>{item.displayAmount}</span>{" "}
                {/* Format rút gọn */}
                <span className={styles.percentage}>{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tổng cộng */}
      {categoryDetails.length > 0 && (
        <div className={styles.totalSection}>
          <div className={styles.totalLabel}>
            Tổng {activeTab === "expense" ? "chi phí" : "thu nhập"}
          </div>
          <div
            className={`${styles.totalAmount} ${activeTab === "expense" ? styles.expense : styles.income}`}
          >
            {totalDisplay} {/* Format rút gọn */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
