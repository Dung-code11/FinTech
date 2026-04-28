package com.fintrack.backend.dto.Response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SavingTransactionResponse {

    private Long id;
    private String note;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String walletId;
}
