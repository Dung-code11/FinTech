package com.fintrack.backend.service;

import com.fintrack.backend.model.Budget;
import com.fintrack.backend.model.Debt;
import com.fintrack.backend.model.Saving;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.DebtRepository;
import com.fintrack.backend.repository.SavingRepository;
import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiFinanceSnapshotService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final DebtRepository debtRepository;
    private final SavingRepository savingRepository;
    private final BudgetService budgetService;

    public FinanceSnapshot buildSnapshot(String accountId) {
        List<Wallet> wallets = walletRepository.findByAccount_Id(accountId);

        List<Budget> budgets = wallets.stream()
                .flatMap(wallet -> budgetService.getBudgetsByWallet(wallet.getId()).stream())
                .sorted(Comparator.comparing(Budget::getEndDate, Comparator.nullsLast(LocalDate::compareTo)))
                .toList();

        List<Debt> debts = debtRepository.findByWallet_Account_Id(accountId)
                .stream()
                .sorted(Comparator.comparing(Debt::getTargetDate, Comparator.nullsLast(LocalDate::compareTo)))
                .toList();

        List<Saving> savings = savingRepository.findByWallet_Account_Id(accountId)
                .stream()
                .sorted(Comparator.comparing(Saving::getTargetDate, Comparator.nullsLast(LocalDate::compareTo)))
                .toList();

        LocalDate today = LocalDate.now();
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthEnd = today.withDayOfMonth(today.lengthOfMonth()).atTime(23, 59, 59);

        List<Transaction> monthTransactions = transactionRepository
                .findByWallet_Account_IdAndCreatedAtBetween(accountId, monthStart, monthEnd);

        List<Transaction> recentTransactions = transactionRepository
                .findTop12ByWallet_Account_IdOrderByCreatedAtDesc(accountId);

        BigDecimal cashBalance = wallets.stream()
                .filter(wallet -> "CASH".equalsIgnoreCase(wallet.getType().name()))
                .map(wallet -> safeAmount(wallet.getInitialBalance()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal availableCredit = wallets.stream()
                .filter(wallet -> "CREDIT".equalsIgnoreCase(wallet.getType().name()))
                .map(wallet -> safeAmount(wallet.getCreditLimit()).subtract(safeAmount(wallet.getUnpaidBalance())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingCardBalance = wallets.stream()
                .filter(wallet -> "CREDIT".equalsIgnoreCase(wallet.getType().name()))
                .map(wallet -> safeAmount(wallet.getUnpaidBalance()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthIncome = sumTransactionsByType(monthTransactions, "INCOME");
        BigDecimal monthExpense = sumTransactionsByType(monthTransactions, "EXPENSE");
        BigDecimal monthNet = monthIncome.subtract(monthExpense);

        BigDecimal totalDebtRemaining = debts.stream()
                .map(debt -> safeAmount(debt.getRemainingAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSavingCurrent = savings.stream()
                .map(saving -> safeAmount(saving.getCurrentAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSavingTarget = savings.stream()
                .map(saving -> safeAmount(saving.getTargetAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Budget> overBudgetItems = budgets.stream()
                .filter(budget -> budget.getAmount() > 0 && budget.getSpent() > budget.getAmount())
                .toList();

        List<Budget> nearLimitBudgetItems = budgets.stream()
                .filter(budget -> budget.getAmount() > 0)
                .filter(budget -> {
                    double progress = (budget.getSpent() / budget.getAmount()) * 100;
                    return progress >= 80 && progress <= 100;
                })
                .toList();

        List<CategorySpend> topExpenseCategories = monthTransactions.stream()
                .filter(transaction -> transaction.getType() != null && "EXPENSE".equalsIgnoreCase(transaction.getType().name()))
                .collect(Collectors.groupingBy(
                        transaction -> transaction.getCategory() != null
                                ? transaction.getCategory().getCategoryName()
                                : "Khác",
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                transaction -> safeAmount(transaction.getAmount()),
                                BigDecimal::add
                        )
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(3)
                .map(entry -> new CategorySpend(entry.getKey(), entry.getValue()))
                .toList();

        return new FinanceSnapshot(
                wallets,
                budgets,
                debts,
                savings,
                monthTransactions,
                recentTransactions,
                overBudgetItems,
                nearLimitBudgetItems,
                topExpenseCategories,
                cashBalance,
                availableCredit,
                outstandingCardBalance,
                monthIncome,
                monthExpense,
                monthNet,
                totalDebtRemaining,
                totalSavingCurrent,
                totalSavingTarget
        );
    }

    private BigDecimal sumTransactionsByType(List<Transaction> transactions, String type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() != null && type.equalsIgnoreCase(transaction.getType().name()))
                .map(transaction -> safeAmount(transaction.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal safeAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    public record CategorySpend(String categoryName, BigDecimal amount) {
    }

    public record FinanceSnapshot(
            List<Wallet> wallets,
            List<Budget> budgets,
            List<Debt> debts,
            List<Saving> savings,
            List<Transaction> monthTransactions,
            List<Transaction> recentTransactions,
            List<Budget> overBudgetItems,
            List<Budget> nearLimitBudgetItems,
            List<CategorySpend> topExpenseCategories,
            BigDecimal cashBalance,
            BigDecimal availableCredit,
            BigDecimal outstandingCardBalance,
            BigDecimal monthIncome,
            BigDecimal monthExpense,
            BigDecimal monthNet,
            BigDecimal totalDebtRemaining,
            BigDecimal totalSavingCurrent,
            BigDecimal totalSavingTarget
    ) {
        public boolean hasAnyData() {
            return List.of(wallets, budgets, debts, savings, recentTransactions)
                    .stream()
                    .filter(Objects::nonNull)
                    .anyMatch(list -> !list.isEmpty());
        }
    }
}
