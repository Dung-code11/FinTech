package com.fintrack.backend.mapper;

import com.fintrack.backend.dto.DebtRequest;
import com.fintrack.backend.dto.Response.DebtResponse;
import com.fintrack.backend.model.Debt;
import com.fintrack.backend.model.Wallet;

import java.math.BigDecimal;

public class DebtMapper {

    public static Debt toEntity(DebtRequest dto, Wallet wallet) {
        Debt debt = new Debt();
        debt.setName(dto.getName());
        debt.setCurrency(dto.getCurrency());
        debt.setTotalAmount(dto.getTotalAmount());
        debt.setRemainingAmount(dto.getTotalAmount()); // Ban đầu remaining = total
        debt.setTargetDate(dto.getTargetDate());
        debt.setWallet(wallet);
        debt.setNote(dto.getNote());
        return debt;
    }

    public static DebtResponse toDTO(Debt debt) {
        DebtResponse dto = new DebtResponse();
        dto.setId(debt.getId());
        dto.setName(debt.getName());
        dto.setCurrency(debt.getCurrency());
        dto.setTotalAmount(debt.getTotalAmount());

        // Tính paidAmount = totalAmount - remainingAmount
        BigDecimal paidAmount = debt.getTotalAmount().subtract(debt.getRemainingAmount());
        dto.setPaidAmount(paidAmount);

        dto.setRemainingAmount(debt.getRemainingAmount());
        dto.setCreatedDate(debt.getCreatedDate());
        dto.setTargetDate(debt.getTargetDate());
        dto.setWalletId(debt.getWallet().getId());
        return dto;
    }
}