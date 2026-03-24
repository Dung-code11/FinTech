package com.fintrack.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CategoryRequest {

    @NotBlank
    public String name;

    @NotBlank
    public String type; // INCOME | EXPENSE
}
