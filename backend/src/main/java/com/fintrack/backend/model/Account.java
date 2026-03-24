package com.fintrack.backend.model;

import com.fintrack.backend.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore; // Thêm import
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List; // Thêm import

@Entity
@Getter
@Setter
public class Account {

    @Id
    private String id;

    private String username;

    @JsonIgnore // ⚠️ QUAN TRỌNG: Không trả password trong JSON
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    private InfoUser infoUser;

    // Thêm quan hệ ngược để dễ query nhưng cần @JsonIgnore
    @OneToMany(mappedBy = "account")
    @JsonIgnore // ⚠️ Ngăn serialize danh sách wallets
    private List<Wallet> wallets;

    @OneToMany(mappedBy = "owner")
    @JsonIgnore // ⚠️ Ngăn serialize danh sách categories
    private List<Category> categories;

    @OneToMany(mappedBy = "owner")
    @JsonIgnore // ⚠️ Ngăn serialize danh sách subcategories
    private List<SubCategory> subCategories;
}