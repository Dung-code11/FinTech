package com.fintrack.backend.dto.Response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AdminTransactionResponse {
    private String id;
    private String type;
    private BigDecimal amount;
    private String description;
    private String categoryName;
    private LocalDateTime createdAt;

    // Thông tin user/wallet
    private String username;
    private String walletName;
    private String walletId;
    private String accountId;
}
