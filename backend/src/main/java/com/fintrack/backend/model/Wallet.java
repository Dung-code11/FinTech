package com.fintrack.backend.model;

import com.fintrack.backend.enums.WalletType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Wallet {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    private WalletType type;

    private String name;

    private String currency;

    // CASH
    private BigDecimal initialBalance;

    // CREDIT
    private BigDecimal creditLimit;
    private BigDecimal unpaidBalance;
    private LocalDate expiryDate;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}
