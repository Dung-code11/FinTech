package com.fintrack.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WithdrawSavingRequest {

    private BigDecimal amount; // có thể rút 1 phần
    private String walletId;
    private String note;
}
