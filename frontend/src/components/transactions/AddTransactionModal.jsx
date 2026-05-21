import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Calendar, FileText, Repeat, X } from 'lucide-react';
import { useTransaction } from '../../context/TransactionContext';
import styles from '../../css/AddTransactionModal.module.css';
import { getTodayDateKey, toDateInputValue } from '../../utils/date';

const getInitialFormData = (transaction = null) => ({
  type: transaction?.type || 'EXPENSE',
  walletId: transaction?.walletId || '',
  amount: transaction?.amount || '',
  description: transaction?.description || '',
  categoryId: transaction?.categoryId || '',
  createdAt: toDateInputValue(transaction?.createdAt, getTodayDateKey())
});

const AddTransactionModal = ({
  isOpen,
  onClose,
  onSuccess,
  wallets,
  categories,
  transaction = null,
  isEditing = false
}) => {
  const [formData, setFormData] = useState(() => getInitialFormData(transaction));
  const [errors, setErrors] = useState({});
  const { createTransaction, updateTransaction, loading } = useTransaction();

  useEffect(() => {
    setFormData(getInitialFormData(transaction));
    setErrors({});
  }, [transaction, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.walletId) {
      nextErrors.walletId = 'Vui long chon vi';
    }

    if (!formData.amount) {
      nextErrors.amount = 'Vui long nhap so tien';
    } else if (parseFloat(formData.amount) <= 0) {
      nextErrors.amount = 'So tien phai lon hon 0';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const transactionData = {
      type: formData.type,
      walletId: formData.walletId,
      amount: parseFloat(formData.amount),
      description: formData.description || '',
      categoryId: formData.categoryId || null,
      createdAt: formData.createdAt
    };

    console.log('Submitting transaction data:', transactionData);

    const result = isEditing
      ? await updateTransaction(transaction.id, transactionData)
      : await createTransaction(transactionData);

    if (result.success) {
      onSuccess?.(result.data);
      setFormData(getInitialFormData());
      setErrors({});
      onClose();
      return;
    }

    setErrors((previous) => ({
      ...previous,
      submit: result.error || 'Khong the luu giao dich'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isEditing ? 'Sua giao dich' : 'Them giao dich moi'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}

          <div className={styles.typeSelector}>
            <button
              type="button"
              className={`${styles.typeBtn} ${formData.type === 'EXPENSE' ? styles.active : ''}`}
              onClick={() => setFormData((previous) => ({ ...previous, type: 'EXPENSE', categoryId: '' }))}
            >
              <ArrowDownRight size={20} />
              <span>Chi phi</span>
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${formData.type === 'INCOME' ? styles.active : ''}`}
              onClick={() => setFormData((previous) => ({ ...previous, type: 'INCOME', categoryId: '' }))}
            >
              <ArrowUpRight size={20} />
              <span>Thu nhap</span>
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${formData.type === 'TRANSFER' ? styles.active : ''}`}
              onClick={() => setFormData((previous) => ({ ...previous, type: 'TRANSFER', categoryId: '' }))}
            >
              <Repeat size={20} />
              <span>Chuyen tien</span>
            </button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Chon vi</label>
            <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className={`${styles.select} ${errors.walletId ? styles.error : ''}`}
            >
              <option value="">-- Chon vi --</option>
              {Array.isArray(wallets) && wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} - {wallet.type === 'CASH' ? 'Tien mat' : 'The tin dung'}
                </option>
              ))}
            </select>
            {errors.walletId && <span className={styles.errorMessage}>{errors.walletId}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>So tien</label>
            <div className={styles.amountInput}>
              <span className={styles.currency}>VND</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Nhap so tien"
                className={`${styles.input} ${errors.amount ? styles.error : ''}`}
                min="0"
                step="1000"
              />
            </div>
            {errors.amount && <span className={styles.errorMessage}>{errors.amount}</span>}
          </div>

          {formData.type !== 'TRANSFER' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Danh muc</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">-- Khong chon danh muc --</option>
                {formData.type === 'EXPENSE' && Array.isArray(categories.expense) && categories.expense.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
                {formData.type === 'INCOME' && Array.isArray(categories.income) && categories.income.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Ngay giao dich</label>
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

          <div className={styles.formGroup}>
            <label className={styles.label}>Mo ta</label>
            <div className={styles.descriptionInput}>
              <FileText size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhap mo ta (khong bat buoc)"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Huy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Dang xu ly...' : (isEditing ? 'Cap nhat' : 'Them giao dich')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
