package com.fintrack.backend.dto.Response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class SavingResponse {

    private String id;
    private String title;
    private String currency;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private double progress;
    private String type;
    private String category;
    private LocalDate targetDate;
    private String period;
    private String walletId;

    private List<SavingTransactionResponse> transactions;
}
