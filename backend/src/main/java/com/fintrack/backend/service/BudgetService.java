package com.fintrack.backend.service;


import com.fintrack.backend.dto.BudgetRequest;
import com.fintrack.backend.enums.*;
import com.fintrack.backend.model.*;
import com.fintrack.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public Budget createBudget(String walletId, BudgetRequest request) {

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        List<Category> categories = categoryRepository
                .findAllById(request.getCategoryIds());

        Budget budget = Budget.builder()
                .budget_name(request.getBudget_name())
                .type(BudgetType.valueOf(request.getType()))
                .amount(request.getAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .period(BudgetPeriod.valueOf(request.getPeriod()))
                .wallet(wallet)
                .categories(categories)
                .build();

        return budgetRepository.save(budget);
    }
    // Lấy 1 budget
    public Budget getBudgetById(String id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
    }

    // Update
    public Budget updateBudget(String id, BudgetRequest request) {

        Budget budget = getBudgetById(id);

        List<Category> categories = categoryRepository
                .findAllById(request.getCategoryIds());

        budget.setBudget_name(request.getBudget_name());
        budget.setType(BudgetType.valueOf(request.getType()));
        budget.setAmount(request.getAmount());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setPeriod(BudgetPeriod.valueOf(request.getPeriod()));
        budget.setCategories(categories);

        return budgetRepository.save(budget);
    }

    // Delete
    public void deleteBudget(String id) {
        budgetRepository.deleteById(id);
    }

    // =========================
    // 🚀 OPTIMIZED METHOD
    // =========================
    public List<Budget> getBudgetsByWallet(String walletId) {

        List<Budget> budgets = budgetRepository.findByWallet_Id(walletId);

        for (Budget b : budgets) {
            double spent = calculateSpentOptimized(b);
            b.setSpent(spent);
        }

        return budgets;
    }

    private double calculateSpentOptimized(Budget budget) {

        LocalDateTime start = budget.getStartDate().atStartOfDay();
        LocalDateTime end = budget.getEndDate().atTime(23, 59, 59);

        TransactionType type = TransactionType.valueOf(budget.getType().name());

        BigDecimal result;

        // Nếu có category → filter theo category
        if (budget.getCategories() != null && !budget.getCategories().isEmpty()) {

            List<String> categoryIds = budget.getCategories()
                    .stream()
                    .map(Category::getId)
                    .toList();

            result = transactionRepository.sumByWalletTypeCategoryAndDate(
                    budget.getWallet().getId(),
                    type,
                    categoryIds,
                    start,
                    end
            );

        } else {
            // Không có category → lấy toàn bộ
            result = transactionRepository.sumByWalletAndTypeAndDate(
                    budget.getWallet().getId(),
                    type,
                    start,
                    end
            );
        }

        return result.doubleValue();
    }
}