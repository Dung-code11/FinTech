package com.fintrack.backend.service;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final String API_KEY;

    public GeminiService() {
        Dotenv dotenv = Dotenv.load();
        this.API_KEY = dotenv.get("GEMINI_API_KEY");

        if (this.API_KEY == null || this.API_KEY.isEmpty()) {
            throw new RuntimeException("❌ GEMINI_API_KEY not found in .env");
        }
    }
    public String callGemini(String prompt){

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, request, Map.class);

            List candidates = (List) response.getBody().get("candidates");
            Map first = (Map) candidates.get(0);
            Map content = (Map) first.get("content");
            List parts = (List) content.get("parts");

            return (String) ((Map) parts.get(0)).get("text");

        } catch (Exception e){
            e.printStackTrace();
            return "❌ Gemini error: " + e.getMessage();
        }
    }
}