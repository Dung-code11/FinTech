package com.fintrack.backend.model;

import com.fintrack.backend.enums.WalletType;
import com.fasterxml.jackson.annotation.JsonIgnore; // Thêm import
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List; // Thêm import

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

    private BigDecimal initialBalance;

    private BigDecimal creditLimit;
    private BigDecimal unpaidBalance;
    private LocalDate expiryDate;

    @ManyToOne
    @JoinColumn(name = "account_id")
    @JsonIgnore // ⚠️ Ngăn serialize account trong wallet
    private Account account;

    @OneToMany(mappedBy = "wallet")
    @JsonIgnore // ⚠️ Ngăn serialize danh sách transactions
    private List<Transaction> transactions;

    @OneToMany(mappedBy = "toWallet")
    @JsonIgnore // ⚠️ Ngăn serialize danh sách transfers
    private List<Transaction> transfers;
}