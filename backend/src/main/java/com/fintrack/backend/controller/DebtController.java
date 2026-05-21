package com.fintrack.backend.controller;

import com.fintrack.backend.dto.*;
import com.fintrack.backend.dto.Response.*;
import com.fintrack.backend.mapper.DebtMapper;
import com.fintrack.backend.mapper.PaymentMapper;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Debt;
import com.fintrack.backend.model.DebtPayment;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.WalletRepository;
import com.fintrack.backend.service.DebtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/debts", "/debts"})
@RequiredArgsConstructor
public class DebtController {

    private final DebtService debtService;
    private final WalletRepository walletRepository;

    // 🧾 Tạo khoản nợ
    @PostMapping
    public ResponseEntity<DebtResponse> create(@RequestBody DebtRequest dto) {
        Wallet wallet = walletRepository.findById(dto.getWalletId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        Debt debt = DebtMapper.toEntity(dto, wallet);
        Debt saved = debtService.createDebt(debt);

        return ResponseEntity.ok(DebtMapper.toDTO(saved));
    }

    // 📋 Lấy tất cả khoản nợ
    @GetMapping
    public ResponseEntity<List<DebtResponse>> getAll() {
        List<DebtResponse> result = debtService.getAll()
                .stream()
                .map(DebtMapper::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // 🔍 Lấy chi tiết 1 khoản nợ
    @GetMapping("/{id}")
    public ResponseEntity<DebtResponse> getOne(@PathVariable Long id) {
        Debt debt = debtService.getById(id);
        return ResponseEntity.ok(DebtMapper.toDTO(debt));
    }

    // 💸 Trả nợ - CHỈ GIỮ METHOD NÀY (có UserDetails)
    @PostMapping("/{id}/pay")
    public ResponseEntity<DebtPaymentResponse> pay(
            @PathVariable Long id,
            @RequestBody DebtPaymentRequest dto,
            @AuthenticationPrincipal Account account) {

        if (account == null) {
            throw new RuntimeException("Chưa đăng nhập!");
        }

        Wallet wallet = walletRepository.findById(dto.getWalletId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        Debt debt = debtService.getById(id);
        DebtPayment payment = PaymentMapper.toEntity(dto, wallet, debt);

        DebtPayment saved = debtService.payDebt(id, payment, account.getUsername());

        return ResponseEntity.ok(PaymentMapper.toDTO(saved));
    }

    // 📜 Lịch sử trả nợ
    @GetMapping("/{id}/payments")
    public ResponseEntity<List<DebtPaymentResponse>> payments(@PathVariable Long id) {
        List<DebtPaymentResponse> result = debtService.getPayments(id)
                .stream()
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
