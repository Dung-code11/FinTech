package com.fintrack.backend.service;

import com.fintrack.backend.dto.Response.AdminStatsResponse;
import com.fintrack.backend.dto.Response.AdminTransactionResponse;
import com.fintrack.backend.dto.Response.AdminUserResponse;
import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private InfoUserRepository infoUserRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private SavingRepository savingRepository;

    /**
     * Lấy danh sách tất cả user (không phân trang)
     */
    public List<AdminUserResponse> getAllUsers() {
        List<Account> accounts = accountRepository.findAll();

        return accounts.stream().map(acc -> {
            AdminUserResponse.AdminUserResponseBuilder builder = AdminUserResponse.builder()
                    .id(acc.getId())
                    .username(acc.getUsername())
                    .role(acc.getRole().name())
                    .isActived(acc.getIsActived())
                    .walletCount(acc.getWallets() != null ? acc.getWallets().size() : 0);

            // Lấy InfoUser nếu có
            if (acc.getInfoUser() != null) {
                builder.fullname(acc.getInfoUser().getFullname())
                        .email(acc.getInfoUser().getEmail())
                        .phone(acc.getInfoUser().getPhone())
                        .birthday(acc.getInfoUser().getBirthday())
                        .sex(acc.getInfoUser().getSex() != null ? acc.getInfoUser().getSex().name() : null)
                        .address(acc.getInfoUser().getAddress())
                        .joinedAt(null); // Account không có createdAt field
            }

            // Tính transaction count
            List<Transaction> transactions = transactionRepository.findByWallet_Account_Id(acc.getId());
            builder.transactionCount(transactions.size());

            // Tính tổng income/expense
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            for (Transaction t : transactions) {
                if (t.getType() == TransactionType.INCOME) {
                    totalIncome = totalIncome.add(t.getAmount());
                } else if (t.getType() == TransactionType.EXPENSE) {
                    totalExpense = totalExpense.add(t.getAmount());
                }
            }
            builder.totalIncome(totalIncome);
            builder.totalExpense(totalExpense);

            return builder.build();
        }).collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết 1 user
     */
    public AdminUserResponse getUserById(String accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        List<Transaction> transactions = transactionRepository.findByWallet_Account_Id(accountId);

        AdminUserResponse.AdminUserResponseBuilder builder = AdminUserResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .role(account.getRole().name())
                .isActived(account.getIsActived())
                .walletCount(account.getWallets() != null ? account.getWallets().size() : 0)
                .transactionCount(transactions.size());

        if (account.getInfoUser() != null) {
            builder.fullname(account.getInfoUser().getFullname())
                    .email(account.getInfoUser().getEmail())
                    .phone(account.getInfoUser().getPhone())
                    .birthday(account.getInfoUser().getBirthday())
                    .sex(account.getInfoUser().getSex() != null ? account.getInfoUser().getSex().name() : null)
                    .address(account.getInfoUser().getAddress());
        }

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(t.getAmount());
            }
        }
        builder.totalIncome(totalIncome);
        builder.totalExpense(totalExpense);

        return builder.build();
    }

    /**
     * Toggle account status (lock/unlock)
     */
    public void toggleAccountStatus(String accountId, boolean active) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setIsActived(active);
        accountRepository.save(account);
    }

    /**
     * Update user role (USER <-> ADMIN)
     */
    public void updateUserRole(String accountId, String role) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        try {
            account.setRole(com.fintrack.backend.enums.Role.valueOf(role.toUpperCase()));
            accountRepository.save(account);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    /**
     * Lấy tất cả transactions toàn hệ thống
     */
    public List<AdminTransactionResponse> getAllTransactions() {
        List<Transaction> transactions = transactionRepository.findAll();

        return transactions.stream().map(t -> AdminTransactionResponse.builder()
                .id(t.getId())
                .type(t.getType().name())
                .amount(t.getAmount())
                .description(t.getDescription())
                .categoryName(t.getCategory() != null ? t.getCategory().getCategoryName() : null)
                .createdAt(t.getCreatedAt())
                .username(t.getWallet() != null && t.getWallet().getAccount() != null
                        ? t.getWallet().getAccount().getUsername() : null)
                .walletName(t.getWallet() != null ? t.getWallet().getName() : null)
                .walletId(t.getWallet() != null ? t.getWallet().getId() : null)
                .accountId(t.getWallet() != null && t.getWallet().getAccount() != null
                        ? t.getWallet().getAccount().getId() : null)
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Thống kê hệ thống
     */
    public AdminStatsResponse getStats() {
        long totalUsers = accountRepository.findAll().stream()
                .filter(a -> a.getRole() == com.fintrack.backend.enums.Role.USER)
                .count();

        long totalAdmins = accountRepository.findAll().stream()
                .filter(a -> a.getRole() == com.fintrack.backend.enums.Role.ADMIN)
                .count();

        long totalWallets = walletRepository.count();
        long totalTransactions = transactionRepository.count();
        long totalDebts = debtRepository.count();
        long totalSavings = savingRepository.count();

        // Tính tổng INCOME và EXPENSE toàn hệ thống
        List<Transaction> allTransactions = transactionRepository.findAll();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        BigDecimal totalSum = BigDecimal.ZERO;

        for (Transaction t : allTransactions) {
            totalSum = totalSum.add(t.getAmount());
            if (t.getType() == TransactionType.INCOME) {
                totalRevenue = totalRevenue.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(t.getAmount());
            }
        }

        BigDecimal avgTransaction = totalTransactions > 0
                ? totalSum.divide(BigDecimal.valueOf(totalTransactions), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalAdmins(totalAdmins)
                .totalWallets(totalWallets)
                .totalTransactions(totalTransactions)
                .totalDebts(totalDebts)
                .totalSavings(totalSavings)
                .totalRevenue(totalRevenue)
                .totalExpense(totalExpense)
                .avgTransaction(avgTransaction)
                .build();
    }

    /**
     * Lấy tất cả wallets toàn hệ thống
     */
    public List<Object[]> getAllWallets() {
        return walletRepository.findAll().stream()
                .map(w -> new Object[]{
                        w.getId(),
                        w.getName(),
                        w.getType() != null ? w.getType().name() : null,
                        w.getInitialBalance(),
                        w.getAccount() != null ? w.getAccount().getUsername() : null,
                        w.getAccount() != null ? w.getAccount().getId() : null
                })
                .collect(Collectors.toList());
    }
}