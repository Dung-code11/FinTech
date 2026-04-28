import React, { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import BudgetModal from "../components/budget/BudgetModal";
import BudgetCard from "../components/budget/BudgetCard";
import { budgetService } from "../services/budgetService";
import styles from "../css/BudgetPage.module.css";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  RefreshCw,
  AlertCircle,
  X
} from "lucide-react";

const BudgetPage = ({ embedded = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("budget");
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showStats, setShowStats] = useState(false);

  const { wallets, loadWallets } = useWallet();

  // Load wallets
  useEffect(() => {
    loadWallets();
  }, []);

  // Select first wallet automatically
  useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0]);
    }
  }, [wallets]);

  // Load budgets when wallet changes
  useEffect(() => {
    if (selectedWallet) {
      loadBudgets();
    }
  }, [selectedWallet]);

  const loadBudgets = async () => {
    setLoading(true);
    setError(null);
    const result = await budgetService.getBudgets(selectedWallet.id);
    console.log("Budgets from API:", result); // Debug log
    
    if (result.success) {
      // Đảm bảo mỗi budget có trường name (từ budget_name)
      const formattedBudgets = (result.data || []).map(budget => ({
        ...budget,
        name: budget.budget_name || budget.name, // Ưu tiên budget_name
        id: budget.id,
        type: budget.type,
        amount: budget.amount,
        spent: budget.spent || 0,
        progress: budget.progress || 0,
        startDate: budget.startDate,
        endDate: budget.endDate,
        period: budget.period,
        categories: budget.categories || []
      }));
      setBudgets(formattedBudgets);
      console.log("Formatted budgets:", formattedBudgets); // Debug log
    } else {
      setError(result.error || "Không thể tải danh sách ngân sách");
    }
    setLoading(false);
  };

  const handleCreateBudget = async (budgetData) => {
    console.log("Creating budget with data:", budgetData); // Debug log
    
    const result = await budgetService.createBudget(
      selectedWallet.id,
      budgetData
    );
    console.log("Create budget result:", result); // Debug log
    
    if (result.success) {
      await loadBudgets();
      setShowBudgetModal(false);
    } else {
      alert(result.error || "Không thể tạo ngân sách");
    }
  };

  const handleUpdateBudget = async (budgetId, budgetData) => {
    const result = await budgetService.updateBudget(budgetId, budgetData);
    if (result.success) {
      await loadBudgets();
      setShowBudgetModal(false);
      setEditingBudget(null);
    } else {
      alert(result.error || "Không thể cập nhật ngân sách");
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ngân sách này?")) {
      const result = await budgetService.deleteBudget(budgetId);
      if (result.success) {
        await loadBudgets();
      } else {
        alert(result.error || "Không thể xóa ngân sách");
      }
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetModal(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter budgets - sử dụng name đã được format
  const filteredBudgets = budgets.filter((budget) => {
    const budgetName = budget.name || budget.budget_name || "";
    const matchesSearch = budgetName.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesType = filterType === "all" || budget.type?.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate totals
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const overallProgress = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

  // Statistics
  const expenseBudgets = budgets.filter((b) => b.type === "EXPENSE").length;
  const incomeBudgets = budgets.filter((b) => b.type === "INCOME").length;
  const activeBudgets = budgets.filter((b) => (b.progress || 0) < 100).length;
  const completedBudgets = budgets.filter((b) => (b.progress || 0) >= 100).length;

  return (
    <div className={styles.budgetPage}>
      

      <main className={styles.mainContent}>
       

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              <PieChart size={32} className={styles.titleIcon} />
              Ngân sách
            </h1>
            <p className={styles.pageDescription}>
              Lập kế hoạch và theo dõi chi tiêu của bạn
            </p>
          </div>
          <button
            className={styles.createBtn}
            onClick={() => setShowBudgetModal(true)}
          >
            <Plus size={20} />
            <span>Tạo ngân sách mới</span>
          </button>
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

        {/* Overview Stats */}
        <div className={styles.overviewStats}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "#e3f2fd", color: "#1976d2" }}
            >
              <Wallet size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Tổng ngân sách</span>
              <span className={styles.statValue}>
                {budgetService.formatAmount(totalBudgetAmount)}
              </span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "#fee2e2", color: "#ef4444" }}
            >
              <TrendingDown size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Đã chi tiêu</span>
              <span className={styles.statValue}>
                {budgetService.formatAmount(totalSpent)}
              </span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "#d1fae5", color: "#10b981" }}
            >
              <TrendingUp size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Tiến độ</span>
              <span className={styles.statValue}>
                {overallProgress.toFixed(1)}%
              </span>
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
            Đã đạt {overallProgress.toFixed(1)}% tổng ngân sách
          </span>
        </div>

        {/* Filters */}
        <div className={styles.filtersBar}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm ngân sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.typeFilter}>
            <button
              className={`${styles.filterBtn} ${filterType === "all" ? styles.active : ""}`}
              onClick={() => setFilterType("all")}
            >
              Tất cả
            </button>
            <button
              className={`${styles.filterBtn} ${filterType === "expense" ? styles.active : ""}`}
              onClick={() => setFilterType("expense")}
            >
              Chi phí
            </button>
            <button
              className={`${styles.filterBtn} ${filterType === "income" ? styles.active : ""}`}
              onClick={() => setFilterType("income")}
            >
              Thu nhập
            </button>
          </div>
          <button
            className={styles.statsBtn}
            onClick={() => setShowStats(!showStats)}
          >
            <PieChart size={18} />
            <span>Thống kê</span>
          </button>
        </div>

        {/* Stats Modal */}
        {showStats && (
          <div className={styles.statsModal}>
            <div className={styles.statsModalContent}>
              <div className={styles.statsModalHeader}>
                <h3>Thống kê ngân sách</h3>
                <button onClick={() => setShowStats(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.statsModalBody}>
                <div className={styles.statRow}>
                  <span>Số lượng ngân sách:</span>
                  <strong>{budgets.length}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Ngân sách chi phí:</span>
                  <strong>{expenseBudgets}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Ngân sách thu nhập:</span>
                  <strong>{incomeBudgets}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Ngân sách đang hoạt động:</span>
                  <strong>{activeBudgets}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Ngân sách hoàn thành:</span>
                  <strong>{completedBudgets}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budgets Grid */}
        <div className={styles.budgetsGrid}>
          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw size={40} className={styles.spinner} />
              <p>Đang tải ngân sách...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <AlertCircle size={40} />
              <p>{error}</p>
              <button onClick={loadBudgets}>Thử lại</button>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💰</div>
              <h3>Chưa có ngân sách nào</h3>
              <p>
                {searchQuery || filterType !== "all"
                  ? "Không tìm thấy ngân sách phù hợp"
                  : "Bắt đầu tạo ngân sách đầu tiên để quản lý tài chính"}
              </p>
              {!searchQuery && filterType === "all" && (
                <button onClick={() => setShowBudgetModal(true)}>
                  <Plus size={18} />
                  Tạo ngân sách mới
                </button>
              )}
            </div>
          ) : (
            filteredBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={() => handleEditBudget(budget)}
                onDelete={() => handleDeleteBudget(budget.id)}
              />
            ))
          )}
        </div>

        {!embedded && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

        {/* Budget Modal */}
        <BudgetModal
          isOpen={showBudgetModal}
          onClose={() => {
            setShowBudgetModal(false);
            setEditingBudget(null);
          }}
          onSave={editingBudget ? handleUpdateBudget : handleCreateBudget}
          budget={editingBudget}
          categories={{
            expense: [],
            income: [],
          }}
          isEditing={!!editingBudget}
        />
      </main>
    </div>
  );
};

export default BudgetPage;
