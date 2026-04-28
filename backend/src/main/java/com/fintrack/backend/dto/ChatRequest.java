package com.fintrack.backend.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ChatRequest {
    private String message;
    private String activeTab;
    private List<HistoryItem> history = new ArrayList<>();

    @Data
    public static class HistoryItem {
        private String role;
        private String text;
    }
}
