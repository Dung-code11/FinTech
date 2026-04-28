package com.fintrack.backend.dto.Response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalAdmins;
    private long totalWallets;
    private long totalTransactions;
    private long totalDebts;
    private long totalSavings;
    private BigDecimal totalRevenue;       // tổng INCOME toàn hệ thống
    private BigDecimal totalExpense;       // tổng EXPENSE toàn hệ thống
    private BigDecimal avgTransaction;     // giá trị TB giao dịch
}
