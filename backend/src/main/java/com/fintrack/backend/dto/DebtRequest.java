package com.fintrack.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DebtRequest {

    private String name;

    private String currency;

    private BigDecimal totalAmount;

    private LocalDate targetDate;

    private String Note;

    private String walletId; // 🔥 chỉ cần ID thôi

}