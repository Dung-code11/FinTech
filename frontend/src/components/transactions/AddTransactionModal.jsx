import React, { useState, useEffect } from 'react';
import { useTransaction } from '../../context/TransactionContext';
import styles from '../../css/AddTransactionModal.module.css';
import { 
  X, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Calendar,
  FileText,
  Check
} from 'lucide-react';

const AddTransactionModal = ({ isOpen, onClose, wallets, categories, transaction = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'EXPENSE',
    walletId: transaction?.walletId || '',
    amount: transaction?.amount || '',
    description: transaction?.description || '',
    categoryId: transaction?.categoryId || '', // Đổi từ categoryName thành categoryId
    createdAt: transaction?.createdAt ? new Date(transaction.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const { createTransaction, updateTransaction, loading } = useTransaction();

  // Debug: Log categories khi component mount
  useEffect(() => {
    console.log('Categories in modal:', categories);
    console.log('Expense categories:', categories.expense);
    console.log('Income categories:', categories.income);
  }, [categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.walletId) {
      newErrors.walletId = 'Vui lòng chọn ví';
    }

    if (!formData.amount) {
      newErrors.amount = 'Vui lòng nhập số tiền';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    // Không bắt buộc chọn category
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Chuẩn bị dữ liệu để gửi lên API
    const transactionData = {
      type: formData.type,
      walletId: formData.walletId,
      amount: parseFloat(formData.amount),
      description: formData.description || '',
      categoryId: formData.categoryId || null, // Gửi ID, nếu không có thì gửi null
      createdAt: formData.createdAt
    };

    console.log('Submitting transaction data:', transactionData);

    let result;
    if (isEditing) {
      result = await updateTransaction(transaction.id, transactionData);
    } else {
      result = await createTransaction(transactionData);
    }

    if (result.success) {
      onClose();
      // Reset form
      setFormData({
        type: 'EXPENSE',
        walletId: '',
        amount: '',
        description: '',
        categoryId: '',
        createdAt: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    } else {
      setErrors(prev => ({
        ...prev,
        submit: result.error || 'Không thể lưu giao dịch'
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isEditing ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.submit && (
            <div className={styles.errorMessage}>{errors.submit}</div>
          )}

          {/* Transaction Type */}
          <div className={styles.typeSelector}>
            <button
              type="button"
              className={`${styles.typeBtn} ${formData.type === 'EXPENSE' ? styles.active : ''}`}
              onClick={() => {
                setFormData(prev => ({ ...prev, type: 'EXPENSE', categoryId: '' }));
              }}
            >
              <ArrowDownRight size={20} />
              <span>Chi phí</span>
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${formData.type === 'INCOME' ? styles.active : ''}`}
              onClick={() => {
                setFormData(prev => ({ ...prev, type: 'INCOME', categoryId: '' }));
              }}
            >
              <ArrowUpRight size={20} />
              <span>Thu nhập</span>
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${formData.type === 'TRANSFER' ? styles.active : ''}`}
              onClick={() => {
                setFormData(prev => ({ ...prev, type: 'TRANSFER', categoryId: '' }));
              }}
            >
              <Repeat size={20} />
              <span>Chuyển tiền</span>
            </button>
          </div>

          {/* Wallet Selection */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Chọn ví</label>
            <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className={`${styles.select} ${errors.walletId ? styles.error : ''}`}
            >
              <option value="">-- Chọn ví --</option>
              {Array.isArray(wallets) && wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} - {wallet.type === 'CASH' ? 'Tiền mặt' : 'Thẻ tín dụng'}
                </option>
              ))}
            </select>
            {errors.walletId && (
              <span className={styles.errorMessage}>{errors.walletId}</span>
            )}
          </div>

          {/* Amount */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Số tiền</label>
            <div className={styles.amountInput}>
              <span className={styles.currency}>₫</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Nhập số tiền"
                className={`${styles.input} ${errors.amount ? styles.error : ''}`}
                min="0"
                step="1000"
              />
            </div>
            {errors.amount && (
              <span className={styles.errorMessage}>{errors.amount}</span>
            )}
          </div>

          {/* Category - Chỉ hiển thị khi không phải TRANSFER */}
          {formData.type !== 'TRANSFER' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Danh mục</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">-- Không chọn danh mục --</option>
                {formData.type === 'EXPENSE' && Array.isArray(categories.expense) && categories.expense.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                {formData.type === 'INCOME' && Array.isArray(categories.income) && categories.income.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Ngày giao dịch</label>
            <div className={styles.dateInput}>
              <Calendar size={18} className={styles.inputIcon} />
              <input
                type="date"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Mô tả</label>
            <div className={styles.descriptionInput}>
              <FileText size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả (không bắt buộc)"
                className={styles.input}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm giao dịch')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
