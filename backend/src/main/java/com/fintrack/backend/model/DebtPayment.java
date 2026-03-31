package com.fintrack.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "debt_payment")
@Getter
@Setter
public class DebtPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private BigDecimal amount;

    private LocalDateTime paymentDate;

    private String Note;
    @ManyToOne
    @JoinColumn(name = "debt_id")
    private Debt debt;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @PrePersist
    public void prePersist() {
        paymentDate = LocalDateTime.now();
    }
}
