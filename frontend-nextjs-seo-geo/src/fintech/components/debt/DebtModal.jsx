import React, { useState } from 'react';
import styles from '../../css/DebtModal.module.css';
import { X, Calendar, Users, FileText, AlertCircle } from 'lucide-react';
import { debtService } from '../../services/debtService';

const DebtModal = ({ isOpen, onClose, onSave, wallets }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    lender: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    walletId: wallets[0]?.id || '',
    note: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên khoản nợ';
    }

    if (!formData.amount) {
      newErrors.amount = 'Vui lòng nhập số tiền';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    if (!formData.walletId) {
      newErrors.walletId = 'Vui lòng chọn ví thanh toán';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Vui lòng chọn hạn trả';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    const submitData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      lender: formData.lender,
      dueDate: formData.dueDate,
      walletId: formData.walletId,
      note: formData.note
    };

    console.log('Submitting debt data:', submitData);
    
    const result = await debtService.createDebt(submitData);
    
    if (result.success) {
      if (onSave) {
        onSave(result.data);
      }
      onClose();
    } else {
      alert(result.error || 'Không thể tạo khoản nợ');
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Thêm khoản nợ mới</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Tên khoản nợ */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên khoản nợ <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Vay mua xe, Nợ thẻ tín dụng..."
              className={`${styles.input} ${errors.name ? styles.error : ''}`}
            />
            {errors.name && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.name}
              </span>
            )}
          </div>

          {/* Số tiền */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Số tiền <span className={styles.required}>*</span>
            </label>
            <div className={styles.amountInput}>
              <span className={styles.currency}>₫</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                className={`${styles.input} ${styles.withPrefix} ${errors.amount ? styles.error : ''}`}
                step="1000"
                min="0"
              />
            </div>
            {errors.amount && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.amount}
              </span>
            )}
          </div>

          {/* Ví thanh toán */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ví thanh toán <span className={styles.required}>*</span>
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

          {/* Chủ nợ */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Chủ nợ</label>
            <div className={styles.inputWithIcon}>
              <Users size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="lender"
                value={formData.lender}
                onChange={handleChange}
                placeholder="Tên người cho vay (không bắt buộc)"
                className={styles.input}
              />
            </div>
          </div>

          {/* Hạn trả */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Hạn trả <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWithIcon}>
              <Calendar size={18} className={styles.inputIcon} />
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`${styles.input} ${errors.dueDate ? styles.error : ''}`}
              />
            </div>
            {errors.dueDate && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.dueDate}
              </span>
            )}
          </div>

          {/* Ghi chú */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Ghi chú</label>
            <div className={styles.inputWithIcon}>
              <FileText size={18} className={styles.inputIcon} />
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Ghi chú thêm (không bắt buộc)"
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Thêm khoản nợ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtModal;