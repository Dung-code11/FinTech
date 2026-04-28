package com.fintrack.backend.mapper;

import com.fintrack.backend.dto.Response.*;
import com.fintrack.backend.model.*;

import java.math.RoundingMode;
import java.util.stream.Collectors;

public class SavingMapper {

    public static SavingResponse toDTO(Saving saving) {

        double progress = 0;
        if (saving.getTargetAmount().doubleValue() > 0) {
            progress = saving.getCurrentAmount()
                    .divide(saving.getTargetAmount(), 2, RoundingMode.HALF_UP)
                    .doubleValue() * 100;
        }

        return SavingResponse.builder()
                .id(saving.getId())
                .title(saving.getTitle())
                .currency(saving.getCurrency())
                .targetAmount(saving.getTargetAmount())
                .currentAmount(saving.getCurrentAmount())
                .progress(progress)
                .type(saving.getType().name())
                .category(saving.getCategory())
                .targetDate(saving.getTargetDate())
                .period(saving.getPeriod() != null ? saving.getPeriod().name() : null)
                .walletId(saving.getWallet().getId())
                .transactions(
                        saving.getTransactions()
                                .stream()
                                .map(SavingMapper::toTransactionDTO)
                                .collect(Collectors.toList())
                )
                .build();
    }

    public static SavingTransactionResponse toTransactionDTO(SavingTransaction tx) {
        return SavingTransactionResponse.builder()
                .id(tx.getId())
                .note(tx.getNote())
                .amount(tx.getAmount())
                .transactionDate(tx.getTransactionDate())
                .walletId(tx.getWallet().getId())
                .build();
    }
}
