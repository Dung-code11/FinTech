import React, { useState, useEffect } from "react";
import styles from "../../css/DebtModal.module.css";
import { X, Wallet, FileText, AlertCircle } from "lucide-react";
import { debtService } from "../../services/debtService";

const PayModal = ({ isOpen, onClose, debt, wallets, onPay }) => {
  const [formData, setFormData] = useState({
    amount: "",
    walletId: wallets[0]?.id || "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  const remainingAmount = (debt?.amount || 0) - (debt?.paidAmount || 0);
  const progress =
    debt?.amount > 0 ? ((debt?.paidAmount || 0) / debt?.amount) * 100 : 0;

  // Reset form khi modal mở
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: "",
        walletId: wallets[0]?.id || "",
        note: "",
      });
      setErrors({});
      setSelectedWallet(wallets.find((w) => w.id === wallets[0]?.id));
    }
  }, [isOpen, wallets]);

  // Cập nhật selectedWallet khi walletId thay đổi
  useEffect(() => {
    const wallet = wallets.find((w) => w.id === formData.walletId);
    setSelectedWallet(wallet);
  }, [formData.walletId, wallets]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const amountValue = parseFloat(formData.amount);

    if (!formData.amount) {
      newErrors.amount = "Vui lòng nhập số tiền trả";
    } else if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
    } else if (amountValue > remainingAmount) {
      newErrors.amount = `Số tiền không được vượt quá ${debtService.formatAmount(remainingAmount)}`;
    }

    if (!formData.walletId) {
      newErrors.walletId = "Vui lòng chọn ví thanh toán";
    }

    // Kiểm tra số dư ví
    if (selectedWallet && amountValue > 0 && !isNaN(amountValue)) {
      let currentBalance = 0;
      if (selectedWallet.type === "CASH") {
        currentBalance = selectedWallet.balance || 0;
      } else {
        // Với thẻ tín dụng, số dư khả dụng = creditLimit - unpaidBalance
        currentBalance =
          (selectedWallet.creditLimit || 0) -
          (selectedWallet.unpaidBalance || 0);
      }

      if (amountValue > currentBalance) {
        newErrors.amount = `Số tiền vượt quá số dư ví (${debtService.formatAmount(currentBalance)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const submitData = {
      amount: parseFloat(formData.amount),
      walletId: formData.walletId,
      note: formData.note,
      title: `Trả nợ ${debt?.name}`,
    };

    console.log("Submitting payment:", submitData);

    try {
      const result = await onPay(debt.id, submitData);
      console.log("Payment result from modal:", result);

      if (result && result.success) {
        onClose();
      } else {
        const errorMsg = result?.error || "Không thể trả nợ, vui lòng thử lại";
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Lấy số dư hiển thị của ví được chọn
  const getWalletBalanceDisplay = () => {
    if (!selectedWallet) return "0₫";
    if (selectedWallet.type === "CASH") {
      return debtService.formatAmount(selectedWallet.balance || 0);
    } else {
      const availableBalance =
        (selectedWallet.creditLimit || 0) - (selectedWallet.unpaidBalance || 0);
      return debtService.formatAmount(availableBalance);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Trả nợ - {debt?.name}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Thông tin khoản nợ */}
        <div className={styles.debtInfo}>
          <div className={styles.infoRow}>
            <span>Tổng nợ:</span>
            <strong>{debtService.formatAmount(debt?.amount || 0)}</strong>
          </div>
          <div className={styles.infoRow}>
            <span>Đã trả:</span>
            <strong className={styles.paidAmount}>
              {debtService.formatAmount(debt?.paidAmount || 0)}
            </strong>
          </div>
          <div className={styles.infoRow}>
            <span>Còn lại:</span>
            <strong className={styles.remainingAmount}>
              {debtService.formatAmount(remainingAmount)}
            </strong>
          </div>
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className={styles.progressText}>{progress.toFixed(1)}%</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Ví thanh toán */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ví thanh toán <span className={styles.required}>*</span>
            </label>
            <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className={`${styles.select} ${errors.walletId ? styles.error : ""}`}
            >
              <option value="">-- Chọn ví --</option>
              {wallets.map((wallet) => {
                let balanceDisplay = "";
                if (wallet.type === "CASH") {
                  balanceDisplay = ` (Số dư: ${debtService.formatAmount(wallet.balance || 0)})`;
                } else {
                  const availableBalance =
                    (wallet.creditLimit || 0) - (wallet.unpaidBalance || 0);
                  balanceDisplay = ` (Hạn mức còn: ${debtService.formatAmount(availableBalance)})`;
                }
                return (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} -{" "}
                    {wallet.type === "CASH" ? "Tiền mặt" : "Thẻ tín dụng"}
                    {balanceDisplay}
                  </option>
                );
              })}
            </select>
            {selectedWallet && (
              <div className={styles.walletBalanceInfo}>
                <Wallet size={14} />
                <span>Số dư khả dụng: {getWalletBalanceDisplay()}</span>
              </div>
            )}
            {errors.walletId && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.walletId}
              </span>
            )}
          </div>

          {/* Số tiền trả */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Số tiền trả <span className={styles.required}>*</span>
            </label>
            <div className={styles.amountInput}>
              <span className={styles.currency}>₫</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                className={`${styles.input} ${styles.withPrefix} ${errors.amount ? styles.error : ""}`}
                step="1000"
                min="0"
                max={Math.min(
                  remainingAmount,
                  selectedWallet?.type === "CASH"
                    ? selectedWallet.balance || 0
                    : (selectedWallet?.creditLimit || 0) -
                        (selectedWallet?.unpaidBalance || 0),
                )}
              />
            </div>
            {errors.amount && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.amount}
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
                placeholder="Ghi chú cho lần trả này (không bắt buộc)"
                className={styles.textarea}
                rows={2}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận trả nợ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayModal;
