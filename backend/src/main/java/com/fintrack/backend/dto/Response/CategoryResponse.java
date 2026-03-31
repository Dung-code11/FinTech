package com.fintrack.backend.dto.Response;


import lombok.*;

@Data
@Builder
public class CategoryResponse {
    public String id;
    public String name;
    public Boolean isDefault;
}
