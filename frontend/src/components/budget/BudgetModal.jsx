import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from '../../css/BudgetModal.module.css';
import { 
  X, 
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { categoryService } from '../../services/categoryService';

const BudgetModal = ({ isOpen, onClose, onSave, budget, categories, isEditing = false }) => {
  const [formData, setFormData] = useState({
    budget_name: '',
    type: 'EXPENSE',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    period: 'MONTHLY',
    categoryIds: []
  });

  const [errors, setErrors] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const dropdownBtnRef = useRef(null);
  const modalRef = useRef(null);

  // Lấy danh mục từ API khi modal mở hoặc khi loại thay đổi
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, formData.type]);

  // Tính toán vị trí dropdown
  useEffect(() => {
    if (showCategoryDropdown && dropdownBtnRef.current) {
      const rect = dropdownBtnRef.current.getBoundingClientRect();
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showCategoryDropdown]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    const type = formData.type === 'EXPENSE' ? 'EXPENSE' : 'INCOME';
    console.log('Loading categories for type:', type); // Debug log
    
    const result = await categoryService.getCategories(type);
    console.log('Categories result:', result); // Debug log
    
    if (result.success && result.data) {
      const categoriesData = result.data;
      console.log('Categories data:', categoriesData); // Debug log
      setAvailableCategories(categoriesData);
    } else {
      console.log('No categories found or error:', result.error);
      setAvailableCategories([]);
    }
    setLoadingCategories(false);
  };

  // Tính ngày kết thúc dựa trên ngày bắt đầu và chu kỳ
  const calculateEndDate = (startDate, period) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    let end = new Date(start);
    
    switch(period) {
      case 'DAILY':
        end.setDate(start.getDate() + 1);
        break;
      case 'WEEKLY':
        end.setDate(start.getDate() + 7);
        break;
      case 'MONTHLY':
        end.setMonth(start.getMonth() + 1);
        break;
      default:
        end.setMonth(start.getMonth() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  // Cập nhật ngày kết thúc khi thay đổi ngày bắt đầu hoặc chu kỳ
  useEffect(() => {
    if (formData.startDate && formData.period) {
      const calculatedEndDate = calculateEndDate(formData.startDate, formData.period);
      setFormData(prev => ({ ...prev, endDate: calculatedEndDate }));
    }
  }, [formData.startDate, formData.period]);

  // Reset form khi mở modal mới
  useEffect(() => {
    if (isOpen && !budget) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        budget_name: '',
        type: 'EXPENSE',
        amount: '',
        startDate: today,
        endDate: calculateEndDate(today, 'MONTHLY'),
        period: 'MONTHLY',
        categoryIds: []
      });
      setSelectedCategories([]);
    }
  }, [isOpen, budget]);

  // Load dữ liệu khi sửa budget
  useEffect(() => {
    if (budget && isOpen) {
      setFormData({
        budget_name: budget.budget_name || budget.name || '',
        type: budget.type || 'EXPENSE',
        amount: budget.amount || '',
        startDate: budget.startDate || new Date().toISOString().split('T')[0],
        endDate: budget.endDate || '',
        period: budget.period || 'MONTHLY',
        categoryIds: budget.categories?.map(c => c.id) || []
      });
      setSelectedCategories(budget.categories || []);
    }
  }, [budget, isOpen]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownBtnRef.current && !dropdownBtnRef.current.contains(event.target)) {
        // Kiểm tra xem click có vào dropdown menu không
        const dropdownMenu = document.querySelector(`.${styles.dropdownMenuPortal}`);
        if (dropdownMenu && !dropdownMenu.contains(event.target)) {
          setShowCategoryDropdown(false);
        } else if (!dropdownMenu) {
          setShowCategoryDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePeriodChange = (period) => {
    setFormData(prev => ({ ...prev, period }));
    if (formData.startDate) {
      const newEndDate = calculateEndDate(formData.startDate, period);
      setFormData(prev => ({ ...prev, endDate: newEndDate }));
    }
  };

  const handleTypeChange = (type) => {
    console.log('Type changed to:', type); // Debug log
    setFormData(prev => ({ ...prev, type, categoryIds: [] }));
    setSelectedCategories([]);
    // Load categories sẽ được gọi trong useEffect
  };

  const handleCategorySelect = (categoryId, category) => {
    console.log('Selecting category:', categoryId, category); // Debug log
    
    const newIds = formData.categoryIds.includes(categoryId)
      ? formData.categoryIds.filter(id => id !== categoryId)
      : [...formData.categoryIds, categoryId];
    
    setFormData(prev => ({ ...prev, categoryIds: newIds }));
    
    const newSelected = newIds.map(id => 
      availableCategories.find(c => c.id === id)
    ).filter(Boolean);
    setSelectedCategories(newSelected);
    setShowCategoryDropdown(false);
  };

  const removeCategory = (categoryId) => {
    const newIds = formData.categoryIds.filter(id => id !== categoryId);
    setFormData(prev => ({ ...prev, categoryIds: newIds }));
    setSelectedCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.budget_name.trim()) {
      newErrors.budget_name = 'Vui lòng nhập tên ngân sách';
    }

    if (!formData.amount) {
      newErrors.amount = 'Vui lòng nhập số tiền';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      budget_name: formData.budget_name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      period: formData.period,
      categoryIds: formData.categoryIds
    };

    if (isEditing) {
      await onSave(budget.id, submitData);
    } else {
      await onSave(submitData);
    }
  };

  const periods = [
    { value: 'DAILY', label: 'Hàng ngày' },
    { value: 'WEEKLY', label: 'Hàng tuần' },
    { value: 'MONTHLY', label: 'Hàng tháng' }
  ];

  // Tiêu đề modal theo loại
  const getModalTitle = () => {
    if (isEditing) {
      return formData.type === 'EXPENSE' ? 'Sửa ngân sách' : 'Sửa mục tiêu';
    }
    return formData.type === 'EXPENSE' ? 'Tạo ngân sách mới' : 'Tạo mục tiêu mới';
  };

  // Render dropdown bằng Portal
  const renderDropdownPortal = () => {
    if (!showCategoryDropdown) return null;

    console.log('Rendering dropdown with categories:', availableCategories); // Debug log

    return ReactDOM.createPortal(
      <div 
        className={styles.dropdownMenuPortal}
        style={{
          position: 'absolute',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 9999,
          maxHeight: '300px',
          overflowY: 'auto'
        }}
      >
        {loadingCategories ? (
          <div className={styles.loadingCategories}>
            <RefreshCw size={16} className={styles.spinner} />
            <span>Đang tải danh mục...</span>
          </div>
        ) : availableCategories.length === 0 ? (
          <div className={styles.noCategories}>
            Không có danh mục {formData.type === 'EXPENSE' ? 'chi phí' : 'thu nhập'}
            <button 
              type="button" 
              onClick={() => {
                // Có thể thêm chức năng tạo danh mục nhanh
                alert('Vui lòng tạo danh mục trước');
              }}
              className={styles.createCategoryHint}
            >
              Tạo danh mục mới
            </button>
          </div>
        ) : (
          availableCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.dropdownItem} ${formData.categoryIds.includes(cat.id) ? styles.selected : ''}`}
              onClick={() => handleCategorySelect(cat.id, cat)}
            >
              {formData.categoryIds.includes(cat.id) && <CheckCircle size={14} />}
              <span className={styles.categoryName}>{cat.categoryName || cat.name}</span>
            </button>
          ))
        )}
      </div>,
      document.body
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} ref={modalRef} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{getModalTitle()}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name - budget_name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {formData.type === 'EXPENSE' ? 'Tên ngân sách' : 'Tên mục tiêu'}
            </label>
            <input
              type="text"
              name="budget_name"
              value={formData.budget_name}
              onChange={handleChange}
              placeholder={formData.type === 'EXPENSE' ? 'VD: Chi tiêu tháng 3' : 'VD: Tiết kiệm du lịch'}
              className={`${styles.input} ${errors.budget_name ? styles.error : ''}`}
            />
            {errors.budget_name && <span className={styles.errorMessage}>{errors.budget_name}</span>}
          </div>

          {/* Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Loại</label>
            <div className={styles.typeSelector}>
              <button
                type="button"
                className={`${styles.typeBtn} ${formData.type === 'EXPENSE' ? styles.active : ''}`}
                onClick={() => handleTypeChange('EXPENSE')}
              >
                <TrendingDown size={18} />
                <span>Ngân sách chi phí</span>
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${formData.type === 'INCOME' ? styles.active : ''}`}
                onClick={() => handleTypeChange('INCOME')}
              >
                <TrendingUp size={18} />
                <span>Mục tiêu thu nhập</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {formData.type === 'EXPENSE' ? 'Số tiền ngân sách' : 'Số tiền mục tiêu'}
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
            {errors.amount && <span className={styles.errorMessage}>{errors.amount}</span>}
          </div>

          {/* Period */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Chu kỳ</label>
            <div className={styles.periodSelector}>
              {periods.map(p => (
                <button
                  key={p.value}
                  type="button"
                  className={`${styles.periodBtn} ${formData.period === p.value ? styles.active : ''}`}
                  onClick={() => handlePeriodChange(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ngày bắt đầu</label>
              <div className={styles.dateInput}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.startDate ? styles.error : ''}`}
                />
              </div>
              {errors.startDate && <span className={styles.errorMessage}>{errors.startDate}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ngày kết thúc</label>
              <div className={styles.dateInput}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  readOnly
                  disabled
                  className={`${styles.input} ${styles.disabled}`}
                />
              </div>
              <small className={styles.hintText}>Tự động tính theo chu kỳ</small>
            </div>
          </div>

          {/* Categories - Dropdown với Portal */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Danh mục (không bắt buộc)</label>
            <div className={styles.categoryDropdown}>
              <button
                type="button"
                ref={dropdownBtnRef}
                className={styles.dropdownBtn}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span>
                  {selectedCategories.length > 0 
                    ? `Đã chọn ${selectedCategories.length} danh mục` 
                    : 'Chọn danh mục'}
                </span>
                <ChevronDown size={16} className={showCategoryDropdown ? styles.rotated : ''} />
              </button>
            </div>

            {/* Selected Categories Tags */}
            {selectedCategories.length > 0 && (
              <div className={styles.selectedCategories}>
                {selectedCategories.map(cat => (
                  <span key={cat.id} className={styles.selectedTag}>
                    {cat.categoryName || cat.name}
                    <button
                      type="button"
                      className={styles.removeTag}
                      onClick={() => removeCategory(cat.id)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn}>
              {isEditing ? 'Cập nhật' : (formData.type === 'EXPENSE' ? 'Tạo ngân sách' : 'Tạo mục tiêu')}
            </button>
          </div>
        </form>

        {/* Render dropdown bằng Portal */}
        {renderDropdownPortal()}
      </div>
    </div>
  );
};

export default BudgetModal;