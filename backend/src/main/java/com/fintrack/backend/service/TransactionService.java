package com.fintrack.backend.service;

import com.fintrack.backend.dto.TransactionRequest;
import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.enums.WalletType;
import com.fintrack.backend.model.Category;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.CategoryRepository;
import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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
    public List<Transaction> getAll(String accountId){
        return transactionRepository.findByWallet_Account_Id(accountId);
    }

    // ================= GET BY ID =================
    public Transaction getById(String id, String accountId){
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if(!t.getWallet().getAccount().getId().equals(accountId)){
            throw new RuntimeException("Access denied");
        }

        return t;
    }

    // ================= CREATE =================
    public Transaction create(TransactionRequest req, String accountId){

        Wallet wallet = getWalletAndCheck(req.walletId, accountId);

        Transaction t = new Transaction();
        t.setId(UUID.randomUUID().toString());
        t.setType(TransactionType.valueOf(req.type));
        t.setAmount(req.amount);
        t.setDescription(req.description);
        t.setWallet(wallet);
        t.setCreatedAt(LocalDateTime.now());

        // category
        handleCategory(req, t);

        // xử lý tiền
        processMoney(t, wallet, req);

        walletRepository.save(wallet);
        return transactionRepository.save(t);
    }

    // ================= UPDATE =================
    public Transaction update(String id, TransactionRequest req, String accountId){

        Transaction old = getById(id, accountId);

        // rollback tiền cũ trước 🧠
        rollbackMoney(old);

        Wallet wallet = getWalletAndCheck(req.walletId, accountId);

        old.setType(TransactionType.valueOf(req.type));
        old.setAmount(req.amount);
        old.setDescription(req.description);
        old.setWallet(wallet);

        handleCategory(req, old);

        processMoney(old, wallet, req);

        walletRepository.save(wallet);
        return transactionRepository.save(old);
    }

    // ================= DELETE =================
    public void delete(String id, String accountId){

        Transaction t = getById(id, accountId);

        // hoàn lại tiền trước khi xoá 🔄
        rollbackMoney(t);

        walletRepository.save(t.getWallet());

        transactionRepository.delete(t);
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

    private void handleCategory(TransactionRequest req, Transaction t){
        if(req.categoryId != null){
            Category c = categoryRepository.findById(req.categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            if(!c.getType().name().equals(req.type)){
                throw new RuntimeException("Category type mismatch");
            }

            t.setCategory(c);
        } else {
            t.setCategory(null);
        }
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