package com.fintrack.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SavingRequest {

    private String title;
    private String currency;
    private BigDecimal targetAmount;

    private String type; // GOAL / PERIODIC
    private String category;

    private LocalDate targetDate;
    private String period; // WEEKLY / MONTHLY / YEARLY
}
