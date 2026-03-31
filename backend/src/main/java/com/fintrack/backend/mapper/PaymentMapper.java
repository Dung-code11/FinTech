package com.fintrack.backend.mapper;

import com.fintrack.backend.dto.*;
import com.fintrack.backend.dto.Response.*;
import com.fintrack.backend.model.Debt;
import com.fintrack.backend.model.DebtPayment;
import com.fintrack.backend.model.Wallet;

public class PaymentMapper {

    public static DebtPayment toEntity(DebtPaymentRequest dto, Wallet wallet, Debt debt) {
        DebtPayment p = new DebtPayment();
        p.setTitle(dto.getTitle());
        p.setAmount(dto.getAmount());
        p.setWallet(wallet);
        p.setDebt(debt);
        return p;
    }

    public static DebtPaymentResponse toDTO(DebtPayment p) {
        return DebtPaymentResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .walletId(p.getWallet().getId())
                .debtId(p.getDebt().getId())
                .build();
    }
}