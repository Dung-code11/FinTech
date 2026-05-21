package com.fintrack.backend.service;

import com.fintrack.backend.dto.TransactionRequest;
import com.fintrack.backend.enums.CategoryType;
import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.enums.WalletType;
import com.fintrack.backend.model.*;
import com.fintrack.backend.repository.CategoryRepository;
import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ================= GET ALL =================
    public List<Transaction> getAll(Account account){
        return transactionRepository.findByWallet_Account_Id(account.getId());
    }

    // ================= GET BY ID =================
    public Transaction getById(String id, Account account){
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if(!t.getWallet().getAccount().getId().equals(account.getId())){
            throw new RuntimeException("Access denied");
        }

        return t;
    }

    // ================= CREATE =================
    @Transactional
    public Transaction create(TransactionRequest req, Account account){

        Wallet wallet = getWalletAndCheck(req.walletId, account.getId());

        Transaction t = new Transaction();
        t.setId(UUID.randomUUID().toString());
        t.setType(TransactionType.valueOf(req.type));
        t.setAmount(req.amount);
        t.setDescription(req.description);
        t.setWallet(wallet);
        t.setCreatedAt(resolveCreatedAt(req.createdAt, null));

        // category
        handleCategory(req, t, account);

        // xử lý tiền
        processMoney(t, wallet, req);

        walletRepository.save(wallet);
        return transactionRepository.save(t);
    }

    // ================= UPDATE =================
    @Transactional
    public Transaction update(String id, TransactionRequest req, Account account){

        Transaction old = getById(id, account);

        // rollback tiền cũ trước 🧠
        rollbackMoney(old);

        Wallet wallet = getWalletAndCheck(req.walletId, account.getId());

        old.setType(TransactionType.valueOf(req.type));
        old.setAmount(req.amount);
        old.setDescription(req.description);
        old.setWallet(wallet);
        old.setCreatedAt(resolveCreatedAt(req.createdAt, old.getCreatedAt()));

        handleCategory(req, old, account);

        processMoney(old, wallet, req);

        walletRepository.save(wallet);
        return transactionRepository.save(old);
    }

    // ================= DELETE =================
    @Transactional
    public void delete(String id, Account account){

        Transaction t = getById(id, account);

        // hoàn lại tiền trước khi xoá 🔄
        rollbackMoney(t);

        walletRepository.save(t.getWallet());

        transactionRepository.delete(t);
    }

    // 🎯 Tạo transaction từ việc trả nợ (EXPENSE)
    @Transactional
    public Transaction createDebtPaymentTransaction(
            Wallet wallet,
            String debtName,
            Long debtId,
            BigDecimal amount,
            String note,
            Account account) {

        // 1. Tìm hoặc tạo category "Trả nợ"
        Category debtCategory = findOrCreateCategory("Trả nợ", CategoryType.EXPENSE, account);

        // 2. Tạo transaction
        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID().toString());
        transaction.setType(TransactionType.EXPENSE);
        transaction.setAmount(amount);

        // Tạo description
        String description = String.format("Trả nợ: %s (Mã nợ: %d)", debtName, debtId);
        if (note != null && !note.isEmpty()) {
            description += " - " + note;
        }
        transaction.setDescription(description);

        transaction.setWallet(wallet);
        transaction.setCategory(debtCategory);
        transaction.setCreatedAt(LocalDateTime.now());

        // 3. Lưu transaction
        return transactionRepository.save(transaction);
    }

    // 🎯 Tạo transaction khi nhận tiền trả nợ (INCOME)
    @Transactional
    public Transaction createDebtIncomeTransaction(
            Wallet wallet,
            String debtName,
            Long debtId,
            BigDecimal amount,
            String note,
            Account account) {

        // 1. Tìm hoặc tạo category "Thu nhập"
        Category incomeCategory = findOrCreateCategory("Thu nhập", CategoryType.INCOME, account);

        // 2. Tạo transaction
        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID().toString());
        transaction.setType(TransactionType.INCOME);
        transaction.setAmount(amount);

        // Tạo description
        String description = String.format("Nhận tiền trả nợ: %s (Mã nợ: %d)", debtName, debtId);
        if (note != null && !note.isEmpty()) {
            description += " - " + note;
        }
        transaction.setDescription(description);

        transaction.setWallet(wallet);
        transaction.setCategory(incomeCategory);
        transaction.setCreatedAt(LocalDateTime.now());

        // 3. Lưu transaction
        return transactionRepository.save(transaction);
    }

    // Helper: Tìm hoặc tạo category
    private Category findOrCreateCategory(String categoryName, CategoryType type, Account account) {
        // Tìm category của user
        List<Category> categories = categoryRepository.findByOwnerAndType(account, type);

        for (Category cat : categories) {
            if (categoryName.equals(cat.getCategoryName())) {
                return cat;
            }
        }

        // Tìm category mặc định
        Optional<Category> defaultCategory = categoryRepository
                .findByCategoryNameAndIsDefaultTrue(categoryName);

        if (defaultCategory.isPresent()) {
            Category defaultCat = defaultCategory.get();
            // Clone cho user
            Category userCategory = new Category();
            userCategory.setId(UUID.randomUUID().toString());
            userCategory.setCategoryName(defaultCat.getCategoryName());
            userCategory.setType(defaultCat.getType());
            userCategory.setOwner(account);
            userCategory.setIsDefault(false);
            return categoryRepository.save(userCategory);
        }

        // Tạo mới
        Category newCategory = new Category();
        newCategory.setId(UUID.randomUUID().toString());
        newCategory.setCategoryName(categoryName);
        newCategory.setType(type);
        newCategory.setOwner(account);
        newCategory.setIsDefault(false);
        return categoryRepository.save(newCategory);
    }

    // ================= HELPER =================

    private Wallet getWalletAndCheck(String walletId, String accountId){
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if(!wallet.getAccount().getId().equals(accountId)){
            throw new RuntimeException("Access denied");
        }

        return wallet;
    }

    private void handleCategory(TransactionRequest req, Transaction t, Account account){
        if(req.categoryId != null){
            Category c = categoryRepository.findById(req.categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            // Kiểm tra category thuộc về user hoặc là default
            if(c.getOwner() != null && !c.getOwner().getId().equals(account.getId())){
                throw new RuntimeException("Category does not belong to user");
            }

            t.setCategory(c);
        } else {
            t.setCategory(null);
        }
    }

    private LocalDateTime resolveCreatedAt(LocalDate selectedDate, LocalDateTime fallback){
        if(selectedDate == null){
            return fallback != null
                    ? fallback
                    : LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        }

        LocalTime time = fallback != null
                ? fallback.toLocalTime()
                : LocalTime.now();

        return selectedDate.atTime(time).truncatedTo(ChronoUnit.SECONDS);
    }

    // ================= MONEY LOGIC =================

    private void processMoney(Transaction t, Wallet wallet, TransactionRequest req){

        switch (t.getType()){

            case INCOME:
                if(wallet.getType() == WalletType.CASH){
                    wallet.setInitialBalance(wallet.getInitialBalance().add(req.amount));
                } else {
                    wallet.setUnpaidBalance(wallet.getUnpaidBalance().subtract(req.amount));
                }
                break;

            case EXPENSE:
                if(wallet.getType() == WalletType.CASH){
                    wallet.setInitialBalance(wallet.getInitialBalance().subtract(req.amount));
                } else {
                    wallet.setUnpaidBalance(wallet.getUnpaidBalance().add(req.amount));
                }
                break;

            case TRANSFER:
                Wallet toWallet = walletRepository.findById(req.toWalletId)
                        .orElseThrow(() -> new RuntimeException("To wallet not found"));

                // FROM
                if(wallet.getType() == WalletType.CASH){
                    wallet.setInitialBalance(wallet.getInitialBalance().subtract(req.amount));
                }

                // TO
                if(toWallet.getType() == WalletType.CASH){
                    toWallet.setInitialBalance(toWallet.getInitialBalance().add(req.amount));
                }

                walletRepository.save(toWallet);
                t.setToWallet(toWallet);
                break;
        }
    }

    // rollback khi update/delete
    private void rollbackMoney(Transaction t){

        Wallet wallet = t.getWallet();

        switch (t.getType()){

            case INCOME:
                if(wallet.getType() == WalletType.CASH){
                    wallet.setInitialBalance(wallet.getInitialBalance().subtract(t.getAmount()));
                } else {
                    wallet.setUnpaidBalance(wallet.getUnpaidBalance().add(t.getAmount()));
                }
                break;

            case EXPENSE:
                if(wallet.getType() == WalletType.CASH){
                    wallet.setInitialBalance(wallet.getInitialBalance().add(t.getAmount()));
                } else {
                    wallet.setUnpaidBalance(wallet.getUnpaidBalance().subtract(t.getAmount()));
                }
                break;

            case TRANSFER:
                Wallet toWallet = t.getToWallet();

                if(wallet.getType() == WalletType.CASH){
                    wallet.setInitialBalance(wallet.getInitialBalance().add(t.getAmount()));
                }

                if(toWallet != null && toWallet.getType() == WalletType.CASH){
                    toWallet.setInitialBalance(toWallet.getInitialBalance().subtract(t.getAmount()));
                    walletRepository.save(toWallet);
                }
                break;
        }
    }
}
