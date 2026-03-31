package com.fintrack.backend.service;

import com.fintrack.backend.enums.CategoryType;
import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.enums.WalletType;
import com.fintrack.backend.model.*;
import com.fintrack.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DebtService {

    private final DebtRepository debtRepository;
    private final DebtPaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository; // Thêm repository để tìm Account

    @Transactional
    public Debt createDebt(Debt debt) {
        if (debt.getTotalAmount() == null) {
            debt.setTotalAmount(BigDecimal.ZERO);
        }
        if (debt.getRemainingAmount() == null) {
            debt.setRemainingAmount(debt.getTotalAmount());
        }
        if (debt.getCreatedDate() == null) {
            debt.setCreatedDate(LocalDateTime.now());
        }

        return debtRepository.save(debt);
    }

    public List<Debt> getAll() {
        return debtRepository.findAll();
    }

    public Debt getById(Long id) {
        return debtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản nợ với ID: " + id));
    }

    @Transactional
    public DebtPayment payDebt(Long debtId, DebtPayment payment, String username) {
        // Lấy account từ username
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + username));

        Debt debt = getById(debtId);

        // Đảm bảo debt có các giá trị không null
        if (debt.getTotalAmount() == null) {
            debt.setTotalAmount(BigDecimal.ZERO);
        }
        if (debt.getRemainingAmount() == null) {
            debt.setRemainingAmount(debt.getTotalAmount());
        }

        if (payment.getWallet() == null || payment.getWallet().getId() == null) {
            throw new RuntimeException("Ví thanh toán không hợp lệ!");
        }

        Wallet wallet = walletRepository.findById(payment.getWallet().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví với ID: " + payment.getWallet().getId()));

        // Kiểm tra ví thuộc về account
        if (!wallet.getAccount().getId().equals(account.getId())) {
            throw new RuntimeException("Ví không thuộc về tài khoản của bạn!");
        }

        BigDecimal amount = payment.getAmount().abs();
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền trả phải lớn hơn 0!");
        }

        // Kiểm tra tiền tệ
        if (wallet.getCurrency() != null && debt.getCurrency() != null &&
                !wallet.getCurrency().equals(debt.getCurrency())) {
            throw new RuntimeException("Tiền tệ không khớp!");
        }

        // Kiểm tra số tiền trả không vượt quá số còn nợ
        if (amount.compareTo(debt.getRemainingAmount()) > 0) {
            throw new RuntimeException("Số tiền trả vượt quá số tiền còn nợ!");
        }

        // Cập nhật ví
        switch (wallet.getType()) {
            case CASH:
                if (wallet.getInitialBalance() == null) {
                    wallet.setInitialBalance(BigDecimal.ZERO);
                }
                if (wallet.getInitialBalance().compareTo(amount) < 0) {
                    throw new RuntimeException("Ví không đủ tiền! Số dư: " +
                            wallet.getInitialBalance() + ", Cần trả: " + amount);
                }
                wallet.setInitialBalance(wallet.getInitialBalance().subtract(amount));
                break;

            case CREDIT:
                if (wallet.getUnpaidBalance() == null) {
                    wallet.setUnpaidBalance(BigDecimal.ZERO);
                }
                if (wallet.getUnpaidBalance().compareTo(amount) < 0) {
                    throw new RuntimeException("Trả vượt dư nợ thẻ! Dư nợ: " +
                            wallet.getUnpaidBalance() + ", Cần trả: " + amount);
                }
                wallet.setUnpaidBalance(wallet.getUnpaidBalance().subtract(amount));
                break;

            default:
                throw new RuntimeException("Loại ví không hợp lệ!");
        }

        walletRepository.save(wallet);

        // Cập nhật remainingAmount
        debt.setRemainingAmount(debt.getRemainingAmount().subtract(amount));
        debtRepository.save(debt);

        // Tạo payment
        payment.setAmount(amount);
        payment.setDebt(debt);
        payment.setWallet(wallet);
        payment.setPaymentDate(LocalDateTime.now());

        if (payment.getTitle() == null || payment.getTitle().isEmpty()) {
            payment.setTitle("Trả nợ: " + debt.getName());
        }

        DebtPayment savedPayment = paymentRepository.save(payment);

        // 🎯 TẠO TRANSACTION TỰ ĐỘNG
        try {
            createTransactionForDebtPayment(wallet, debt, amount, payment.getNote(), account);
        } catch (Exception e) {
            System.err.println("❌ Không thể tạo transaction: " + e.getMessage());
            e.printStackTrace();
        }

        return savedPayment;
    }

    private void createTransactionForDebtPayment(Wallet wallet, Debt debt, BigDecimal amount, String note, Account account) {
        // Tìm hoặc tạo category "Trả nợ"
        Category debtCategory = findOrCreateCategory("Trả nợ", CategoryType.EXPENSE, account);

        // Tạo transaction
        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID().toString());
        transaction.setType(TransactionType.EXPENSE);
        transaction.setAmount(amount);

        // Tạo description
        String description = String.format("Trả nợ: %s (Mã nợ: %d)", debt.getName(), debt.getId());
        if (note != null && !note.isEmpty()) {
            description += " - " + note;
        }
        transaction.setDescription(description);

        transaction.setWallet(wallet);
        transaction.setCategory(debtCategory);
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);
        System.out.println("✅ Đã tạo transaction thành công cho khoản nợ: " + debt.getName());
    }

    private Category findOrCreateCategory(String categoryName, CategoryType type, Account account) {
        // Tìm category của user
        List<Category> categories = categoryRepository.findByOwnerAndType(account, type);

        for (Category cat : categories) {
            if (categoryName.equals(cat.getCategoryName())) {
                return cat;
            }
        }

        // Tìm category mặc định
        Category defaultCategory = categoryRepository
                .findByCategoryNameAndIsDefaultTrue(categoryName)
                .orElse(null);

        if (defaultCategory != null) {
            // Clone cho user
            Category userCategory = new Category();
            userCategory.setId(UUID.randomUUID().toString());
            userCategory.setCategoryName(defaultCategory.getCategoryName());
            userCategory.setType(defaultCategory.getType());
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

    public List<DebtPayment> getPayments(Long debtId) {
        return paymentRepository.findByDebtId(debtId);
    }
}