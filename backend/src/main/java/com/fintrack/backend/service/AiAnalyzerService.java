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
import java.time.temporal.ChronoUnit;
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
                    Minh chua thay du du lieu tai chinh de phan tich.
                    Hay tao vi dau tien hoac ghi vai giao dich, roi minh se tong hop cho ban.
                    """.trim();
        }

        StringBuilder reply = new StringBuilder("Tong quan tai chinh hien tai:\n");
        reply.append("- Thang nay ban thu ")
                .append(formatCurrency(snapshot.monthIncome()))
                .append(", chi ")
                .append(formatCurrency(snapshot.monthExpense()))
                .append(", chenh lech ")
                .append(formatSignedCurrency(snapshot.monthNet()))
                .append(".\n");
        reply.append("- Tien mat con ")
                .append(formatCurrency(snapshot.cashBalance()))
                .append(", han muc tin dung con ")
                .append(formatCurrency(snapshot.availableCredit()))
                .append(".\n");

        if (!snapshot.budgets().isEmpty()) {
            reply.append("- Ban co ")
                    .append(snapshot.budgets().size())
                    .append(" ngan sach dang theo doi");

            if (!snapshot.overBudgetItems().isEmpty()) {
                reply.append(", trong do ")
                        .append(snapshot.overBudgetItems().size())
                        .append(" ngan sach da vuot muc");
            } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
                reply.append(", co ")
                        .append(snapshot.nearLimitBudgetItems().size())
                        .append(" ngan sach dang gan cham tran");
            }

            reply.append(".\n");
        }

        if (!snapshot.savings().isEmpty()) {
            reply.append("- Tiet kiem hien co ")
                    .append(formatCurrency(snapshot.totalSavingCurrent()))
                    .append(" tren muc tieu ")
                    .append(formatCurrency(snapshot.totalSavingTarget()))
                    .append(".\n");
        }

        if (!snapshot.debts().isEmpty()) {
            reply.append("- No con lai ")
                    .append(formatCurrency(snapshot.totalDebtRemaining()))
                    .append(" tren ")
                    .append(snapshot.debts().size())
                    .append(" khoan.\n");
        }

        if (!snapshot.topExpenseCategories().isEmpty()) {
            reply.append("- Nhom chi nhieu nhat thang nay: ")
                    .append(snapshot.topExpenseCategories().stream()
                            .map(category -> category.categoryName() + " " + formatCurrency(category.amount()))
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        String warnings = buildWarnings(snapshot);
        if (!warnings.isBlank()) {
            reply.append("Can chu y:\n").append(warnings);
        }

        return reply.toString().trim();
    }

    public String analyzeSpending(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.monthTransactions().isEmpty()) {
            return "Thang nay ban chua co giao dich nao du de phan tich chi tieu.";
        }

        StringBuilder reply = new StringBuilder("Phan tich chi tieu thang nay:\n");
        reply.append("- Tong chi: ").append(formatCurrency(snapshot.monthExpense())).append(".\n");
        reply.append("- Tong thu: ").append(formatCurrency(snapshot.monthIncome())).append(".\n");
        reply.append("- Dong tien rong: ").append(formatSignedCurrency(snapshot.monthNet())).append(".\n");

        if (!snapshot.topExpenseCategories().isEmpty()) {
            reply.append("- Danh muc chi nhieu nhat: ")
                    .append(snapshot.topExpenseCategories().stream()
                            .map(category -> category.categoryName() + " " + formatCurrency(category.amount()))
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        if (!snapshot.overBudgetItems().isEmpty()) {
            reply.append("- Ngan sach da vuot: ")
                    .append(snapshot.overBudgetItems().stream()
                            .map(this::formatBudgetStatus)
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
            reply.append("- Ngan sach gan cham tran: ")
                    .append(snapshot.nearLimitBudgetItems().stream()
                            .map(this::formatBudgetStatus)
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        return reply.toString().trim();
    }

    public String buildSpendingPlan(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (!snapshot.hasAnyData()) {
            return """
                    Minh chua co du du lieu de len ke hoach chi tieu.
                    Hay tao vi va ghi vai khoan thu chi truoc, roi minh se de xuat muc chi tieu hop ly cho phan con lai cua thang.
                    """.trim();
        }

        LocalDate today = LocalDate.now();
        int remainingDays = Math.max(today.lengthOfMonth() - today.getDayOfMonth(), 0);
        BigDecimal reserveForSavings = calculateSavingReserve(snapshot);
        BigDecimal reserveForDebt = snapshot.totalDebtRemaining()
                .multiply(BigDecimal.valueOf(0.10))
                .setScale(0, RoundingMode.UP);
        BigDecimal protectedAmount = reserveForSavings.add(reserveForDebt);
        BigDecimal safeToSpend = snapshot.cashBalance()
                .subtract(protectedAmount)
                .max(BigDecimal.ZERO);
        BigDecimal dailyCap = remainingDays > 0
                ? safeToSpend.divide(BigDecimal.valueOf(remainingDays), 0, RoundingMode.DOWN)
                : safeToSpend;

        StringBuilder reply = new StringBuilder("Ke hoach chi tieu goi y cho phan con lai cua thang:\n");
        reply.append("- Thu thang nay: ")
                .append(formatCurrency(snapshot.monthIncome()))
                .append(", chi: ")
                .append(formatCurrency(snapshot.monthExpense()))
                .append(", dong tien rong: ")
                .append(formatSignedCurrency(snapshot.monthNet()))
                .append(".\n");
        reply.append("- Tien mat hien co: ")
                .append(formatCurrency(snapshot.cashBalance()))
                .append(", phan nen giu lai cho muc tieu va no: ")
                .append(formatCurrency(protectedAmount))
                .append(".\n");
        reply.append("- Muc chi an toan con lai: ")
                .append(formatCurrency(safeToSpend));

        if (remainingDays > 0) {
            reply.append(" cho ")
                    .append(remainingDays)
                    .append(" ngay con lai, tuong duong khoang ")
                    .append(formatCurrency(dailyCap))
                    .append("/ngay.\n");
        } else {
            reply.append(" trong phan con lai cua ky hien tai.\n");
        }

        if (!snapshot.overBudgetItems().isEmpty()) {
            reply.append("- Tam dung tang chi o cac nhom da vuot ngan sach: ")
                    .append(snapshot.overBudgetItems().stream()
                            .limit(3)
                            .map(Budget::getBudget_name)
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
            reply.append("- Giam nhip chi o cac nhom gan cham tran: ")
                    .append(snapshot.nearLimitBudgetItems().stream()
                            .limit(3)
                            .map(Budget::getBudget_name)
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        if (!snapshot.topExpenseCategories().isEmpty()) {
            reply.append("- Nhom nen cat giam truoc: ")
                    .append(snapshot.topExpenseCategories().stream()
                            .map(category -> category.categoryName() + " " + formatCurrency(category.amount()))
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        reply.append("- Goi y phan bo: ")
                .append(buildAllocationSuggestion(snapshot, safeToSpend))
                .append(".\n");
        reply.append("- Nguyen tac van hanh: ")
                .append(buildPlanRule(snapshot, dailyCap, remainingDays));

        return reply.toString().trim();
    }

    public String buildFinancialPlan(String message, AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        String normalized = normalize(message);

        if (containsAny(normalized, "thang sau", "next month")) {
            return buildNextMonthPlan(snapshot);
        }

        if (containsAny(normalized, "tra no", "ke hoach tra no", "giam no", "dong no")) {
            return buildDebtPlan(snapshot);
        }

        if (containsAny(normalized, "tiet kiem", "ke hoach tiet kiem", "muc tieu tiet kiem", "de danh", "tich luy")) {
            return buildSavingPlan(snapshot);
        }

        if (containsAny(normalized, "quy du phong", "emergency fund", "du phong")) {
            return buildEmergencyFundPlan(snapshot);
        }

        if (containsAny(normalized, "phan bo luong", "chia luong", "phan bo tien", "chia tien", "phan bo thu nhap")) {
            return buildSalaryAllocationPlan(snapshot);
        }

        if (containsAny(normalized, "ngan sach", "budget", "siet chi", "giam chi", "cat giam")) {
            return buildBudgetAdjustmentPlan(snapshot);
        }

        return buildSpendingPlan(snapshot);
    }

    private String buildNextMonthPlan(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (!snapshot.hasAnyData()) {
            return "Minh chua co du du lieu de len ke hoach tai chinh cho thang sau. Hay ghi nhan thu chi truoc da.";
        }

        LocalDate today = LocalDate.now();
        LocalDate nextMonth = today.plusMonths(1).withDayOfMonth(1);
        int elapsedDays = Math.max(today.getDayOfMonth(), 1);
        int nextMonthDays = nextMonth.lengthOfMonth();

        BigDecimal projectedIncome = snapshot.monthIncome()
                .divide(BigDecimal.valueOf(elapsedDays), 0, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(nextMonthDays));
        BigDecimal projectedExpense = snapshot.monthExpense()
                .divide(BigDecimal.valueOf(elapsedDays), 0, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(nextMonthDays));
        BigDecimal projectedNet = projectedIncome.subtract(projectedExpense);

        BigDecimal reserveForSavings = calculateSavingReserve(snapshot);
        BigDecimal reserveForDebt = snapshot.totalDebtRemaining()
                .multiply(BigDecimal.valueOf(0.10))
                .setScale(0, RoundingMode.UP);
        BigDecimal protectedAmount = reserveForSavings.add(reserveForDebt);
        BigDecimal suggestedFlexibleCap = projectedNet.subtract(protectedAmount).max(BigDecimal.ZERO);
        BigDecimal dailyCap = suggestedFlexibleCap
                .divide(BigDecimal.valueOf(nextMonthDays), 0, RoundingMode.DOWN);

        StringBuilder reply = new StringBuilder("Ke hoach tai chinh goi y cho thang ");
        reply.append(nextMonth.getMonthValue())
                .append("/")
                .append(nextMonth.getYear())
                .append(":\n");
        reply.append("- Du phong thu nhap: ")
                .append(formatCurrency(projectedIncome))
                .append(".\n");
        reply.append("- Du phong chi phi neu giu nhip hien tai: ")
                .append(formatCurrency(projectedExpense))
                .append(".\n");
        reply.append("- Dong tien rong du kien: ")
                .append(formatSignedCurrency(projectedNet))
                .append(".\n");
        reply.append("- Nen giu rieng cho muc tieu tiet kiem va no: ")
                .append(formatCurrency(protectedAmount))
                .append(".\n");
        reply.append("- Tran chi linh hoat nen giu: ")
                .append(formatCurrency(suggestedFlexibleCap))
                .append(" ca thang, tuong duong khoang ")
                .append(formatCurrency(dailyCap))
                .append("/ngay.\n");

        if (!snapshot.overBudgetItems().isEmpty()) {
            reply.append("- Sang thang sau, khong nen cap them ngan sach cho cac nhom da vuot muc tru khi cat giam tu nhom khac: ")
                    .append(snapshot.overBudgetItems().stream()
                            .limit(3)
                            .map(Budget::getBudget_name)
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        } else if (!snapshot.topExpenseCategories().isEmpty()) {
            reply.append("- Khi lap ngan sach thang sau, nen dat tran chat hon cho: ")
                    .append(snapshot.topExpenseCategories().stream()
                            .map(category -> category.categoryName())
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }

        if (snapshot.totalDebtRemaining().compareTo(BigDecimal.ZERO) > 0) {
            reply.append("- Uu tien thang sau: tra no truoc, sau do moi mo rong chi tieu linh hoat.\n");
        } else if (!snapshot.savings().isEmpty()) {
            reply.append("- Uu tien thang sau: tach tien tiet kiem ngay khi co thu nhap dau thang.\n");
        }

        reply.append("- Neu thu nhap thang sau khong chac chan, hay lap ke hoach theo 85% muc du phong thu nhap de an toan hon.");
        return reply.toString().trim();
    }

    public String summarizeWallets(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.wallets().isEmpty()) {
            return "Ban chua co vi nao. Hay tao vi de minh theo doi so du va dong tien.";
        }

        String wallets = snapshot.wallets().stream()
                .map(this::formatWalletStatus)
                .collect(Collectors.joining("\n"));

        return ("Tinh trang vi hien tai:\n" + wallets).trim();
    }

    public String summarizeBudgets(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.budgets().isEmpty()) {
            return "Ban chua co ngan sach nao. Neu muon, minh co the giup ban xem nen tao ngan sach cho nhom chi nao truoc.";
        }

        String budgets = snapshot.budgets().stream()
                .limit(5)
                .map(this::formatBudgetStatus)
                .collect(Collectors.joining("\n"));

        StringBuilder reply = new StringBuilder("Tinh hinh ngan sach:\n");
        reply.append(budgets);

        if (!snapshot.overBudgetItems().isEmpty()) {
            reply.append("\nCanh bao: ")
                    .append(snapshot.overBudgetItems().size())
                    .append(" ngan sach da vuot muc.");
        } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
            reply.append("\nCanh bao: ")
                    .append(snapshot.nearLimitBudgetItems().size())
                    .append(" ngan sach dang tren 80%.");
        }

        return reply.toString().trim();
    }

    public String summarizeSavings(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.savings().isEmpty()) {
            return "Ban chua co muc tieu tiet kiem nao.";
        }

        String savings = snapshot.savings().stream()
                .limit(5)
                .map(this::formatSavingStatus)
                .collect(Collectors.joining("\n"));

        return ("Tien do tiet kiem:\n" + savings).trim();
    }

    public String summarizeDebts(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.debts().isEmpty()) {
            return "Ban hien khong co khoan no nao can theo doi.";
        }

        String debts = snapshot.debts().stream()
                .limit(5)
                .map(this::formatDebtStatus)
                .collect(Collectors.joining("\n"));

        return ("Tinh trang no hien tai:\n" + debts).trim();
    }

    public String summarizeRecentTransactions(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.recentTransactions().isEmpty()) {
            return "Minh chua thay giao dich gan day nao de liet ke.";
        }

        String transactions = snapshot.recentTransactions().stream()
                .limit(5)
                .map(this::formatTransactionStatus)
                .collect(Collectors.joining("\n"));

        return ("5 giao dich gan nhat:\n" + transactions).trim();
    }

    public String detectLeak(String accountId) {
        List<Object[]> data = transactionRepository.findSmallFrequent(accountId);

        if (data.isEmpty()) {
            return "Minh chua thay mau chi tieu nho lap lai du ro de ket luan co ro ri tai chinh.";
        }

        String leaks = data.stream()
                .limit(5)
                .map(row -> "- " + String.valueOf(row[0]) + ": " + row[1] + " lan, tong " + formatCurrency((BigDecimal) row[2]))
                .collect(Collectors.joining("\n"));

        return ("Cac khoan nho lap lai nhieu lan:\n" + leaks).trim();
    }

    private String buildWarnings(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        StringBuilder warnings = new StringBuilder();

        if (!snapshot.overBudgetItems().isEmpty()) {
            warnings.append("- ")
                    .append(snapshot.overBudgetItems().size())
                    .append(" ngan sach da vuot muc.\n");
        } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
            warnings.append("- ")
                    .append(snapshot.nearLimitBudgetItems().size())
                    .append(" ngan sach dang o muc tren 80%.\n");
        }

        snapshot.debts().stream()
                .filter(debt -> debt.getTargetDate() != null)
                .filter(debt -> safe(debt.getRemainingAmount()).compareTo(BigDecimal.ZERO) > 0)
                .filter(debt -> !debt.getTargetDate().isBefore(LocalDate.now()) && !debt.getTargetDate().isAfter(LocalDate.now().plusDays(7)))
                .findFirst()
                .ifPresent(debt -> warnings.append("- Khoan no ")
                        .append(debt.getName())
                        .append(" sap den han vao ")
                        .append(formatDate(debt.getTargetDate()))
                        .append(".\n"));

        snapshot.savings().stream()
                .filter(saving -> saving.getTargetDate() != null)
                .filter(saving -> safe(saving.getTargetAmount()).compareTo(BigDecimal.ZERO) > 0)
                .filter(saving -> {
                    BigDecimal current = safe(saving.getCurrentAmount());
                    BigDecimal target = safe(saving.getTargetAmount());
                    return current.compareTo(target) < 0 && !saving.getTargetDate().isAfter(LocalDate.now().plusDays(14));
                })
                .findFirst()
                .ifPresent(saving -> warnings.append("- Muc tieu tiet kiem ")
                        .append(saving.getTitle())
                        .append(" chua dat va gan han ")
                        .append(formatDate(saving.getTargetDate()))
                        .append(".\n"));

        return warnings.toString().trim();
    }

    private String buildDebtPlan(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.totalDebtRemaining().compareTo(BigDecimal.ZERO) <= 0) {
            return "Ban hien khong co khoan no nao can lap ke hoach tra. Neu muon, minh co the goi y ke hoach tiet kiem hoac chi tieu.";
        }

        BigDecimal monthlyCapacity = estimateMonthlyFreeCash(snapshot);
        BigDecimal suggestedDebtPayment = monthlyCapacity.multiply(BigDecimal.valueOf(0.6)).setScale(0, RoundingMode.DOWN);
        if (suggestedDebtPayment.compareTo(BigDecimal.ZERO) <= 0) {
            suggestedDebtPayment = snapshot.cashBalance().multiply(BigDecimal.valueOf(0.2)).setScale(0, RoundingMode.DOWN);
        }

        String urgentDebts = snapshot.debts().stream()
                .filter(debt -> debt.getTargetDate() != null)
                .sorted((left, right) -> left.getTargetDate().compareTo(right.getTargetDate()))
                .limit(3)
                .map(debt -> debt.getName() + " " + formatCurrency(safe(debt.getRemainingAmount())))
                .collect(Collectors.joining(", "));

        StringBuilder reply = new StringBuilder("Ke hoach tra no goi y:\n");
        reply.append("- Tong no con lai: ").append(formatCurrency(snapshot.totalDebtRemaining())).append(".\n");
        reply.append("- Khoan uu tien tra moi thang nen quanh: ").append(formatCurrency(suggestedDebtPayment)).append(".\n");
        if (!urgentDebts.isBlank()) {
            reply.append("- Uu tien truoc: ").append(urgentDebts).append(".\n");
        }
        reply.append("- Thu tu hanh dong: tra khoan den han som, sau do don them vao khoan no co so du lon nhat hoac ap luc cao nhat.\n");
        reply.append("- Trong thoi gian tra no, giam chi linh hoat va han che tang them du no the tin dung.");
        return reply.toString().trim();
    }

    private String buildSavingPlan(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.savings().isEmpty()) {
            BigDecimal monthlyCapacity = estimateMonthlyFreeCash(snapshot);
            BigDecimal suggestedSaving = monthlyCapacity.multiply(BigDecimal.valueOf(0.2)).setScale(0, RoundingMode.DOWN);
            return ("Ke hoach tiet kiem goi y:\n"
                    + "- Ban chua co muc tieu tiet kiem cu the.\n"
                    + "- Co the bat dau bang cach khoa " + formatCurrency(suggestedSaving.max(BigDecimal.ZERO)) + "/thang cho mot muc tieu ngan han.\n"
                    + "- Uu tien tao quy du phong truoc, sau do moi tach muc tieu mua sam hay dau tu.").trim();
        }

        BigDecimal reserveForSavings = calculateSavingReserve(snapshot);
        String nearGoals = snapshot.savings().stream()
                .limit(3)
                .map(saving -> saving.getTitle() + " thieu "
                        + formatCurrency(safe(saving.getTargetAmount()).subtract(safe(saving.getCurrentAmount())).max(BigDecimal.ZERO)))
                .collect(Collectors.joining(", "));

        StringBuilder reply = new StringBuilder("Ke hoach tiet kiem goi y:\n");
        reply.append("- Tong muc tieu tiet kiem: ").append(formatCurrency(snapshot.totalSavingTarget())).append(".\n");
        reply.append("- Da co: ").append(formatCurrency(snapshot.totalSavingCurrent())).append(".\n");
        reply.append("- Muc can bo sung uu tien trong 30 ngay toi: ").append(formatCurrency(reserveForSavings)).append(".\n");
        if (!nearGoals.isBlank()) {
            reply.append("- Muc tieu can uu tien: ").append(nearGoals).append(".\n");
        }
        reply.append("- Goi y: tach tien tiet kiem ngay khi co thu nhap, khong de den cuoi thang moi de danh.");
        return reply.toString().trim();
    }

    private String buildEmergencyFundPlan(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        BigDecimal baselineMonthlyExpense = snapshot.monthExpense().max(BigDecimal.ZERO);
        BigDecimal targetEmergencyFund = baselineMonthlyExpense.multiply(BigDecimal.valueOf(3));
        BigDecimal currentCash = snapshot.cashBalance().max(BigDecimal.ZERO);
        BigDecimal missing = targetEmergencyFund.subtract(currentCash).max(BigDecimal.ZERO);
        BigDecimal monthlyCapacity = estimateMonthlyFreeCash(snapshot);
        BigDecimal suggestedContribution = monthlyCapacity.multiply(BigDecimal.valueOf(0.25)).setScale(0, RoundingMode.DOWN);

        StringBuilder reply = new StringBuilder("Ke hoach quy du phong goi y:\n");
        reply.append("- Muc chi thang hien tai: ").append(formatCurrency(baselineMonthlyExpense)).append(".\n");
        reply.append("- Quy du phong muc tieu 3 thang: ").append(formatCurrency(targetEmergencyFund)).append(".\n");
        reply.append("- Tien mat hien co: ").append(formatCurrency(currentCash)).append(".\n");
        reply.append("- Phan con thieu: ").append(formatCurrency(missing)).append(".\n");
        reply.append("- Goi y trich deu: ").append(formatCurrency(suggestedContribution.max(BigDecimal.ZERO))).append("/thang cho quy du phong truoc cac muc tieu tuy y.");
        return reply.toString().trim();
    }

    private String buildSalaryAllocationPlan(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        BigDecimal monthlyIncome = snapshot.monthIncome().max(BigDecimal.ZERO);
        if (monthlyIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return "Minh chua thay thu nhap thang nay de goi y phan bo luong. Hay ghi nhan luong hoac cac khoan thu truoc.";
        }

        BigDecimal essential = monthlyIncome.multiply(BigDecimal.valueOf(0.50)).setScale(0, RoundingMode.DOWN);
        BigDecimal goals = monthlyIncome.multiply(BigDecimal.valueOf(snapshot.totalDebtRemaining().compareTo(BigDecimal.ZERO) > 0 ? 0.30 : 0.25)).setScale(0, RoundingMode.DOWN);
        BigDecimal flexible = monthlyIncome.subtract(essential).subtract(goals).max(BigDecimal.ZERO);

        StringBuilder reply = new StringBuilder("Ke hoach phan bo thu nhap goi y:\n");
        reply.append("- Thu nhap thang nay: ").append(formatCurrency(monthlyIncome)).append(".\n");
        reply.append("- Nhu cau thiet yeu: ").append(formatCurrency(essential)).append(".\n");
        reply.append("- Muc tieu tai chinh");
        if (snapshot.totalDebtRemaining().compareTo(BigDecimal.ZERO) > 0) {
            reply.append(" (uu tien no va tiet kiem)");
        }
        reply.append(": ").append(formatCurrency(goals)).append(".\n");
        reply.append("- Chi tieu linh hoat: ").append(formatCurrency(flexible)).append(".\n");
        reply.append("- Neu luong ve theo dot, hay khoa ngay phan muc tieu tai chinh truoc khi chi tieu hang ngay.");
        return reply.toString().trim();
    }

    private String buildBudgetAdjustmentPlan(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        StringBuilder reply = new StringBuilder("Ke hoach dieu chinh ngan sach goi y:\n");
        if (snapshot.budgets().isEmpty()) {
            reply.append("- Ban chua co ngan sach nao. Nen tao ngan sach cho 3 nhom dau tien: an uong, di chuyen, chi tieu linh hoat.\n");
        } else {
            reply.append("- So ngan sach dang theo doi: ").append(snapshot.budgets().size()).append(".\n");
            if (!snapshot.overBudgetItems().isEmpty()) {
                reply.append("- Nhom can khoa ngay: ")
                        .append(snapshot.overBudgetItems().stream().limit(3).map(Budget::getBudget_name).collect(Collectors.joining(", ")))
                        .append(".\n");
            } else if (!snapshot.nearLimitBudgetItems().isEmpty()) {
                reply.append("- Nhom can giam toc: ")
                        .append(snapshot.nearLimitBudgetItems().stream().limit(3).map(Budget::getBudget_name).collect(Collectors.joining(", ")))
                        .append(".\n");
            }
        }

        if (!snapshot.topExpenseCategories().isEmpty()) {
            reply.append("- Cat truoc o cac nhom chi lon: ")
                    .append(snapshot.topExpenseCategories().stream()
                            .map(category -> category.categoryName() + " " + formatCurrency(category.amount()))
                            .collect(Collectors.joining(", ")))
                    .append(".\n");
        }
        reply.append("- Quy tac: ngan sach co dinh cho nhu cau bat buoc, ngan sach mem cho chi linh hoat, va phai xem lai moi tuan.");
        return reply.toString().trim();
    }

    private BigDecimal calculateSavingReserve(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        return snapshot.savings().stream()
                .filter(saving -> saving.getTargetDate() != null)
                .filter(saving -> safe(saving.getTargetAmount()).compareTo(BigDecimal.ZERO) > 0)
                .filter(saving -> safe(saving.getCurrentAmount()).compareTo(safe(saving.getTargetAmount())) < 0)
                .filter(saving -> !saving.getTargetDate().isBefore(LocalDate.now()))
                .filter(saving -> !saving.getTargetDate().isAfter(LocalDate.now().plusDays(30)))
                .map(saving -> safe(saving.getTargetAmount()).subtract(safe(saving.getCurrentAmount())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String buildAllocationSuggestion(AiFinanceSnapshotService.FinanceSnapshot snapshot,
                                             BigDecimal safeToSpend) {
        if (safeToSpend.compareTo(BigDecimal.ZERO) <= 0) {
            return "tam dung chi tieu khong thiet yeu, chi giu cac khoan bat buoc";
        }

        if (!snapshot.overBudgetItems().isEmpty()) {
            return "70% nhu cau thiet yeu, 20% khoan da cam ket, 10% du phong";
        }

        if (snapshot.monthNet().compareTo(BigDecimal.ZERO) < 0) {
            return "60% nhu cau thiet yeu, 25% muc tieu tai chinh va no, 15% linh hoat";
        }

        return "50% nhu cau thiet yeu, 30% muc tieu tai chinh, 20% linh hoat";
    }

    private BigDecimal estimateMonthlyFreeCash(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        BigDecimal baselineIncome = snapshot.monthIncome().max(BigDecimal.ZERO);
        BigDecimal baselineExpense = snapshot.monthExpense().max(BigDecimal.ZERO);
        BigDecimal baselineNet = baselineIncome.subtract(baselineExpense);

        if (baselineNet.compareTo(BigDecimal.ZERO) > 0) {
            return baselineNet;
        }

        return snapshot.cashBalance()
                .multiply(BigDecimal.valueOf(0.15))
                .setScale(0, RoundingMode.DOWN)
                .max(BigDecimal.ZERO);
    }

    private String buildPlanRule(AiFinanceSnapshotService.FinanceSnapshot snapshot,
                                 BigDecimal dailyCap,
                                 int remainingDays) {
        if (remainingDays == 0) {
            return "khong mo them khoan chi lon neu khong that su can thiet";
        }

        if (!snapshot.overBudgetItems().isEmpty()) {
            return "giu tran chi quanh " + formatCurrency(dailyCap) + "/ngay va tranh cac nhom da vuot ngan sach";
        }

        if (snapshot.totalDebtRemaining().compareTo(BigDecimal.ZERO) > 0) {
            return "giu tran chi quanh " + formatCurrency(dailyCap) + "/ngay va uu tien tien con lai cho tra no";
        }

        return "giu tran chi quanh " + formatCurrency(dailyCap) + "/ngay va ra soat lai sau moi 3-5 ngay";
    }

    private String formatWalletStatus(Wallet wallet) {
        if ("CREDIT".equalsIgnoreCase(wallet.getType().name())) {
            BigDecimal available = safe(wallet.getCreditLimit()).subtract(safe(wallet.getUnpaidBalance()));
            return "- " + wallet.getName()
                    + ": con han muc "
                    + formatCurrency(available)
                    + ", du no "
                    + formatCurrency(safe(wallet.getUnpaidBalance()));
        }

        return "- " + wallet.getName() + ": so du " + formatCurrency(safe(wallet.getInitialBalance()));
    }

    private String formatBudgetStatus(Budget budget) {
        double progress = budget.getAmount() > 0 ? (budget.getSpent() / budget.getAmount()) * 100 : 0;
        return "- " + budget.getBudget_name()
                + ": da dung "
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

        String deadline = saving.getTargetDate() != null ? ", han " + formatDate(saving.getTargetDate()) : "";
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
        String deadline = debt.getTargetDate() != null ? ", han " + formatDate(debt.getTargetDate()) : "";
        return "- " + debt.getName()
                + ": con "
                + formatCurrency(safe(debt.getRemainingAmount()))
                + "/"
                + formatCurrency(safe(debt.getTotalAmount()))
                + deadline;
    }

    private String formatTransactionStatus(Transaction transaction) {
        String sign = transaction.getType() != null && "INCOME".equalsIgnoreCase(transaction.getType().name()) ? "+" : "-";
        String category = transaction.getCategory() != null ? transaction.getCategory().getCategoryName() : "Khac";
        String createdAt = transaction.getCreatedAt() != null
                ? transaction.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM HH:mm"))
                : "khong ro thoi gian";

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
        return value.setScale(0, RoundingMode.HALF_UP).toPlainString() + "d";
    }

    private String formatDoubleCurrency(double value) {
        return BigDecimal.valueOf(value)
                .setScale(0, RoundingMode.HALF_UP)
                .toPlainString() + "d";
    }

    private String formatSignedCurrency(BigDecimal value) {
        String sign = value.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "-";
        return sign + formatCurrency(value.abs());
    }

    private String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private boolean containsAny(String normalizedMessage, String... keywords) {
        for (String keyword : keywords) {
            if (normalizedMessage.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String input) {
        if (input == null) {
            return "";
        }

        return java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replace('đ', 'd')
                .trim();
    }
}
