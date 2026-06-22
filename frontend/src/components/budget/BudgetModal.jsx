import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "../../css/BudgetModal.module.css";
import {
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { categoryService } from "../../services/categoryService";

const BudgetModal = ({
  isOpen,
  onClose,
  onSave,
  budget,
  wallets = [],
  selectedWalletId = "",
  isEditing = false,
}) => {
  const calculateEndDate = (startDate, period) => {
    if (!startDate) return "";

    const start = new Date(startDate);
    const end = new Date(start);

    switch (period) {
      case "DAILY":
        end.setDate(start.getDate() + 1);
        break;
      case "WEEKLY":
        end.setDate(start.getDate() + 7);
        break;
      case "MONTHLY":
      default:
        end.setMonth(start.getMonth() + 1);
        break;
    }

    return end.toISOString().split("T")[0];
  };

  const getDefaultFormData = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      walletId: selectedWalletId,
      budget_name: "",
      type: "EXPENSE",
      amount: "",
      startDate: today,
      endDate: calculateEndDate(today, "MONTHLY"),
      period: "MONTHLY",
      categoryIds: [],
    };
  }, [selectedWalletId]);

  const [formData, setFormData] = useState(getDefaultFormData);
  const [errors, setErrors] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const dropdownBtnRef = useRef(null);
  const modalRef = useRef(null);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    const type = formData.type === "EXPENSE" ? "EXPENSE" : "INCOME";
    const result = await categoryService.getCategories(type);

    if (result.success && result.data) {
      setAvailableCategories(result.data);
    } else {
      setAvailableCategories([]);
    }

    setLoadingCategories(false);
  }, [formData.type]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  useEffect(() => {
    if (showCategoryDropdown && dropdownBtnRef.current) {
      const rect = dropdownBtnRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showCategoryDropdown]);

  useEffect(() => {
    setFormData((previous) => {
      const nextEndDate = calculateEndDate(previous.startDate, previous.period);
      if (previous.endDate === nextEndDate) {
        return previous;
      }

      return { ...previous, endDate: nextEndDate };
    });
  }, [formData.startDate, formData.period]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (budget) {
      setFormData({
        walletId: budget.walletId || selectedWalletId,
        budget_name: budget.budget_name || budget.name || "",
        type: budget.type || "EXPENSE",
        amount: budget.amount || "",
        startDate: budget.startDate || new Date().toISOString().split("T")[0],
        endDate: budget.endDate || "",
        period: budget.period || "MONTHLY",
        categoryIds: budget.categories?.map((category) => category.id) || [],
      });
      setSelectedCategories(budget.categories || []);
      return;
    }

    setFormData(getDefaultFormData());
    setSelectedCategories([]);
  }, [budget, getDefaultFormData, isOpen, selectedWalletId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownBtnRef.current && !dropdownBtnRef.current.contains(event.target)) {
        const dropdownMenu = document.querySelector(`.${styles.dropdownMenuPortal}`);
        if (!dropdownMenu || !dropdownMenu.contains(event.target)) {
          setShowCategoryDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: "" }));
    }
  };

  const handlePeriodChange = (period) => {
    setFormData((previous) => ({
      ...previous,
      period,
      endDate: calculateEndDate(previous.startDate, period),
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((previous) => ({ ...previous, type, categoryIds: [] }));
    setSelectedCategories([]);
  };

  const handleCategorySelect = (categoryId) => {
    const newIds = formData.categoryIds.includes(categoryId)
      ? formData.categoryIds.filter((id) => id !== categoryId)
      : [...formData.categoryIds, categoryId];

    setFormData((previous) => ({ ...previous, categoryIds: newIds }));

    const newSelected = newIds
      .map((id) => availableCategories.find((category) => category.id === id))
      .filter(Boolean);

    setSelectedCategories(newSelected);
    setShowCategoryDropdown(false);
  };

  const removeCategory = (categoryId) => {
    const newIds = formData.categoryIds.filter((id) => id !== categoryId);
    setFormData((previous) => ({ ...previous, categoryIds: newIds }));
    setSelectedCategories((previous) =>
      previous.filter((category) => category.id !== categoryId)
    );
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!isEditing && !formData.walletId) {
      nextErrors.walletId = "Vui long chon vi";
    }

    if (!formData.budget_name.trim()) {
      nextErrors.budget_name = "Vui long nhap ten ngan sach";
    }

    if (!formData.amount) {
      nextErrors.amount = "Vui long nhap so tien";
    } else if (parseFloat(formData.amount) <= 0) {
      nextErrors.amount = "So tien phai lon hon 0";
    }

    if (!formData.startDate) {
      nextErrors.startDate = "Vui long chon ngay bat dau";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      walletId: formData.walletId,
      budget_name: formData.budget_name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      period: formData.period,
      categoryIds: formData.categoryIds,
    };

    if (isEditing) {
      await onSave(budget.id, submitData);
    } else {
      await onSave(submitData);
    }
  };

  const periods = [
    { value: "DAILY", label: "Hang ngay" },
    { value: "WEEKLY", label: "Hang tuan" },
    { value: "MONTHLY", label: "Hang thang" },
  ];

  const getModalTitle = () => {
    if (isEditing) {
      return formData.type === "EXPENSE" ? "Sua ngan sach" : "Sua muc tieu";
    }

    return formData.type === "EXPENSE" ? "Tao ngan sach moi" : "Tao muc tieu moi";
  };

  const renderDropdownPortal = () => {
    if (!showCategoryDropdown) return null;

    return ReactDOM.createPortal(
      <div
        className={styles.dropdownMenuPortal}
        style={{
          position: "absolute",
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 9999,
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {loadingCategories ? (
          <div className={styles.loadingCategories}>
            <RefreshCw size={16} className={styles.spinner} />
            <span>Dang tai danh muc...</span>
          </div>
        ) : availableCategories.length === 0 ? (
          <div className={styles.noCategories}>
            Khong co danh muc {formData.type === "EXPENSE" ? "chi phi" : "thu nhap"}
          </div>
        ) : (
          availableCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.dropdownItem} ${
                formData.categoryIds.includes(category.id) ? styles.selected : ""
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              {formData.categoryIds.includes(category.id) && <CheckCircle size={14} />}
              <span className={styles.categoryName}>{category.categoryName || category.name}</span>
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
      <div className={styles.modal} ref={modalRef} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2>{getModalTitle()}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isEditing && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Vi ap dung</label>
              <select
                name="walletId"
                value={formData.walletId}
                onChange={handleChange}
                className={`${styles.input} ${errors.walletId ? styles.error : ""}`}
              >
                <option value="">-- Chon vi --</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} - {wallet.type === "CASH" ? "Tien mat" : "The tin dung"}
                  </option>
                ))}
              </select>
              {errors.walletId && <span className={styles.errorMessage}>{errors.walletId}</span>}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {formData.type === "EXPENSE" ? "Ten ngan sach" : "Ten muc tieu"}
            </label>
            <input
              type="text"
              name="budget_name"
              value={formData.budget_name}
              onChange={handleChange}
              placeholder={formData.type === "EXPENSE" ? "VD: Chi tieu thang 3" : "VD: Thu nhap freelance"}
              className={`${styles.input} ${errors.budget_name ? styles.error : ""}`}
            />
            {errors.budget_name && <span className={styles.errorMessage}>{errors.budget_name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Loai</label>
            <div className={styles.typeSelector}>
              <button
                type="button"
                className={`${styles.typeBtn} ${formData.type === "EXPENSE" ? styles.active : ""}`}
                onClick={() => handleTypeChange("EXPENSE")}
              >
                <TrendingDown size={18} />
                <span>Ngan sach chi phi</span>
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${formData.type === "INCOME" ? styles.active : ""}`}
                onClick={() => handleTypeChange("INCOME")}
              >
                <TrendingUp size={18} />
                <span>Muc tieu thu nhap</span>
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {formData.type === "EXPENSE" ? "So tien ngan sach" : "So tien muc tieu"}
            </label>
            <div className={styles.amountInput}>
              <span className={styles.currency}>VND</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                className={`${styles.input} ${styles.withPrefix} ${errors.amount ? styles.error : ""}`}
                step="1000"
                min="0"
              />
            </div>
            {errors.amount && <span className={styles.errorMessage}>{errors.amount}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Chu ky</label>
            <div className={styles.periodSelector}>
              {periods.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  className={`${styles.periodBtn} ${formData.period === period.value ? styles.active : ""}`}
                  onClick={() => handlePeriodChange(period.value)}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ngay bat dau</label>
              <div className={styles.dateInput}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.startDate ? styles.error : ""}`}
                />
              </div>
              {errors.startDate && <span className={styles.errorMessage}>{errors.startDate}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ngay ket thuc</label>
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
              <small className={styles.hintText}>Tu dong tinh theo chu ky</small>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Danh muc (khong bat buoc)</label>
            <div className={styles.categoryDropdown}>
              <button
                type="button"
                ref={dropdownBtnRef}
                className={styles.dropdownBtn}
                onClick={() => setShowCategoryDropdown((previous) => !previous)}
              >
                <span>
                  {selectedCategories.length > 0
                    ? `Da chon ${selectedCategories.length} danh muc`
                    : "Chon danh muc"}
                </span>
                <ChevronDown size={16} className={showCategoryDropdown ? styles.rotated : ""} />
              </button>
            </div>

            {selectedCategories.length > 0 && (
              <div className={styles.selectedCategories}>
                {selectedCategories.map((category) => (
                  <span key={category.id} className={styles.selectedTag}>
                    {category.categoryName || category.name}
                    <button
                      type="button"
                      className={styles.removeTag}
                      onClick={() => removeCategory(category.id)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Huy
            </button>
            <button type="submit" className={styles.submitBtn}>
              {isEditing ? "Cap nhat" : formData.type === "EXPENSE" ? "Tao ngan sach" : "Tao muc tieu"}
            </button>
          </div>
        </form>

        {renderDropdownPortal()}
      </div>
    </div>
  );
};

export default BudgetModal;
