package com.fintrack.backend.service;

import com.fintrack.backend.dto.SavingRequest;
import com.fintrack.backend.dto.SavingTransactionRequest;
import com.fintrack.backend.dto.WithdrawSavingRequest;
import com.fintrack.backend.enums.SavingPeriod;
import com.fintrack.backend.enums.SavingStatus;
import com.fintrack.backend.enums.SavingType;
import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.model.Saving;
import com.fintrack.backend.model.SavingTransaction;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.SavingRepository;
import com.fintrack.backend.repository.SavingTransactionRepository;
import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavingService {

    private final SavingRepository savingRepository;
    private final SavingTransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepo;

    public Saving createSaving(String walletId, SavingRequest req) {
        Wallet wallet = walletRepository.findById(walletId).orElseThrow();

        Saving saving = Saving.builder()
                .id(UUID.randomUUID().toString())
                .title(req.getTitle())
                .currency(req.getCurrency())
                .targetAmount(req.getTargetAmount())
                .currentAmount(BigDecimal.ZERO)
                .type(SavingType.valueOf(req.getType()))
                .category(req.getCategory())
                .targetDate(req.getTargetDate())
                .period(req.getPeriod() != null ? SavingPeriod.valueOf(req.getPeriod()) : null)
                .build();

        saving.setWallet(wallet);
        saving.setStatus(SavingStatus.ACTIVE);
        return savingRepository.save(saving);
    }

    public List<Saving> getByWallet(String walletId) {
        return savingRepository.findByWallet_Id(walletId);
    }

    public Saving addMoney(String savingId, SavingTransactionRequest req) {
        Saving saving = savingRepository.findById(savingId).orElseThrow();
        Wallet wallet = walletRepository.findById(req.getWalletId()).orElseThrow();

        wallet.setInitialBalance(wallet.getInitialBalance().subtract(req.getAmount()));
        walletRepository.save(wallet);

        saving.setCurrentAmount(saving.getCurrentAmount().add(req.getAmount()));

        SavingTransaction tx = SavingTransaction.builder()
                .note(req.getNote())
                .amount(req.getAmount())
                .transactionDate(req.getTransactionDate() != null ? req.getTransactionDate() : LocalDateTime.now())
                .saving(saving)
                .wallet(wallet)
                .build();

        transactionRepository.save(tx);

        Transaction transaction = Transaction.builder()
                .id(UUID.randomUUID().toString())
                .type(TransactionType.EXPENSE)
                .amount(req.getAmount())
                .description("Saving: " + saving.getTitle())
                .wallet(wallet)
                .createdAt(LocalDateTime.now())
                .build();

        transactionRepo.save(transaction);

        if (saving.getCurrentAmount().compareTo(saving.getTargetAmount()) >= 0) {
            saving.setStatus(SavingStatus.COMPLETED);
        }

        return savingRepository.save(saving);
    }

    public Saving withdraw(String savingId, WithdrawSavingRequest req) {
        Saving saving = savingRepository.findById(savingId).orElseThrow();
        Wallet wallet = walletRepository.findById(req.getWalletId()).orElseThrow();

        if (saving.getCurrentAmount().compareTo(req.getAmount()) < 0) {
            throw new RuntimeException("Không đủ tiền để rút");
        }

        saving.setCurrentAmount(saving.getCurrentAmount().subtract(req.getAmount()));
        wallet.setInitialBalance(wallet.getInitialBalance().add(req.getAmount()));
        walletRepository.save(wallet);

        SavingTransaction tx = SavingTransaction.builder()
                .note("Rút: " + req.getNote())
                .amount(req.getAmount().negate())
                .transactionDate(LocalDateTime.now())
                .saving(saving)
                .wallet(wallet)
                .build();

        transactionRepository.save(tx);

        Transaction transaction = Transaction.builder()
                .id(UUID.randomUUID().toString())
                .type(TransactionType.INCOME)
                .amount(req.getAmount())
                .description("Withdraw Saving: " + saving.getTitle())
                .wallet(wallet)
                .createdAt(LocalDateTime.now())
                .build();

        transactionRepo.save(transaction);

        if (saving.getCurrentAmount().compareTo(BigDecimal.ZERO) == 0) {
            saving.setStatus(SavingStatus.WITHDRAWN);
        } else if (saving.getStatus() == null) {
            saving.setStatus(SavingStatus.ACTIVE);
        }

        return savingRepository.save(saving);
    }
}
