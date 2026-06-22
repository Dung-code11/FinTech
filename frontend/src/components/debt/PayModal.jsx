import React, { useEffect, useState } from "react";
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

  const selectedWallet =
    wallets.find((wallet) => wallet.id === formData.walletId) || null;
  const remainingAmount = (debt?.amount || 0) - (debt?.paidAmount || 0);
  const progress =
    debt?.amount > 0 ? ((debt?.paidAmount || 0) / debt?.amount) * 100 : 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData({
      amount: "",
      walletId: wallets[0]?.id || "",
      note: "",
    });
    setErrors({});
  }, [isOpen, wallets]);

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
      newErrors.amount = "Vui long nhap so tien tra";
    } else if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "So tien phai lon hon 0";
    } else if (amountValue > remainingAmount) {
      newErrors.amount = `So tien khong duoc vuot qua ${debtService.formatAmount(remainingAmount)}`;
    }

    if (!formData.walletId) {
      newErrors.walletId = "Vui long chon vi thanh toan";
    }

    if (selectedWallet && amountValue > 0 && !isNaN(amountValue)) {
      const currentBalance =
        selectedWallet.type === "CASH"
          ? selectedWallet.balance || 0
          : (selectedWallet.creditLimit || 0) - (selectedWallet.unpaidBalance || 0);

      if (amountValue > currentBalance) {
        newErrors.amount = `So tien vuot qua so du vi (${debtService.formatAmount(currentBalance)})`;
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
      title: `Tra no ${debt?.name}`,
    };

    try {
      const result = await onPay(debt.id, submitData);

      if (result && result.success) {
        onClose();
      } else {
        alert(result?.error || "Khong the tra no, vui long thu lai");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Co loi xay ra, vui long thu lai");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getWalletBalanceDisplay = () => {
    if (!selectedWallet) return "0VND";
    if (selectedWallet.type === "CASH") {
      return debtService.formatAmount(selectedWallet.balance || 0);
    }

    const availableBalance =
      (selectedWallet.creditLimit || 0) - (selectedWallet.unpaidBalance || 0);
    return debtService.formatAmount(availableBalance);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Tra no - {debt?.name}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.debtInfo}>
          <div className={styles.infoRow}>
            <span>Tong no:</span>
            <strong>{debtService.formatAmount(debt?.amount || 0)}</strong>
          </div>
          <div className={styles.infoRow}>
            <span>Da tra:</span>
            <strong className={styles.paidAmount}>
              {debtService.formatAmount(debt?.paidAmount || 0)}
            </strong>
          </div>
          <div className={styles.infoRow}>
            <span>Con lai:</span>
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
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Vi thanh toan <span className={styles.required}>*</span>
            </label>
            <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className={`${styles.select} ${errors.walletId ? styles.error : ""}`}
            >
              <option value="">-- Chon vi --</option>
              {wallets.map((wallet) => {
                const balanceDisplay =
                  wallet.type === "CASH"
                    ? ` (So du: ${debtService.formatAmount(wallet.balance || 0)})`
                    : ` (Han muc con: ${debtService.formatAmount(
                        (wallet.creditLimit || 0) - (wallet.unpaidBalance || 0)
                      )})`;

                return (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} - {wallet.type === "CASH" ? "Tien mat" : "The tin dung"}
                    {balanceDisplay}
                  </option>
                );
              })}
            </select>
            {selectedWallet && (
              <div className={styles.walletBalanceInfo}>
                <Wallet size={14} />
                <span>So du kha dung: {getWalletBalanceDisplay()}</span>
              </div>
            )}
            {errors.walletId && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} />
                {errors.walletId}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              So tien tra <span className={styles.required}>*</span>
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

          <div className={styles.formGroup}>
            <label className={styles.label}>Ghi chu</label>
            <div className={styles.inputWithIcon}>
              <FileText size={18} className={styles.inputIcon} />
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Ghi chu cho lan tra nay (khong bat buoc)"
                className={styles.textarea}
                rows={2}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Huy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Dang xu ly..." : "Xac nhan tra no"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayModal;
