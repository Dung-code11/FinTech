package com.fintrack.backend.model;

import com.fintrack.backend.enums.BudgetPeriod;
import com.fintrack.backend.enums.BudgetType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String budget_name; // tên ngân sách

    @Enumerated(EnumType.STRING)
    private BudgetType type; // EXPENSE / INCOME

    private double amount; // số tiền mục tiêu

    private double spent; // đã dùng (auto tính)

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private BudgetPeriod period; // DAILY / WEEKLY / MONTHLY

    // Liên kết ví
    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    // Nhiều category
    @ManyToMany
    @JoinTable(
            name = "budget_categories",
            joinColumns = @JoinColumn(name = "budget_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;
}
