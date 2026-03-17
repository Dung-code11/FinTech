package com.fintrack.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class WalletRequest {
    public String type; // CASH / CREDIT
    public String name;
    public String currency;

    public BigDecimal initialBalance;

    public BigDecimal creditLimit;
    public BigDecimal unpaidBalance;
    public LocalDate expiryDate;
}
