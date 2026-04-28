package com.fintrack.backend.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
public class AiPredictService {

    public String predict(AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        if (snapshot.monthIncome().compareTo(BigDecimal.ZERO) == 0
                && snapshot.monthExpense().compareTo(BigDecimal.ZERO) == 0) {
            return "Chưa đủ dữ liệu giao dịch trong tháng này để dự đoán cuối tháng.";
        }

        int day = LocalDate.now().getDayOfMonth();
        int totalDay = LocalDate.now().lengthOfMonth();
        int remain = Math.max(totalDay - day, 0);

        BigDecimal averageIncomePerDay = snapshot.monthIncome()
                .divide(BigDecimal.valueOf(day), 2, RoundingMode.HALF_UP);
        BigDecimal averageExpensePerDay = snapshot.monthExpense()
                .divide(BigDecimal.valueOf(day), 2, RoundingMode.HALF_UP);
        BigDecimal expectedNetPerDay = averageIncomePerDay.subtract(averageExpensePerDay);
        BigDecimal projectedMonthNet = expectedNetPerDay.multiply(BigDecimal.valueOf(totalDay));
        BigDecimal projectedCashAtMonthEnd = snapshot.cashBalance()
                .add(expectedNetPerDay.multiply(BigDecimal.valueOf(remain)));

        StringBuilder reply = new StringBuilder("Dự báo đến cuối tháng:\n");
        reply.append("- Thu trung bình/ngày: ")
                .append(formatCurrency(averageIncomePerDay))
                .append(".\n");
        reply.append("- Chi trung bình/ngày: ")
                .append(formatCurrency(averageExpensePerDay))
                .append(".\n");
        reply.append("- Nếu giữ nhịp hiện tại, dòng tiền ròng cả tháng khoảng ")
                .append(formatSignedCurrency(projectedMonthNet))
                .append(".\n");
        reply.append("- Tiền mặt cuối tháng ước còn ")
                .append(formatCurrency(projectedCashAtMonthEnd))
                .append(".");

        if (!snapshot.overBudgetItems().isEmpty()) {
            reply.append("\nLưu ý: bạn đang có ngân sách đã vượt mức, nên dự báo này đang chịu áp lực tăng chi.");
        }

        return reply.toString().trim();
    }

    private String formatCurrency(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP).toPlainString() + "đ";
    }

    private String formatSignedCurrency(BigDecimal value) {
        String sign = value.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "-";
        return sign + formatCurrency(value.abs());
    }
}
