package com.fintrack.backend.mapper;

import com.fintrack.backend.dto.Response.CategoryResponse;
import com.fintrack.backend.dto.response.BudgetResponse;
import com.fintrack.backend.model.Budget;

import java.util.stream.Collectors;

public class BudgetMapper {

    public static BudgetResponse toDTO(Budget budget) {

        double progress = 0;
        if (budget.getAmount() > 0) {
            progress = (budget.getSpent() / budget.getAmount()) * 100;
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .budget_name(budget.getBudget_name())
                .type(budget.getType().name())
                .amount(budget.getAmount())
                .spent(budget.getSpent())
                .progress(progress)
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .period(budget.getPeriod().name())
                .walletId(budget.getWallet().getId())
                .categories(
                        budget.getCategories().stream()
                                .map(c -> CategoryResponse.builder()
                                        .id(c.getId())
                                        .name(c.getCategoryName())
                                        .build())
                                .collect(Collectors.toList())
                )
                .build();
    }
}