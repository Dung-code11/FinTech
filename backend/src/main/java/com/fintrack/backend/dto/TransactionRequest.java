package com.fintrack.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TransactionRequest {

    @NotBlank
    public String type; // INCOME | EXPENSE | TRANSFER

    @NotNull
    public BigDecimal amount;

    public String description;

    @NotBlank
    public String walletId;

    public String toWalletId; // dùng cho TRANSFER

    public String categoryId;

    public LocalDate createdAt;
}
