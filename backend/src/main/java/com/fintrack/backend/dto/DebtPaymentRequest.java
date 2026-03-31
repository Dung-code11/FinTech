package com.fintrack.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DebtPaymentRequest {

    private String title;

    private BigDecimal amount;

    private String walletId; // 🔥 UUID
}