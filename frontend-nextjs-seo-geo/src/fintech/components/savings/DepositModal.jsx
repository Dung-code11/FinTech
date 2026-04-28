import React, { useState } from 'react';
import styles from '../../css/SavingModal.module.css';
import { X, Wallet, FileText, AlertCircle } from 'lucide-react';
import { useSavings } from '../../context/SavingsContext';
import { useWallet } from '../../context/WalletContext';
import { savingsService } from '../../services/savingsService';

const DepositModal = ({ isOpen, onClose, saving, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    walletId: '',
    note: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { depositToSaving } = useSavings();
  const { wallets } = useWallet();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount) {
      newErrors.amount = 'Vui lòng nhập số tiền';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    if (!formData.walletId) {
      newErrors.walletId = 'Vui lòng chọn ví';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    const result = await depositToSaving(saving.id, {
      amount: parseFloat(formData.amount),
      walletId: formData.walletId,
      note: formData.note
    });
    
    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Nạp tiền vào {saving.title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Thông tin mục tiêu */}
          <div className={styles.savingInfo}>
            <div className={styles.infoRow}>
              <span>Mục tiêu:</span>
              <strong>{savingsService.formatAmount(saving.targetAmount, saving.currency)}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Đã tiết kiệm:</span>
              <strong>{savingsService.formatAmount(saving.currentAmount || 0, saving.currency)}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Còn thiếu:</span>
              <strong>{savingsService.formatAmount(saving.targetAmount - (saving.currentAmount || 0), saving.currency)}</strong>
            </div>
          </div>

          {/* Số tiền */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Số tiền nạp <span className={styles.required}>*</span>
            </label>
            <div className={styles.amountInput}>
              <span className={styles.currency}>{saving.currency === 'VND' ? '₫' : '$'}</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                className={`${styles.input} ${styles.withPrefix} ${errors.amount ? styles.error : ''}`}
                step="1000"
                min="0"
                max={saving.targetAmount - (saving.currentAmount || 0)}
              />
            </div>
            {errors.amount && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.amount}
              </span>
            )}
          </div>

          {/* Ví */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ví nguồn <span className={styles.required}>*</span>
            </label>
            <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className={`${styles.select} ${errors.walletId ? styles.error : ''}`}
            >
              <option value="">-- Chọn ví --</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} - {wallet.type === 'CASH' ? 'Tiền mặt' : 'Thẻ tín dụng'}
                </option>
              ))}
            </select>
            {errors.walletId && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.walletId}
              </span>
            )}
          </div>

          {/* Ghi chú */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Ghi chú</label>
            <div className={styles.inputWithIcon}>
              <FileText size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Ghi chú (không bắt buộc)"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;