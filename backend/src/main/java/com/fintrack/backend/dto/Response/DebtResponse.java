package com.fintrack.backend.dto.Response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DebtResponse {
    private Long id;
    private String name;
    private String currency;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private LocalDateTime createdDate;
    private LocalDate targetDate;
    private String Note;
    private String walletId;
}