package com.fintrack.backend.controller;

import com.fintrack.backend.dto.ChatRequest;

import com.fintrack.backend.dto.Response.ChatResponse;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest req,
                             Authentication auth){

        Account acc = (Account) auth.getPrincipal();

        String reply = aiService.chat(req.message, acc.getId());

        return new ChatResponse(reply);
    }
}