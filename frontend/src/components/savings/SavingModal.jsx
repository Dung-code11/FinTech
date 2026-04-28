import React, { useState } from 'react';
import styles from '../../css/SavingModal.module.css';
import { X, Calendar, Target, Repeat, Tag, AlertCircle } from 'lucide-react';
import { useSavings } from '../../context/SavingsContext';

const SavingModal = ({ isOpen, onClose, savingType }) => {
  const [formData, setFormData] = useState({
    title: '',
    currency: 'VND',
    targetAmount: '',
    category: '',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period: 'MONTHLY'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { createSaving } = useSavings();

  const isGoal = savingType === 'goal';

  const currencies = [
    { code: 'VND', symbol: '₫', name: 'Việt Nam Đồng' },
    { code: 'USD', symbol: '$', name: 'Đô la Mỹ' },
    { code: 'EUR', symbol: '€', name: 'Euro' }
  ];

  const categories = [
    'Du lịch', 'Mua nhà', 'Mua xe', 'Học tập', 'Đầu tư', 'Dự phòng', 'Hưu trí', 'Khác'
  ];

  const periods = [
    { value: 'WEEKLY', label: 'Hàng tuần' },
    { value: 'MONTHLY', label: 'Hàng tháng' },
    { value: 'YEARLY', label: 'Hàng năm' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    }

    if (isGoal) {
      if (!formData.targetAmount) {
        newErrors.targetAmount = 'Vui lòng nhập số tiền mục tiêu';
      } else if (parseFloat(formData.targetAmount) <= 0) {
        newErrors.targetAmount = 'Số tiền phải lớn hơn 0';
      }
      
      if (!formData.targetDate) {
        newErrors.targetDate = 'Vui lòng chọn ngày mục tiêu';
      }
    } else {
      if (!formData.targetAmount) {
        newErrors.targetAmount = 'Vui lòng nhập số tiền mỗi kỳ';
      } else if (parseFloat(formData.targetAmount) <= 0) {
        newErrors.targetAmount = 'Số tiền phải lớn hơn 0';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn hạng mục';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    const submitData = {
      title: formData.title,
      currency: formData.currency,
      targetAmount: parseFloat(formData.targetAmount),
      type: isGoal ? 'GOAL' : 'PERIODIC',
      category: formData.category,
      targetDate: isGoal ? formData.targetDate : null,
      period: !isGoal ? formData.period : null
    };

    const result = await createSaving(submitData);
    
    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  const currencySymbol = currencies.find(c => c.code === formData.currency)?.symbol || '₫';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            {isGoal ? (
              <>
                <Target size={20} />
                Tạo mục tiêu tiết kiệm
              </>
            ) : (
              <>
                <Repeat size={20} />
                Tạo tiết kiệm định kỳ
              </>
            )}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Tiêu đề */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tiêu đề <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={isGoal ? "VD: Tiết kiệm du lịch Nhật Bản" : "VD: Tiết kiệm hàng tháng"}
              className={`${styles.input} ${errors.title ? styles.error : ''}`}
            />
            {errors.title && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.title}
              </span>
            )}
          </div>

          {/* Đơn vị tiền tệ */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Đơn vị tiền tệ</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={styles.select}
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.name} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Số tiền */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {isGoal ? 'Số tiền mục tiêu' : 'Số tiền mỗi kỳ'}
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.amountInput}>
              <span className={styles.currency}>{currencySymbol}</span>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="0"
                className={`${styles.input} ${styles.withPrefix} ${errors.targetAmount ? styles.error : ''}`}
                step="1000"
                min="0"
              />
            </div>
            {errors.targetAmount && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.targetAmount}
              </span>
            )}
          </div>

          {/* Hạng mục */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Hạng mục tiết kiệm <span className={styles.required}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`${styles.select} ${errors.category ? styles.error : ''}`}
            >
              <option value="">-- Chọn hạng mục --</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.category}
              </span>
            )}
          </div>

          {/* Ngày mục tiêu (chỉ cho tiết kiệm mục tiêu) */}
          {isGoal && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Ngày mục tiêu <span className={styles.required}>*</span>
              </label>
              <div className={styles.dateInput}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.targetDate ? styles.error : ''}`}
                />
              </div>
              {errors.targetDate && (
                <span className={styles.errorMessage}>
                  <AlertCircle size={14} />
                  {errors.targetDate}
                </span>
              )}
            </div>
          )}

          {/* Chu kỳ (chỉ cho tiết kiệm định kỳ) */}
          {!isGoal && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Chu kỳ <span className={styles.required}>*</span>
              </label>
              <div className={styles.cycleSelector}>
                {periods.map(period => (
                  <button
                    key={period.value}
                    type="button"
                    className={`${styles.cycleBtn} ${formData.period === period.value ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, period: period.value }))}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang xử lý...' : (isGoal ? 'Tạo mục tiêu' : 'Tạo tiết kiệm định kỳ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingModal;