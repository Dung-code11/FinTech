package com.fintrack.backend.dto.response;

import com.fintrack.backend.dto.Response.CategoryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class BudgetResponse {

    private String id;
    private String budget_name;
    private String type;

    private double amount;
    private double spent;
    private double progress;

    private LocalDate startDate;
    private LocalDate endDate;

    private String period;

    private String walletId;

    private List<CategoryResponse> categories;
}