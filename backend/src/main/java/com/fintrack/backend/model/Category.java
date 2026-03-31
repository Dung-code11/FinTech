package com.fintrack.backend.model;

import com.fintrack.backend.enums.CategoryType;
import com.fasterxml.jackson.annotation.JsonIgnore; // Thêm import
import jakarta.persistence.*;
import lombok.*;

import java.util.List; // Thêm import

@Entity
@Getter
@Setter
@Table(name = "category")
public class Category {

    @Id
    private String id;

    @Column(name = "category_name")
    private String categoryName;

    @Enumerated(EnumType.STRING)
    private CategoryType type;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonIgnore // ⚠️ Ngăn serialize account trong category
    private Account owner;

    private Boolean isDefault;

    @OneToMany(mappedBy = "category")
    @JsonIgnore // ⚠️ Ngăn serialize danh sách transactions
    private List<Transaction> transactions;

    @OneToMany(mappedBy = "category")
    @JsonIgnore // ⚠️ Ngăn serialize danh sách subcategories
    private List<SubCategory> subCategories;
    public Category(String categoryName) {
        this.categoryName = categoryName;
    }

    public Category() {
    }
}