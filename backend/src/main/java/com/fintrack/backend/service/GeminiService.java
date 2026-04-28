package com.fintrack.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key:}")
    private String apiKey;

    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String callGemini(String prompt) {
        return callGemini(prompt, "");
    }

    public String callGemini(String prompt, String fallback) {
        if (!isAvailable()) {
            return fallback;
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", prompt))
                        )
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);

            JsonNode root = response.getBody();
            if (root == null) {
                return fallback;
            }

            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode()) {
                return fallback;
            }

            String result = textNode.asText("").trim();
            return result.isBlank() ? fallback : result;
        } catch (Exception ignored) {
            return fallback;
        }
    }

    public Map<String, Object> parseJsonObject(String responseText) {
        try {
            String cleaned = responseText
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            return objectMapper.readValue(cleaned, Map.class);
        } catch (Exception e) {
            return Map.of();
        }
    }
}
