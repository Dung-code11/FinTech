import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import styles from '../css/WalletDialog.module.css';
import { 
  X, 
  Wallet, 
  CreditCard, 
  Users, 
  Calendar,
  AlertCircle,
  ChevronDown,
  Check,
  Info
} from 'lucide-react';

const WalletDialog = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [walletType, setWalletType] = useState('cash');
  const [formData, setFormData] = useState({
    name: '',
    currency: 'VND',
    creditLimit: '',
    unpaidBalance: '',
    dueDate: '',
    initialBalance: '',
    inviteOthers: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { createWallet } = useWallet();

  const currencies = [
    { code: 'VND', symbol: '₫', name: 'VND - Việt Nam Đồng' },
    { code: 'USD', symbol: '$', name: 'USD - Đô la Mỹ' },
    { code: 'EUR', symbol: '€', name: 'EUR - Euro' },
    { code: 'GBP', symbol: '£', name: 'GBP - Bảng Anh' },
    { code: 'JPY', symbol: '¥', name: 'JPY - Yên Nhật' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên ví';
    }

    if (walletType === 'credit') {
      if (!formData.creditLimit) {
        newErrors.creditLimit = 'Vui lòng nhập hạn mức tín dụng';
      } else if (parseFloat(formData.creditLimit) < 0) {
        newErrors.creditLimit = 'Hạn mức không được âm';
      }
    } else {
      if (!formData.initialBalance) {
        newErrors.initialBalance = 'Vui lòng nhập số dư ban đầu';
      } else if (parseFloat(formData.initialBalance) < 0) {
        newErrors.initialBalance = 'Số dư không được âm';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (step === 1) {
      if (validateForm()) {
        setStep(2);
      }
    } else {
      setLoading(true);
      
      // Chuẩn bị dữ liệu để gửi lên API
      const walletData = {
        ...formData,
        type: walletType,
        // Chuyển đổi số tiền từ string sang number
        initialBalance: formData.initialBalance ? parseFloat(formData.initialBalance) : 0,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        unpaidBalance: formData.unpaidBalance ? parseFloat(formData.unpaidBalance) : 0
      };

      const result = await createWallet(walletData);
      setLoading(false);

      if (result.success) {
        if (onSave) onSave(result.data);
        onClose();
        // Reset form
        setFormData({
          name: '',
          currency: 'VND',
          creditLimit: '',
          unpaidBalance: '',
          dueDate: '',
          initialBalance: '',
          inviteOthers: false
        });
        setStep(1);
      } else {
        setErrors({ submit: result.error });
      }
    }
  };

  const handleClose = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
    setFormData({
      name: '',
      currency: 'VND',
      creditLimit: '',
      unpaidBalance: '',
      dueDate: '',
      initialBalance: '',
      inviteOthers: false
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper}>
              <Wallet size={24} />
            </div>
            <div>
              <h2 className={styles.title}>Thiết lập ví mới</h2>
              <p className={styles.subtitle}>Hãy thiết lập ví của bạn để bắt đầu quản lý tài chính</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className={styles.progressSteps}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>
            <span className={styles.stepNumber}>{step > 1 ? <Check size={14} /> : '1'}</span>
            <span className={styles.stepLabel}>Thông tin cơ bản</span>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>Cài đặt nâng cao</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className={styles.scrollableContent}>
          {errors.submit && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              {errors.submit}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              {/* Wallet Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Loại ví
                  <span className={styles.required}>*</span>
                </label>
                <p className={styles.helper}>Chọn đây là ví tiền mặt hay thẻ tín dụng</p>
                
                <div className={styles.walletTypes}>
                  <button
                    type="button"
                    className={`${styles.typeCard} ${walletType === 'cash' ? styles.selected : ''}`}
                    onClick={() => setWalletType('cash')}
                  >
                    <div className={styles.typeIcon} style={{ background: walletType === 'cash' ? '#e3f2fd' : '#f1f5f9' }}>
                      <Wallet size={24} color={walletType === 'cash' ? '#1976d2' : '#64748b'} />
                    </div>
                    <div className={styles.typeInfo}>
                      <span className={styles.typeName}>Tiền mặt</span>
                      <span className={styles.typeDesc}>Ví tiền mặt thông thường</span>
                    </div>
                    {walletType === 'cash' && (
                      <div className={styles.typeCheck}>
                        <Check size={16} />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`${styles.typeCard} ${walletType === 'credit' ? styles.selected : ''}`}
                    onClick={() => setWalletType('credit')}
                  >
                    <div className={styles.typeIcon} style={{ background: walletType === 'credit' ? '#e3f2fd' : '#f1f5f9' }}>
                      <CreditCard size={24} color={walletType === 'credit' ? '#1976d2' : '#64748b'} />
                    </div>
                    <div className={styles.typeInfo}>
                      <span className={styles.typeName}>Thẻ tín dụng</span>
                      <span className={styles.typeDesc}>Quản lý thẻ tín dụng và hạn mức</span>
                    </div>
                    {walletType === 'credit' && (
                      <div className={styles.typeCheck}>
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Wallet Name */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">
                  Tên ví
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Ví chính, Thẻ Visa, ..."
                  className={`${styles.input} ${errors.name ? styles.error : ''}`}
                />
                {errors.name && (
                  <span className={styles.errorMessage}>
                    <AlertCircle size={14} />
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Currency */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="currency">
                  Tiền tệ
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className={styles.selectIcon} />
                </div>
              </div>

              {/* Conditional fields based on wallet type */}
              {walletType === 'credit' ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="creditLimit">
                      Hạn mức tín dụng
                      <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputPrefix}>
                        {currencies.find(c => c.code === formData.currency)?.symbol || '$'}
                      </span>
                      <input
                        type="number"
                        id="creditLimit"
                        name="creditLimit"
                        value={formData.creditLimit}
                        onChange={handleChange}
                        placeholder="0"
                        className={`${styles.input} ${styles.withPrefix} ${errors.creditLimit ? styles.error : ''}`}
                      />
                    </div>
                    {errors.creditLimit && (
                      <span className={styles.errorMessage}>
                        <AlertCircle size={14} />
                        {errors.creditLimit}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="unpaidBalance">
                      Số dư chưa thanh toán
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputPrefix}>
                        {currencies.find(c => c.code === formData.currency)?.symbol || '$'}
                      </span>
                      <input
                        type="number"
                        id="unpaidBalance"
                        name="unpaidBalance"
                        value={formData.unpaidBalance}
                        onChange={handleChange}
                        placeholder="0"
                        className={`${styles.input} ${styles.withPrefix}`}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="dueDate">
                      Ngày đến hạn
                    </label>
                    <div className={styles.inputWrapper}>
                      <Calendar size={18} className={styles.inputIcon} />
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className={`${styles.input} ${styles.withIcon}`}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="initialBalance">
                    Số dư ban đầu
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputPrefix}>
                      {currencies.find(c => c.code === formData.currency)?.symbol || '$'}
                    </span>
                    <input
                      type="number"
                      id="initialBalance"
                      name="initialBalance"
                      value={formData.initialBalance}
                      onChange={handleChange}
                      placeholder="0"
                      className={`${styles.input} ${styles.withPrefix} ${errors.initialBalance ? styles.error : ''}`}
                    />
                  </div>
                  {errors.initialBalance && (
                    <span className={styles.errorMessage}>
                      <AlertCircle size={14} />
                      {errors.initialBalance}
                    </span>
                  )}
                </div>
              )}

              {/* Invite Others */}
              <div className={styles.formGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="inviteOthers"
                    checked={formData.inviteOthers}
                    onChange={handleChange}
                  />
                  <span className={styles.checkboxLabel}>
                    <Users size={18} />
                    Mời người khác cùng quản lý ví
                  </span>
                </label>
                <p className={styles.helper}>
                  Bạn có thể mời thành viên gia đình hoặc bạn bè cùng quản lý ví này
                </p>
              </div>
            </>
          )}

          {/* Step 2: Advanced Settings */}
          {step === 2 && (
            <>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Tóm tắt thông tin</h3>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Loại ví</span>
                    <span className={styles.summaryValue}>
                      {walletType === 'cash' ? 'Tiền mặt' : 'Thẻ tín dụng'}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Tên ví</span>
                    <span className={styles.summaryValue}>{formData.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Tiền tệ</span>
                    <span className={styles.summaryValue}>{formData.currency}</span>
                  </div>
                  {walletType === 'credit' ? (
                    <>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Hạn mức</span>
                        <span className={styles.summaryValue}>
                          {currencies.find(c => c.code === formData.currency)?.symbol}
                          {parseFloat(formData.creditLimit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Dư nợ</span>
                        <span className={styles.summaryValue}>
                          {currencies.find(c => c.code === formData.currency)?.symbol}
                          {parseFloat(formData.unpaidBalance || 0).toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Số dư</span>
                      <span className={styles.summaryValue}>
                        {currencies.find(c => c.code === formData.currency)?.symbol}
                        {parseFloat(formData.initialBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.advancedSection}>
                <h3 className={styles.sectionTitle}>
                  <Info size={18} />
                  Cài đặt nâng cao (Tùy chọn)
                </h3>
                
                <div className={styles.advancedOption}>
                  <label className={styles.switchLabel}>
                    <span className={styles.optionText}>
                      <strong>Cảnh báo ngân sách</strong>
                      <span className={styles.optionDesc}>Nhận thông báo khi chi tiêu vượt ngưỡng</span>
                    </span>
                    <input type="checkbox" className={styles.switch} />
                  </label>
                </div>

                <div className={styles.advancedOption}>
                  <label className={styles.switchLabel}>
                    <span className={styles.optionText}>
                      <strong>Tự động phân loại</strong>
                      <span className={styles.optionDesc}>Tự động phân loại giao dịch cho ví này</span>
                    </span>
                    <input type="checkbox" className={styles.switch} defaultChecked />
                  </label>
                </div>

                <div className={styles.advancedOption}>
                  <label className={styles.switchLabel}>
                    <span className={styles.optionText}>
                      <strong>Bao gồm trong báo cáo</strong>
                      <span className={styles.optionDesc}>Tính vào báo cáo tổng quan tài chính</span>
                    </span>
                    <input type="checkbox" className={styles.switch} defaultChecked />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={handleClose} disabled={loading}>
            {step === 2 ? 'Quay lại' : 'Hủy'}
          </button>
          <button 
            className={styles.continueBtn} 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (step === 1 ? 'Tiếp tục' : 'Hoàn tất')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDialog;