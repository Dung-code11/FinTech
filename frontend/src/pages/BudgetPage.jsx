import React, { useCallback, useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useTransaction } from "../context/TransactionContext";
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
  X,
} from "lucide-react";

const BudgetPage = ({ embedded = false }) => {
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
  const { transactions } = useTransaction();

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  useEffect(() => {
    if (!wallets.length) {
      setSelectedWallet(null);
      return;
    }

    if (!selectedWallet || !wallets.some((wallet) => wallet.id === selectedWallet.id)) {
      setSelectedWallet(wallets[0]);
    }
  }, [wallets, selectedWallet]);

  const loadBudgets = useCallback(async () => {
    if (!selectedWallet?.id) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await budgetService.getBudgets(selectedWallet.id);

    if (result.success) {
      const formattedBudgets = (result.data || []).map((budget) => {
        const spent = budget.spent || 0;
        const amount = budget.amount || 0;

        return {
          ...budget,
          name: budget.budget_name || budget.name,
          spent,
          amount,
          progress:
            typeof budget.progress === "number"
              ? budget.progress
              : amount > 0
                ? (spent / amount) * 100
                : 0,
          categories: budget.categories || [],
        };
      });

      setBudgets(formattedBudgets);
    } else {
      setError(result.error || "Khong the tai danh sach ngan sach");
    }

    setLoading(false);
  }, [selectedWallet]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  useEffect(() => {
    if (selectedWallet) {
      loadBudgets();
    }
  }, [transactions, selectedWallet, loadBudgets]);

  const handleCreateBudget = async (budgetData) => {
    const walletId = budgetData.walletId || selectedWallet?.id;

    if (!walletId) {
      alert("Vui long chon vi cho ngan sach");
      return;
    }

    const result = await budgetService.createBudget(walletId, budgetData);

    if (result.success) {
      await loadBudgets();
      setShowBudgetModal(false);
    } else {
      alert(result.error || "Khong the tao ngan sach");
    }
  };

  const handleUpdateBudget = async (budgetId, budgetData) => {
    const result = await budgetService.updateBudget(budgetId, budgetData);

    if (result.success) {
      await loadBudgets();
      setShowBudgetModal(false);
      setEditingBudget(null);
    } else {
      alert(result.error || "Khong the cap nhat ngan sach");
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm("Ban co chac chan muon xoa ngan sach nay?")) {
      return;
    }

    const result = await budgetService.deleteBudget(budgetId);
    if (result.success) {
      await loadBudgets();
    } else {
      alert(result.error || "Khong the xoa ngan sach");
    }
  };

  const filteredBudgets = budgets.filter((budget) => {
    const budgetName = budget.name || budget.budget_name || "";
    const matchesSearch = budgetName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || budget.type?.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  const overallProgress = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

  const expenseBudgets = budgets.filter((budget) => budget.type === "EXPENSE").length;
  const incomeBudgets = budgets.filter((budget) => budget.type === "INCOME").length;
  const activeBudgets = budgets.filter((budget) => (budget.progress || 0) < 100).length;
  const completedBudgets = budgets.filter((budget) => (budget.progress || 0) >= 100).length;

  return (
    <div className={styles.budgetPage}>
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              <PieChart size={32} className={styles.titleIcon} />
              Ngan sach
            </h1>
            <p className={styles.pageDescription}>Lap ke hoach va theo doi chi tieu cua ban</p>
          </div>
          <button className={styles.createBtn} onClick={() => setShowBudgetModal(true)}>
            <Plus size={20} />
            <span>Tao ngan sach moi</span>
          </button>
        </div>

        <div className={styles.walletSelector}>
          <Wallet size={18} className={styles.walletIcon} />
          <select
            className={styles.walletSelect}
            value={selectedWallet?.id || ""}
            onChange={(event) =>
              setSelectedWallet(wallets.find((wallet) => wallet.id === event.target.value) || null)
            }
          >
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} - {wallet.type === "CASH" ? "Tien mat" : "The tin dung"}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.overviewStats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#e3f2fd", color: "#1976d2" }}>
              <Wallet size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Tong ngan sach</span>
              <span className={styles.statValue}>{budgetService.formatAmount(totalBudgetAmount)}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#fee2e2", color: "#ef4444" }}>
              <TrendingDown size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Da chi tieu</span>
              <span className={styles.statValue}>{budgetService.formatAmount(totalSpent)}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#d1fae5", color: "#10b981" }}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Tien do</span>
              <span className={styles.statValue}>{overallProgress.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className={styles.overallProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
          <span className={styles.progressText}>Da dat {overallProgress.toFixed(1)}% tong ngan sach</span>
        </div>

        <div className={styles.filtersBar}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Tim kiem ngan sach..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className={styles.typeFilter}>
            <button
              className={`${styles.filterBtn} ${filterType === "all" ? styles.active : ""}`}
              onClick={() => setFilterType("all")}
            >
              Tat ca
            </button>
            <button
              className={`${styles.filterBtn} ${filterType === "expense" ? styles.active : ""}`}
              onClick={() => setFilterType("expense")}
            >
              Chi phi
            </button>
            <button
              className={`${styles.filterBtn} ${filterType === "income" ? styles.active : ""}`}
              onClick={() => setFilterType("income")}
            >
              Thu nhap
            </button>
          </div>
          <button className={styles.statsBtn} onClick={() => setShowStats((previous) => !previous)}>
            <PieChart size={18} />
            <span>Thong ke</span>
          </button>
        </div>

        {showStats && (
          <div className={styles.statsModal}>
            <div className={styles.statsModalContent}>
              <div className={styles.statsModalHeader}>
                <h3>Thong ke ngan sach</h3>
                <button onClick={() => setShowStats(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.statsModalBody}>
                <div className={styles.statRow}>
                  <span>So luong ngan sach:</span>
                  <strong>{budgets.length}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Ngan sach chi phi:</span>
                  <strong>{expenseBudgets}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Ngan sach thu nhap:</span>
                  <strong>{incomeBudgets}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Ngan sach dang hoat dong:</span>
                  <strong>{activeBudgets}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Ngan sach hoan thanh:</span>
                  <strong>{completedBudgets}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.budgetsGrid}>
          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw size={40} className={styles.spinner} />
              <p>Dang tai ngan sach...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <AlertCircle size={40} />
              <p>{error}</p>
              <button onClick={loadBudgets}>Thu lai</button>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>$</div>
              <h3>Chua co ngan sach nao</h3>
              <p>
                {searchQuery || filterType !== "all"
                  ? "Khong tim thay ngan sach phu hop"
                  : "Bat dau tao ngan sach dau tien de quan ly tai chinh"}
              </p>
              {!searchQuery && filterType === "all" && (
                <button onClick={() => setShowBudgetModal(true)}>
                  <Plus size={18} />
                  Tao ngan sach moi
                </button>
              )}
            </div>
          ) : (
            filteredBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={() => {
                  setEditingBudget(budget);
                  setShowBudgetModal(true);
                }}
                onDelete={() => handleDeleteBudget(budget.id)}
              />
            ))
          )}
        </div>

        {!embedded && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

        <BudgetModal
          isOpen={showBudgetModal}
          onClose={() => {
            setShowBudgetModal(false);
            setEditingBudget(null);
          }}
          onSave={editingBudget ? handleUpdateBudget : handleCreateBudget}
          budget={editingBudget}
          wallets={wallets}
          selectedWalletId={selectedWallet?.id || ""}
          isEditing={!!editingBudget}
        />
      </main>
    </div>
  );
};

export default BudgetPage;
