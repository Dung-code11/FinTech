package com.fintrack.backend.service;

import com.fintrack.backend.dto.Response.WalletResponse;
import com.fintrack.backend.dto.WalletRequest;
import com.fintrack.backend.enums.WalletType;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.AccountRepository;
import com.fintrack.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private AccountRepository accountRepository;

    // ========================
    // 🔁 MAPPING ENTITY -> DTO
    // ========================
    private WalletResponse toResponse(Wallet wallet){

        WalletResponse res = new WalletResponse();

        res.id = wallet.getId();
        res.name = wallet.getName();
        res.currency = wallet.getCurrency();
        res.type = wallet.getType().name();

        if(wallet.getType() == WalletType.CASH){
            res.balance = wallet.getInitialBalance();
        }

        if(wallet.getType() == WalletType.CREDIT){
            res.creditLimit = wallet.getCreditLimit();
            res.unpaidBalance = wallet.getUnpaidBalance();
            res.expiryDate = wallet.getExpiryDate();
        }

        return res;
    }

    // ========================
    // 📌 GET LIST
    // ========================
    public List<WalletResponse> getWallets(String accountId){
        return walletRepository.findByAccount_Id(accountId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ========================
    // 📌 GET DETAIL
    // ========================
    public WalletResponse getWalletById(String walletId, String accountId){

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if(!wallet.getAccount().getId().equals(accountId)){
            throw new RuntimeException("Access denied");
        }

        return toResponse(wallet);
    }

    // ========================
    // 📌 CREATE
    // ========================
    public void createWallet(String accountId, WalletRequest request){

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        Wallet wallet = new Wallet();

        wallet.setId(UUID.randomUUID().toString());
        wallet.setName(request.name);
        wallet.setCurrency(request.currency);

        WalletType type = WalletType.valueOf(request.type);
        wallet.setType(type);

        if(type == WalletType.CASH){
            if(request.initialBalance == null){
                throw new RuntimeException("Initial balance required");
            }
            wallet.setInitialBalance(request.initialBalance);
        }

        if(type == WalletType.CREDIT){
            if(request.creditLimit == null){
                throw new RuntimeException("Credit limit required");
            }
            wallet.setCreditLimit(request.creditLimit);
            wallet.setUnpaidBalance(request.unpaidBalance);
            wallet.setExpiryDate(request.expiryDate);
        }

        wallet.setAccount(account);

        walletRepository.save(wallet);
    }

    // ========================
    // 📌 UPDATE
    // ========================
    public void updateWallet(String walletId, String accountId, WalletRequest request){

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if(!wallet.getAccount().getId().equals(accountId)){
            throw new RuntimeException("Access denied");
        }

        wallet.setName(request.name);
        wallet.setCurrency(request.currency);

        WalletType type = WalletType.valueOf(request.type);
        wallet.setType(type);

        if(type == WalletType.CASH){
            wallet.setInitialBalance(request.initialBalance);

            wallet.setCreditLimit(null);
            wallet.setUnpaidBalance(null);
            wallet.setExpiryDate(null);
        }

        if(type == WalletType.CREDIT){
            wallet.setCreditLimit(request.creditLimit);
            wallet.setUnpaidBalance(request.unpaidBalance);
            wallet.setExpiryDate(request.expiryDate);

            wallet.setInitialBalance(null);
        }

        walletRepository.save(wallet);
    }

    // ========================
    // 📌 DELETE
    // ========================
    public void deleteWallet(String walletId, String accountId){

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if(!wallet.getAccount().getId().equals(accountId)){
            throw new RuntimeException("Access denied");
        }

        walletRepository.delete(wallet);
    }
}