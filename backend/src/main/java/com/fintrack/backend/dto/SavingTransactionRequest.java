package com.fintrack.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SavingTransactionRequest {

    private String note;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String walletId;
}
