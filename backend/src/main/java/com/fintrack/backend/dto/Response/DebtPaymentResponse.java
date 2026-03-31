package com.fintrack.backend.dto.Response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DebtPaymentResponse {

    private Long id;

    private String title;

    private BigDecimal amount;

    private LocalDateTime paymentDate;

    private String walletId;

    private Long debtId;
}
