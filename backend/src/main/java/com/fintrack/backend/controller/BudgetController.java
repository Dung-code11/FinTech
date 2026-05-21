package com.fintrack.backend.controller;

import com.fintrack.backend.dto.BudgetRequest;

import com.fintrack.backend.dto.response.BudgetResponse;
import com.fintrack.backend.mapper.BudgetMapper;
import com.fintrack.backend.model.Budget;
import com.fintrack.backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/budgets", "/budgets"})
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping("/{walletId}")
    public BudgetResponse createBudget(
            @PathVariable String walletId,
            @RequestBody BudgetRequest request
    ) {
        Budget budget = budgetService.createBudget(walletId, request);
        return BudgetMapper.toDTO(budget);
    }

    @GetMapping("/{walletId}")
    public List<BudgetResponse> getBudgetsByWallet(
            @PathVariable String walletId
    ) {
        return budgetService.getBudgetsByWallet(walletId)
                .stream()
                .map(BudgetMapper::toDTO)
                .toList();
    }

    @GetMapping("/detail/{budgetId}")
    public BudgetResponse getBudgetDetail(
            @PathVariable String budgetId
    ) {
        Budget budget = budgetService.getBudgetById(budgetId);
        return BudgetMapper.toDTO(budget);
    }

    @PutMapping("/{budgetId}")
    public BudgetResponse updateBudget(
            @PathVariable String budgetId,
            @RequestBody BudgetRequest request
    ) {
        Budget updated = budgetService.updateBudget(budgetId, request);
        return BudgetMapper.toDTO(updated);
    }

    @DeleteMapping("/{budgetId}")
    public String deleteBudget(
            @PathVariable String budgetId
    ) {
        budgetService.deleteBudget(budgetId);
        return "Delete success";
    }
}
