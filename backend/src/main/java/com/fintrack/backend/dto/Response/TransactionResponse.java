package com.fintrack.backend.dto.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {

    public String id;
    public String type;
    public BigDecimal amount;
    public String description;

    public String walletId;
    public String toWalletId;

    public String categoryName;

    public LocalDateTime createdAt;
}