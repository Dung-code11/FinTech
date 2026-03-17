package com.fintrack.backend.controller;

import com.fintrack.backend.dto.Response.WalletResponse;
import com.fintrack.backend.dto.WalletRequest;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping
    public List<WalletResponse> getWallets(Authentication authentication){
        String accountId = authentication.getName();
        return walletService.getWallets(accountId);
    }

    @GetMapping("/{walletId}")
    public WalletResponse getWallet(
            @PathVariable String walletId,
            Authentication authentication
    ){
        String accountId = authentication.getName();
        return walletService.getWalletById(walletId, accountId);
    }

    @PostMapping
    public String createWallet(
            Authentication authentication,
            @RequestBody WalletRequest request
    ){
        String accountId = authentication.getName();
        walletService.createWallet(accountId, request);
        return "Create wallet success";
    }

    @PutMapping("/{walletId}")
    public String updateWallet(
            @PathVariable String walletId,
            Authentication authentication,
            @RequestBody WalletRequest request
    ){
        String accountId = authentication.getName();
        walletService.updateWallet(walletId, accountId, request);
        return "Update wallet success";
    }

    @DeleteMapping("/{walletId}")
    public String deleteWallet(
            @PathVariable String walletId,
            Authentication authentication
    ){
        String accountId = authentication.getName();
        walletService.deleteWallet(walletId, accountId);
        return "Delete wallet success";
    }
}