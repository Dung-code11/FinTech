package com.fintrack.backend.model;

import com.fintrack.backend.enums.TransactionType;
import com.fasterxml.jackson.annotation.JsonIgnore; // Thêm import
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "transaction")
public class Transaction {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private BigDecimal amount;

    private String description;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @ManyToOne
    @JoinColumn(name = "to_wallet_id")
    private Wallet toWallet;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private LocalDateTime createdAt;

    // Thêm quan hệ ngược nếu cần (hiếm khi dùng)
    // @ManyToOne
    // @JoinColumn(name = "account_id")
    // @JsonIgnore
    // private Account account;
}