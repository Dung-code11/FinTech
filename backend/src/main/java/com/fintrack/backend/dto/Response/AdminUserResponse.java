package com.fintrack.backend.dto.Response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AdminUserResponse {
    private String id;
    private String username;
    private String fullname;
    private String email;
    private String phone;
    private String role;
    private Boolean isActived;
    private LocalDate birthday;
    private String sex;
    private String address;
    private LocalDateTime joinedAt;

    // Thống kê
    private int walletCount;
    private int transactionCount;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
}
