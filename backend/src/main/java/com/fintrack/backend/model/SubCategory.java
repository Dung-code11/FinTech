package com.fintrack.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // Thêm import
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "sub_category")
public class SubCategory {

    @Id
    private String id;

    @Column(name = "subcategory_name")
    private String subcategoryName;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category; // Giữ nguyên, không cần ignore vì sẽ dùng để hiển thị

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonIgnore // ⚠️ Ngăn serialize account trong subcategory
    private Account owner;

    private Boolean isDefault;
}