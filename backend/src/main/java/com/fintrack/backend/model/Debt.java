package com.fintrack.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "debt")
@Getter
@Setter
public class Debt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String currency = "VND";

    private BigDecimal totalAmount;

    private BigDecimal remainingAmount;

    private LocalDateTime createdDate;

    private LocalDate targetDate;

    private String Note;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @OneToMany(mappedBy = "debt", cascade = CascadeType.ALL)
    private List<DebtPayment> payments;

    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
        remainingAmount = totalAmount;
    }
}
