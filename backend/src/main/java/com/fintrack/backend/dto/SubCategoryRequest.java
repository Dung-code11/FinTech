package com.fintrack.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class SubCategoryRequest {

    @NotBlank
    public String name;

    @NotBlank
    public String categoryId;
}
