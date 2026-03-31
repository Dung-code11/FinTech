import React from 'react';
import styles from '../../css/BudgetPage.module.css';
import { 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { budgetService } from '../../services/budgetService';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const progress = budget.progress || 0;
  const isExpense = budget.type === 'EXPENSE';
  const isIncome = budget.type === 'INCOME';
  
  // Tính toán các trạng thái dựa trên loại ngân sách
  const getStatus = () => {
    if (isExpense) {
      // Chi phí
      if (progress > 100) {
        return { type: 'superdanger', message: '⚠️ Đã vượt ngân sách!', icon: <AlertCircle size={14} /> };
      }
      else if (progress == 100) {
        return { type: 'danger', message: '⚠️ Đã hết ngân sách!', icon: <AlertCircle size={14} /> };
      } else if (progress >= 90) {
        return { type: 'warning', message: '⚠️ Sắp hết ngân sách!', icon: <AlertCircle size={14} /> };
      } else if (progress >= 75) {
        return { type: 'info', message: '📊 Đã dùng 75% ngân sách', icon: <Target size={14} /> };
      } else if (progress >= 50) {
        return { type: 'normal', message: '📈 Đã dùng 50% ngân sách', icon: <TrendingDownIcon size={14} /> };
      }
      return null;
    } else {
      // Thu nhập
      if (progress >= 100) {
        return { type: 'success', message: '🎉 Hoàn thành mục tiêu!', icon: <CheckCircle size={14} /> };
      } else if (progress >= 90) {
        return { type: 'excellent', message: '🌟 Sắp hoàn thành mục tiêu!', icon: <Zap size={14} /> };
      } else if (progress >= 70) {
        return { type: 'good', message: '💪 Đã đạt 70% mục tiêu!', icon: <TrendingUpIcon size={14} /> };
      } else if (progress >= 50) {
        return { type: 'normal', message: '📈 Đã đạt 50% mục tiêu', icon: <TrendingUpIcon size={14} /> };
      }
      return null;
    }
  };

  const status = getStatus();
  
  // Tính phần trăm còn lại
  const remainingPercent = Math.max(0, 100 - progress);
  
  // Xác định màu sắc cho progress bar
  const getProgressColor = () => {
    if (isExpense) {
      if (progress >= 100) return '#ef4444'; // Đỏ - vượt
      if (progress >= 90) return '#f97316'; // Cam - sắp hết
      if (progress >= 75) return '#eab308'; // Vàng - cảnh báo
      if (progress >= 50) return '#3b82f6'; // Xanh dương - bình thường
      return '#10b981'; // Xanh lá - tốt
    } else {
      if (progress >= 100) return '#10b981'; // Xanh lá - hoàn thành
      if (progress >= 90) return '#22c55e'; // Xanh sáng - sắp hoàn thành
      if (progress >= 70) return '#3b82f6'; // Xanh dương - tốt
      if (progress >= 50) return '#8b5cf6'; // Tím - đang tiến triển
      return '#6b7280'; // Xám - mới bắt đầu
    }
  };

  // Xác định thông điệp cho phần còn lại
  const getRemainingMessage = () => {
    if (isExpense) {
      if (progress >= 100) {
        return `Đã vượt ${(progress - 100).toFixed(1)}% so với ngân sách`;
      }
      return `Còn ${remainingPercent.toFixed(1)}% ngân sách`;
    } else {
      if (progress >= 100) {
        return `Đã vượt ${(progress - 100).toFixed(1)}% so với mục tiêu 🚀`;
      }
      return `Còn ${remainingPercent.toFixed(1)}% để đạt mục tiêu`;
    }
  };

  const periodLabels = {
    DAILY: 'Hàng ngày',
    WEEKLY: 'Hàng tuần',
    MONTHLY: 'Hàng tháng'
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Tính số tiền còn lại
  const remainingAmount = budget.amount - budget.spent;
  const isOverBudgetAmount = remainingAmount < 0;

  return (
    <div className={`${styles.budgetCard} ${status ? styles[`card-${status.type}`] : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <h3>{budget.name}</h3>
          <span className={`${styles.budgetType} ${budget.type === 'EXPENSE' ? styles.expense : styles.income}`}>
            {budget.type === 'EXPENSE' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {budget.type === 'EXPENSE' ? 'Chi phí' : 'Thu nhập'}
          </span>
          {status && (
            <div className={`${styles.statusBadge} ${styles[status.type]}`}>
              {status.icon}
              <span>{status.message}</span>
            </div>
          )}
        </div>
        <div className={styles.cardActions}>
          <button className={styles.editBtn} onClick={onEdit}>
            <Edit2 size={16} />
          </button>
          <button className={styles.deleteBtn} onClick={onDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.amountSection}>
          <div className={styles.amountItem}>
            <span className={styles.amountLabel}>Mục tiêu</span>
            <span className={styles.amountValue}>
              {budgetService.formatAmount(budget.amount)}
            </span>
          </div>
          <div className={styles.amountItem}>
            <span className={styles.amountLabel}>Đã dùng</span>
            <span className={`${styles.amountValue} ${isOverBudgetAmount ? styles.overBudget : ''}`}>
              {budgetService.formatAmount(budget.spent)}
            </span>
          </div>
          <div className={styles.amountItem}>
            <span className={styles.amountLabel}>Còn lại</span>
            <span className={`${styles.amountValue} ${isOverBudgetAmount ? styles.negative : ''}`}>
              {isOverBudgetAmount 
                ? `-${budgetService.formatAmount(Math.abs(remainingAmount))}`
                : budgetService.formatAmount(remainingAmount)
              }
            </span>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Tiến độ</span>
            <span className={`${styles.progressValue} ${isExpense && progress >= 90 ? styles.warning : ''} ${isIncome && progress >= 70 ? styles.good : ''}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${isExpense && progress >= 90 ? styles.warningFill : ''} ${isExpense && progress >= 100 ? styles.dangerFill : ''} ${isIncome && progress >= 70 ? styles.goodFill : ''} ${isIncome && progress >= 100 ? styles.successFill : ''}`}
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: getProgressColor()
              }}
            />
          </div>
          <div className={styles.progressMessage}>
            <span className={styles.remainingMessage}>
              {getRemainingMessage()}
            </span>
            {isExpense && progress >= 75 && progress < 100 && (
              <span className={styles.warningTip}>⚠️ Hãy cân nhắc chi tiêu</span>
            )}
            {isIncome && progress >= 70 && progress < 100 && (
              <span className={styles.encouragement}>🔥 Cố lên! Sắp đạt mục tiêu</span>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoItem}>
            <Calendar size={14} />
            <span>{formatDate(budget.startDate)} → {formatDate(budget.endDate)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.periodLabel}>Chu kỳ:</span>
            <span>{periodLabels[budget.period] || budget.period}</span>
          </div>
        </div>

        {budget.categories && budget.categories.length > 0 && (
          <div className={styles.categoriesSection}>
            <span className={styles.categoriesLabel}>Danh mục:</span>
            <div className={styles.categoryTags}>
              {budget.categories.map(cat => (
                <span key={cat.id} className={styles.categoryTag}>
                  {cat.categoryName || cat.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;