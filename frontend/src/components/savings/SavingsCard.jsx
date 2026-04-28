import React, { useState } from 'react';
import styles from '../../css/SavingsPage.module.css';
import { 
  Target, 
  Repeat, 
  Calendar, 
  TrendingUp,
  Clock,
  Award,
  Plus,
  Minus,
  Tag
} from 'lucide-react';
import { savingsService } from '../../services/savingsService';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

const SavingsCard = ({ saving, onUpdate }) => {
  const isGoal = saving.type === 'GOAL';
  const progress = saving.progress || 0;
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const cycleLabels = {
    WEEKLY: 'Hàng tuần',
    MONTHLY: 'Hàng tháng',
    YEARLY: 'Hàng năm'
  };

  const getProgressColor = () => {
    if (progress >= 100) return '#10b981';
    if (progress >= 75) return '#22c55e';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const remainingDays = () => {
    if (!saving.targetDate) return null;
    const today = new Date();
    const target = new Date(saving.targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Đã quá hạn';
    if (diffDays === 0) return 'Hôm nay';
    return `Còn ${diffDays} ngày`;
  };

  return (
    <>
      <div className={`${styles.savingsCard} ${isGoal ? styles.goalCard : styles.recurringCard}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            {isGoal ? <Target size={24} /> : <Repeat size={24} />}
          </div>
          <div className={styles.cardTitle}>
            <h3>{saving.title}</h3>
            <span className={styles.badge}>
              {isGoal ? 'Mục tiêu' : 'Định kỳ'}
            </span>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.amountSection}>
            <div className={styles.amountItem}>
              <span className={styles.amountLabel}>
                {isGoal ? 'Mục tiêu' : 'Số tiền/kỳ'}
              </span>
              <span className={styles.amountValue}>
                {savingsService.formatAmount(isGoal ? saving.targetAmount : saving.targetAmount, saving.currency)}
              </span>
            </div>
            
            <div className={styles.amountItem}>
              <span className={styles.amountLabel}>Đã tiết kiệm</span>
              <span className={styles.amountValue}>
                {savingsService.formatAmount(saving.currentAmount || 0, saving.currency)}
              </span>
            </div>
            
            <div className={styles.amountItem}>
              <span className={styles.amountLabel}>Còn lại</span>
              <span className={styles.amountValue}>
                {savingsService.formatAmount((saving.targetAmount - (saving.currentAmount || 0)), saving.currency)}
              </span>
            </div>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Tiến độ</span>
              <span className={styles.progressValue}>{progress.toFixed(1)}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: getProgressColor() }}
              />
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <Tag size={14} />
              <span>{saving.category || 'Khác'}</span>
            </div>
            
            {isGoal && saving.targetDate && (
              <div className={styles.infoItem}>
                <Calendar size={14} />
                <span>{formatDate(saving.targetDate)}</span>
              </div>
            )}
            
            {!isGoal && saving.period && (
              <div className={styles.infoItem}>
                <Clock size={14} />
                <span>{cycleLabels[saving.period] || saving.period}</span>
              </div>
            )}
          </div>

          {isGoal && saving.targetDate && (
            <div className={styles.deadlineInfo}>
              <Award size={14} />
              <span className={remainingDays().includes('Còn') ? styles.positive : styles.negative}>
                {remainingDays()}
              </span>
            </div>
          )}

          <div className={styles.actionButtons}>
            <button 
              className={styles.depositBtn}
              onClick={() => setShowDepositModal(true)}
            >
              <Plus size={16} />
              Nạp tiền
            </button>
            {saving.currentAmount > 0 && (
              <button 
                className={styles.withdrawBtn}
                onClick={() => setShowWithdrawModal(true)}
              >
                <Minus size={16} />
                Rút tiền
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        saving={saving}
        onSuccess={onUpdate}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        saving={saving}
        onSuccess={onUpdate}
      />
    </>
  );
};

export default SavingsCard;