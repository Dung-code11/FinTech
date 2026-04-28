import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useDebt } from "../context/DebtContext";
import { useSavings } from "../context/SavingsContext"; // Thêm useSavings
import { budgetService } from "../services/budgetService";
import { debtService } from "../services/debtService";
import { savingsService } from "../services/savingsService";
import styles from "../css/CurrencyToolsPage.module.css";
import {
  Wallet,
  Target,
  PiggyBank,
  CreditCard,
  Trophy,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Plus,
  Search,
  Filter,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Gift,
  Star,
  Zap,
  Shield,
  Compass,
  BookOpen,
  RefreshCw,
} from "lucide-react";

const CurrencyToolsPage = ({ onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("currency");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]); // Đổi tên cho rõ
  const [debts, setDebts] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const navigate = useNavigate();
  const { wallets, loadWallets } = useWallet();
  const { debts: debtsFromContext, loadDebts } = useDebt();
  const { savings: savingsFromContext, loadSavings } = useSavings(); // Lấy từ context
  const [selectedWallet, setSelectedWallet] = useState(null);

  useEffect(() => {
    loadWallets();
    loadDebts();
    loadSavings(); // Load savings khi mount
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0]);
    }
  }, [wallets]);

  useEffect(() => {
    if (selectedWallet) {
      loadBudgets();
    }
  }, [selectedWallet]);

  // Cập nhật dữ liệu từ context
  useEffect(() => {
    if (debtsFromContext) {
      setDebts(debtsFromContext);
    }
  }, [debtsFromContext]);

  useEffect(() => {
    if (savingsFromContext) {
      setSavings(savingsFromContext);
    }
  }, [savingsFromContext]);

  const loadBudgets = async () => {
    setLoading(true);
    const result = await budgetService.getBudgets(selectedWallet.id);
    if (result.success) {
      setBudgets(result.data || []);
    }
    setLoading(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Format số tiền rút gọn
  const formatCompactAmount = (amount) => {
    if (!amount && amount !== 0) return "0₫";
    const absValue = Math.abs(amount);
    if (absValue >= 1_000_000_000) {
      return (amount / 1_000_000_000).toFixed(1) + "B₫";
    } else if (absValue >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1) + "M₫";
    } else if (absValue >= 1_000) {
      return (amount / 1_000).toFixed(1) + "K₫";
    }
    return amount.toLocaleString("vi-VN") + "₫";
  };

  // Tính tổng tiến độ từ các ngân sách
  const calculateBudgetProgress = () => {
    if (budgets.length === 0) return 0;
    const totalAmount = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    return totalAmount > 0 ? (totalSpent / totalAmount) * 100 : 0;
  };

  // Tính tổng số nợ và đã trả
  const calculateDebtStats = () => {
    const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
    const remaining = debts.reduce(
      (sum, d) =>
        sum + (d.remainingAmount ?? Math.max((d.amount || 0) - (d.paidAmount || 0), 0)),
      0,
    );
    const totalPaid = Math.max(totalDebt - remaining, 0);
    const progress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;
    return { totalDebt, totalPaid, remaining, progress };
  };

  // Tính tổng số tiền tiết kiệm
  const calculateSavingsStats = () => {
    const totalGoals = savings.filter(s => s.type === 'GOAL').length;
    const totalRecurring = savings.filter(s => s.type === 'PERIODIC').length;
    const totalTargetAmount = savings
      .filter(s => s.type === 'GOAL')
      .reduce((sum, s) => sum + (s.targetAmount || 0), 0);
    const totalSaved = savings
      .filter(s => s.type === 'GOAL')
      .reduce((sum, s) => sum + (s.currentAmount || 0), 0);
    const progress = totalTargetAmount > 0 ? (totalSaved / totalTargetAmount) * 100 : 0;
    return { totalGoals, totalRecurring, totalTargetAmount, totalSaved, progress };
  };

  const debtStats = calculateDebtStats();
  const savingsStats = calculateSavingsStats();

  // Tools data với dữ liệu thực
  const tools = [
    {
      id: "budget",
      title: "Ngân sách",
      description:
        "Đặt ngân sách hàng ngày, hàng tuần hoặc hàng tháng để theo dõi chi tiêu của bạn",
      icon: <Wallet size={32} />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
      stats: loading
        ? "Đang tải..."
        : `${budgets.length} ngân sách đang hoạt động`,
      progress: calculateBudgetProgress(),
      link: "/budget",
      features: [
        "Theo dõi chi tiêu",
        "Cảnh báo vượt ngân sách",
        "Báo cáo hàng tháng",
      ],
    },
    {
      id: "savings",
      title: "Tiết kiệm",
      description:
        "Đặt mục tiêu tiết kiệm và theo dõi tiến trình tiết kiệm của bạn!",
      icon: <PiggyBank size={32} />,
      color: "#10b981",
      bgColor: "#d1fae5",
      stats: savings.length > 0 
        ? `${savingsStats.totalGoals} mục tiêu - Đã đạt ${savingsStats.progress.toFixed(0)}%`
        : "Chưa có mục tiêu",
      progress: savingsStats.progress,
      link: "/savings",
      features: [
        "Mục tiêu thông minh",
        "Tiết kiệm định kỳ",
        "Theo dõi tiến độ",
      ],
    },
    {
      id: "debt",
      title: "Quản lý nợ",
      description: "Theo dõi các khoản nợ của bạn và nỗ lực trả hết chúng!",
      icon: <CreditCard size={32} />,
      color: "#ef4444",
      bgColor: "#fee2e2",
      stats: debts.length > 0 
        ? `${debts.length} khoản nợ - Đã trả ${debtStats.progress.toFixed(0)}%`
        : "Chưa có khoản nợ",
      progress: debtStats.progress,
      link: "/debt",
      features: ["Quản lý nợ", "Lịch trả nợ", "Nhắc nhở thanh toán"],
    },
    {
      id: "challenge",
      title: "Thử thách",
      description:
        "Cạnh tranh với bạn bè để tiết kiệm nhiều hơn, theo dõi tiến trình và leo lên bảng xếp hạng.",
      icon: <Trophy size={32} />,
      color: "#f59e0b",
      bgColor: "#fef3c7",
      stats: "Sắp ra mắt",
      progress: 0,
      link: "/challenges",
      features: ["Thử thách nhóm", "Bảng xếp hạng", "Phần thưởng hấp dẫn"],
    },
  ];

  const categories = [
    { id: "all", label: "Tất cả", icon: "📋", count: tools.length },
    {
      id: "budget",
      label: "Ngân sách",
      icon: "💰",
      count: budgets.length || 1,
    },
    { id: "savings", label: "Tiết kiệm", icon: "🏦", count: savings.length || 1 },
    { id: "debt", label: "Nợ", icon: "💳", count: debts.length || 1 },
    { id: "challenge", label: "Thử thách", icon: "🏆", count: 1 },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === "all" || tool.id === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      tool.title.toLowerCase().includes(normalizedQuery) ||
      tool.description.toLowerCase().includes(normalizedQuery) ||
      tool.features.some((feature) =>
        feature.toLowerCase().includes(normalizedQuery),
      )
    );
  });

  const featuredTools = [
    {
      title: "Phân tích chi tiêu",
      description: "Xem báo cáo chi tiết về thói quen chi tiêu của bạn",
      icon: <BarChart3 size={24} />,
      color: "#8b5cf6",
      users: "1.2k+",
      link: "/analytics",
    },
    {
      title: "Đầu tư thông minh",
      description: "Gợi ý đầu tư dựa trên mục tiêu tài chính",
      icon: <TrendingUp size={24} />,
      color: "#ec4899",
      users: "856+",
      link: "/invest",
    },
    {
      title: "Quỹ khẩn cấp",
      description: "Xây dựng quỹ dự phòng cho những tình huống bất ngờ",
      icon: <Shield size={24} />,
      color: "#14b8a6",
      users: "2.3k+",
      link: "/emergency-fund",
    },
  ];

  const handleToolClick = (tool) => {
    if (tool.id === "budget") {
      onTabChange("budget");
    } else if (tool.id === "savings") {
      onTabChange("savings");
    } else if (tool.id === "debt") {
      onTabChange("debt");
    } else {
      alert(
        `Tính năng "${tool.title}" đang được phát triển. Vui lòng quay lại sau!`,
      );
    }
  };

  return (
    <div className={styles.currencyToolsPage}>
      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              <Compass size={32} className={styles.titleIcon} />
              Công cụ tiền tệ
            </h1>
            <p className={styles.pageDescription}>
              Chọn một công cụ để quản lý tài chính của bạn
            </p>
          </div>
        </div>

        {/* Wallet Selector */}
        <div className={styles.walletSelector}>
          <Wallet size={18} className={styles.walletIcon} />
          <select
            className={styles.walletSelect}
            value={selectedWallet?.id || ""}
            onChange={(e) =>
              setSelectedWallet(wallets.find((w) => w.id === e.target.value))
            }
          >
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} -{" "}
                {wallet.type === "CASH" ? "Tiền mặt" : "Thẻ tín dụng"}
              </option>
            ))}
          </select>
        </div>

        {/* Search and Filter Bar */}
        <div className={styles.searchFilterBar}>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm công cụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.categoryFilter}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.categoryChip} ${selectedCategory === cat.id ? styles.active : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                {cat.label}
                <span className={styles.categoryCount}>{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Tools Section */}
        <section className={styles.featuredSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Sparkles size={20} className={styles.sectionIcon} />
              Tính năng nổi bật
            </h2>
            <button className={styles.viewAllBtn}>
              Xem tất cả
              <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.featuredGrid}>
            {featuredTools.map((tool, index) => (
              <div
                key={index}
                className={styles.featuredCard}
                onClick={() =>
                  alert(`Tính năng "${tool.title}" đang được phát triển`)
                }
                style={{ cursor: "pointer" }}
              >
                <div
                  className={styles.featuredIcon}
                  style={{
                    backgroundColor: `${tool.color}20`,
                    color: tool.color,
                  }}
                >
                  {tool.icon}
                </div>
                <div className={styles.featuredInfo}>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                  <div className={styles.featuredMeta}>
                    <Users size={14} />
                    <span>{tool.users} người dùng</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Tools Grid */}
        <section className={styles.toolsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <BookOpen size={20} className={styles.sectionIcon} />
              Tất cả công cụ
            </h2>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw size={40} className={styles.spinner} />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className={styles.toolsGrid}>
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className={styles.toolCard}
                  onClick={() => handleToolClick(tool)}
                  style={{
                    cursor: tool.id === "budget" || tool.id === "savings" || tool.id === "debt" ? "pointer" : "not-allowed",
                  }}
                >
                  <div className={styles.toolHeader}>
                    <div
                      className={styles.toolIcon}
                      style={{
                        backgroundColor: tool.bgColor,
                        color: tool.color,
                      }}
                    >
                      {tool.icon}
                    </div>
                    <button
                      className={styles.toolMenu}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tool.id === "budget") {
                          onTabChange("budget");
                        } else if (tool.id === "savings") {
                          onTabChange("savings");
                        } else if (tool.id === "debt") {
                          onTabChange("debt");
                        } else {
                          alert(
                            `Tính năng "${tool.title}" đang được phát triển`,
                          );
                        }
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className={styles.toolContent}>
                    <h3 className={styles.toolTitle}>{tool.title}</h3>
                    <p className={styles.toolDescription}>{tool.description}</p>

                    {/* Progress Bar - Chỉ hiển thị cho ngân sách, tiết kiệm và nợ */}
                    {(tool.id === "budget" || tool.id === "savings" || tool.id === "debt") && (
                      <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                          <span className={styles.progressLabel}>
                            {tool.id === "budget" ? "Tiến độ chi tiêu" : 
                             tool.id === "savings" ? "Tiến độ tiết kiệm" : 
                             "Tiến độ trả nợ"}
                          </span>
                          <span className={styles.progressValue}>
                            {tool.progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${Math.min(tool.progress, 100)}%`,
                              backgroundColor: tool.color,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className={styles.toolStats}>
                      <div className={styles.toolStat}>
                        <Clock size={14} />
                        <span>{tool.stats}</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className={styles.featuresList}>
                      {tool.features.map((feature, idx) => (
                        <div key={idx} className={styles.featureItem}>
                          <CheckCircle size={14} color={tool.color} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.toolFooter}>
                    <button
                      className={styles.primaryBtn}
                      style={{ backgroundColor: tool.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tool.id === "budget") {
                          onTabChange("budget");
                        } else if (tool.id === "savings") {
                          onTabChange("savings");
                        } else if (tool.id === "debt") {
                          onTabChange("debt");
                        } else {
                          alert(
                            `Tính năng "${tool.title}" đang được phát triển`,
                          );
                        }
                      }}
                    >
                      <span>
                        {tool.id === "budget" || tool.id === "savings" || tool.id === "debt" ? "Bắt đầu" : "Sắp ra mắt"}
                      </span>
                      {(tool.id === "budget" || tool.id === "savings" || tool.id === "debt") && <ChevronRight size={16} />}
                    </button>
                    <button
                      className={styles.secondaryBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tool.id === "budget") {
                          onTabChange("budget");
                        } else if (tool.id === "savings") {
                          onTabChange("savings");
                        } else if (tool.id === "debt") {
                          onTabChange("debt");
                        } else {
                          alert(
                            `Tính năng "${tool.title}" đang được phát triển`,
                          );
                        }
                      }}
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsCard}>
            <div className={styles.statsHeader}>
              <Award size={20} className={styles.statsIcon} />
              <h3>Thành tích của bạn</h3>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statBoxValue}>{budgets.length}</span>
                <span className={styles.statBoxLabel}>Ngân sách</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxValue}>{savings.length}</span>
                <span className={styles.statBoxLabel}>Tiết kiệm</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxValue}>{debts.length}</span>
                <span className={styles.statBoxLabel}>Khoản nợ</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxValue}>0</span>
                <span className={styles.statBoxLabel}>Thử thách</span>
              </div>
            </div>
          </div>

          <div className={styles.tipsCard}>
            <div className={styles.tipsHeader}>
              <Zap size={20} className={styles.tipsIcon} />
              <h3>Mẹo tài chính</h3>
            </div>
            <div className={styles.tipsList}>
              <div className={styles.tipItem}>
                <Gift size={16} />
                <p>
                  Đặt mục tiêu tiết kiệm cụ thể sẽ giúp bạn đạt kết quả tốt hơn
                  30%
                </p>
              </div>
              <div className={styles.tipItem}>
                <Star size={16} />
                <p>
                  Theo dõi chi tiêu hàng ngày giúp phát hiện các khoản không cần
                  thiết
                </p>
              </div>
              <div className={styles.tipItem}>
                <Zap size={16} />
                <p>Tham gia thử thách cùng bạn bè để tăng động lực tiết kiệm</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CurrencyToolsPage;
