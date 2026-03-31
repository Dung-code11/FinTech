package com.fintrack.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BudgetRequest {

    private String budget_name;

    // EXPENSE / INCOME
    private String type;

    private double amount;

    private LocalDate startDate;
    private LocalDate endDate;

    // DAILY / WEEKLY / MONTHLY
    private String period;

    // danh sách category id
    private List<String> categoryIds;
}