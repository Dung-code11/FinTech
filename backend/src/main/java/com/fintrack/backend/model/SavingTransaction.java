package com.fintrack.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "saving_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String note;

    private BigDecimal amount;

    private LocalDateTime transactionDate;

    @ManyToOne
    @JoinColumn(name = "saving_id")
    private Saving saving;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
}