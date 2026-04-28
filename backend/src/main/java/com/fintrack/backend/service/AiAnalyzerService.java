package com.fintrack.backend.service;

import com.fintrack.backend.model.Budget;
import com.fintrack.backend.model.Debt;
import com.fintrack.backend.model.Saving;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAnalyzerService {

    private final TransactionRepository transactionRepository;

    public String buildOverview(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (!snapshot.hasAnyData()) {
            return """
                    Mình chưa thấy đủ dữ liệu tài chính để phân tích.
                    Hãy tạo ví đầu tiên hoặc ghi vài giao dịch, rồi mình sẽ tổng hợp cho bạn.
                    """.trim();
        }

        StringBuilder reply = new StringBuilder("Tổng quan tài chính hiện tại:\n");
        reply.append("- Tháng này bạn thu ")
                .append(formatCurrency(snapshot.monthIncome()))
                .append(", chi ")
                .append(formatCurrency(snapshot.monthExpense()))
                .append(", chênh lệch ")
                .append(formatSignedCurrency(snapshot.monthNet()))
                .append(".\n");
        reply.append("- Tiền mặt còn ")
                .append(formatCurrency(snapshot.cashBalance()))
                .append(", hạn mức tín dụng còn ")
                .append(formatCurrency(snapshot.availableCredit()))
                .append(".\n");

        if (!snapshot.budgets().isEmpty()) {
            reply.append("- Bạn có ")
                    .append(snapshot.budgets().size())
                    .append(" ngân sách đang theo dõi");

            if (!snapshot.overBudgetItems().isEmpty()) {
                reply.append(", trong đó ")
                        .append(snapshot.overBudgetItems().size())
                        .append(" ngân sách đã vượt mức");
            } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
                reply.append(", có ")
                        .append(snapshot.nearLimitBudgetItems().size())
                        .append(" ngân sách đang gần chạm trần");
            }

            reply.append(".\n");
        }

        if (!snapshot.savings().isEmpty()) {
            reply.append("- Tiết kiệm hiện có ")
                    .append(formatCurrency(snapshot.totalSavingCurrent()))
                    .append(" trên mục tiêu ")
                    .append(formatCurrency(snapshot.totalSavingTarget()))
                    .append(".\n");
        }

        if (!snapshot.debts().isEmpty()) {
            reply.append("- Nợ còn lại ")
                    .append(formatCurrency(snapshot.totalDebtRemaining()))
                    .append(" trên ")
                    .append(snapshot.debts().size())
                    .append(" khoản.\n");
        }

        if (!snapshot.topExpenseCategories().isEmpty()) {
            reply.append("- Nhóm chi nhiều nhất tháng này: ")
                    .append(snapshot.topExpenseCategories().stream()
                            .map(category -> category.categoryName() + " " + formatCurrency(category.amount()))
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        String warnings = buildWarnings(snapshot);
        if (!warnings.isBlank()) {
            reply.append("Cần chú ý:\n").append(warnings);
        }

        return reply.toString().trim();
    }

    public String analyzeSpending(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.monthTransactions().isEmpty()) {
            return "Tháng này bạn chưa có giao dịch nào đủ để phân tích chi tiêu.";
        }

        StringBuilder reply = new StringBuilder("Phân tích chi tiêu tháng này:\n");
        reply.append("- Tổng chi: ").append(formatCurrency(snapshot.monthExpense())).append(".\n");
        reply.append("- Tổng thu: ").append(formatCurrency(snapshot.monthIncome())).append(".\n");
        reply.append("- Dòng tiền ròng: ").append(formatSignedCurrency(snapshot.monthNet())).append(".\n");

        if (!snapshot.topExpenseCategories().isEmpty()) {
            reply.append("- Danh mục chi nhiều nhất: ")
                    .append(snapshot.topExpenseCategories().stream()
                            .map(category -> category.categoryName() + " " + formatCurrency(category.amount()))
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        if (!snapshot.overBudgetItems().isEmpty()) {
            reply.append("- Ngân sách đã vượt: ")
                    .append(snapshot.overBudgetItems().stream()
                            .map(this::formatBudgetStatus)
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
            reply.append("- Ngân sách gần chạm trần: ")
                    .append(snapshot.nearLimitBudgetItems().stream()
                            .map(this::formatBudgetStatus)
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        return reply.toString().trim();
    }

    public String summarizeWallets(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.wallets().isEmpty()) {
            return "Bạn chưa có ví nào. Hãy tạo ví để mình theo dõi số dư và dòng tiền.";
        }

        String wallets = snapshot.wallets().stream()
                .map(this::formatWalletStatus)
                .collect(Collectors.joining("\n"));

        return ("Tình trạng ví hiện tại:\n" + wallets).trim();
    }

    public String summarizeBudgets(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.budgets().isEmpty()) {
            return "Bạn chưa có ngân sách nào. Nếu muốn, mình có thể giúp bạn xem nên tạo ngân sách cho nhóm chi nào trước.";
        }

        String budgets = snapshot.budgets().stream()
                .limit(5)
                .map(this::formatBudgetStatus)
                .collect(Collectors.joining("\n"));

        StringBuilder reply = new StringBuilder("Tình hình ngân sách:\n");
        reply.append(budgets);

        if (!snapshot.overBudgetItems().isEmpty()) {
            reply.append("\nCảnh báo: ")
                    .append(snapshot.overBudgetItems().size())
                    .append(" ngân sách đã vượt mức.");
        } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
            reply.append("\nCảnh báo: ")
                    .append(snapshot.nearLimitBudgetItems().size())
                    .append(" ngân sách đang trên 80%.");
        }

        return reply.toString().trim();
    }

    public String summarizeSavings(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.savings().isEmpty()) {
            return "Bạn chưa có mục tiêu tiết kiệm nào.";
        }

        String savings = snapshot.savings().stream()
                .limit(5)
                .map(this::formatSavingStatus)
                .collect(Collectors.joining("\n"));

        return ("Tiến độ tiết kiệm:\n" + savings).trim();
    }

    public String summarizeDebts(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.debts().isEmpty()) {
            return "Bạn hiện không có khoản nợ nào cần theo dõi.";
        }

        String debts = snapshot.debts().stream()
                .limit(5)
                .map(this::formatDebtStatus)
                .collect(Collectors.joining("\n"));

        return ("Tình trạng nợ hiện tại:\n" + debts).trim();
    }

    public String summarizeRecentTransactions(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.recentTransactions().isEmpty()) {
            return "Mình chưa thấy giao dịch gần đây nào để liệt kê.";
        }

        String transactions = snapshot.recentTransactions().stream()
                .limit(5)
                .map(this::formatTransactionStatus)
                .collect(Collectors.joining("\n"));

        return ("5 giao dịch gần nhất:\n" + transactions).trim();
    }

    public String detectLeak(String accountId) {
        List<Object[]> data = transactionRepository.findSmallFrequent(accountId);

        if (data.isEmpty()) {
            return "Mình chưa thấy mẫu chi tiêu nhỏ lặp lại đủ rõ để kết luận có rò rỉ tài chính.";
        }

        String leaks = data.stream()
                .limit(5)
                .map(row -> "- " + String.valueOf(row[0]) + ": " + row[1] + " lần, tổng " + formatCurrency((BigDecimal) row[2]))
                .collect(Collectors.joining("\n"));

        return ("Các khoản nhỏ lặp lại nhiều lần:\n" + leaks).trim();
    }

    private String buildWarnings(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        StringBuilder warnings = new StringBuilder();

        if (!snapshot.overBudgetItems().isEmpty()) {
            warnings.append("- ")
                    .append(snapshot.overBudgetItems().size())
                    .append(" ngân sách đã vượt mức.\n");
        } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
            warnings.append("- ")
                    .append(snapshot.nearLimitBudgetItems().size())
                    .append(" ngân sách đang ở mức trên 80%.\n");
        }

        snapshot.debts().stream()
                .filter(debt -> debt.getTargetDate() != null)
                .filter(debt -> debt.getRemainingAmount() != null && debt.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0)
                .filter(debt -> !debt.getTargetDate().isBefore(LocalDate.now()) && !debt.getTargetDate().isAfter(LocalDate.now().plusDays(7)))
                .findFirst()
                .ifPresent(debt -> warnings.append("- Khoản nợ ")
                        .append(debt.getName())
                        .append(" sắp đến hạn vào ")
                        .append(formatDate(debt.getTargetDate()))
                        .append(".\n"));

        snapshot.savings().stream()
                .filter(saving -> saving.getTargetDate() != null)
                .filter(saving -> saving.getTargetAmount() != null && saving.getTargetAmount().compareTo(BigDecimal.ZERO) > 0)
                .filter(saving -> {
                    BigDecimal current = saving.getCurrentAmount() == null ? BigDecimal.ZERO : saving.getCurrentAmount();
                    BigDecimal target = saving.getTargetAmount();
                    return current.compareTo(target) < 0 && !saving.getTargetDate().isAfter(LocalDate.now().plusDays(14));
                })
                .findFirst()
                .ifPresent(saving -> warnings.append("- Mục tiêu tiết kiệm ")
                        .append(saving.getTitle())
                        .append(" chưa đạt và gần hạn ")
                        .append(formatDate(saving.getTargetDate()))
                        .append(".\n"));

        return warnings.toString().trim();
    }

    private String formatWalletStatus(Wallet wallet) {
        if ("CREDIT".equalsIgnoreCase(wallet.getType().name())) {
            BigDecimal available = safe(wallet.getCreditLimit()).subtract(safe(wallet.getUnpaidBalance()));
            return "- " + wallet.getName()
                    + ": còn hạn mức "
                    + formatCurrency(available)
                    + ", dư nợ "
                    + formatCurrency(safe(wallet.getUnpaidBalance()));
        }

        return "- " + wallet.getName() + ": số dư " + formatCurrency(safe(wallet.getInitialBalance()));
    }

    private String formatBudgetStatus(Budget budget) {
        double progress = budget.getAmount() > 0 ? (budget.getSpent() / budget.getAmount()) * 100 : 0;
        return "- " + budget.getBudget_name()
                + ": đã dùng "
                + formatDoubleCurrency(budget.getSpent())
                + "/"
                + formatDoubleCurrency(budget.getAmount())
                + " ("
                + Math.round(progress)
                + "%)";
    }

    private String formatSavingStatus(Saving saving) {
        BigDecimal current = safe(saving.getCurrentAmount());
        BigDecimal target = safe(saving.getTargetAmount());
        long progress = target.compareTo(BigDecimal.ZERO) > 0
                ? Math.round(current.multiply(BigDecimal.valueOf(100)).divide(target, 2, RoundingMode.HALF_UP).doubleValue())
                : 0;

        String deadline = saving.getTargetDate() != null ? ", hạn " + formatDate(saving.getTargetDate()) : "";
        return "- " + saving.getTitle()
                + ": "
                + formatCurrency(current)
                + "/"
                + formatCurrency(target)
                + " ("
                + progress
                + "%)"
                + deadline;
    }

    private String formatDebtStatus(Debt debt) {
        String deadline = debt.getTargetDate() != null ? ", hạn " + formatDate(debt.getTargetDate()) : "";
        return "- " + debt.getName()
                + ": còn "
                + formatCurrency(safe(debt.getRemainingAmount()))
                + "/"
                + formatCurrency(safe(debt.getTotalAmount()))
                + deadline;
    }

    private String formatTransactionStatus(Transaction transaction) {
        String sign = transaction.getType() != null && "INCOME".equalsIgnoreCase(transaction.getType().name()) ? "+" : "-";
        String category = transaction.getCategory() != null ? transaction.getCategory().getCategoryName() : "Khác";
        String createdAt = transaction.getCreatedAt() != null
                ? transaction.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM HH:mm"))
                : "không rõ thời gian";

        return "- " + createdAt
                + ": "
                + transaction.getDescription()
                + " | "
                + category
                + " | "
                + sign
                + formatCurrency(safe(transaction.getAmount()));
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String formatCurrency(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP).toPlainString() + "đ";
    }

    private String formatDoubleCurrency(double value) {
        return BigDecimal.valueOf(value)
                .setScale(0, RoundingMode.HALF_UP)
                .toPlainString() + "đ";
    }

    private String formatSignedCurrency(BigDecimal value) {
        String sign = value.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "-";
        return sign + formatCurrency(value.abs());
    }

    private String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }
}
