package com.fintrack.backend.dto.Response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminCategoryResponse {
    private String id;
    private String name;
    private String type;
    private Boolean isDefault;
    private String ownerId;
    private String ownerUsername;
    private Integer transactionCount;
    private Integer subCategoryCount;
}
