package com.fintrack.backend.model;

import com.fintrack.backend.enums.SavingPeriod;
import com.fintrack.backend.enums.SavingStatus;
import com.fintrack.backend.enums.SavingType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "savings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Saving {

    @Id
    private String id;

    private String title;

    private String currency;

    @Column(name = "target_amount")
    private BigDecimal targetAmount;

    @Column(name = "current_amount")
    private BigDecimal currentAmount;

    @Enumerated(EnumType.STRING)
    private SavingType type;

    private String category;

    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    private SavingPeriod period;

    @Enumerated(EnumType.STRING)
    private SavingStatus status;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @OneToMany(mappedBy = "saving", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SavingTransaction> transactions = new ArrayList<>();
}
