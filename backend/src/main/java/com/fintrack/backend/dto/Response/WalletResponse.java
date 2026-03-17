package com.fintrack.backend.dto.Response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class WalletResponse {

    public String id;
    public String name;
    public String currency;
    public String type;

    public BigDecimal balance; // cho CASH

    public BigDecimal creditLimit;
    public BigDecimal unpaidBalance;
    public LocalDate expiryDate;
}
