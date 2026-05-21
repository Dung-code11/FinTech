package com.fintrack.backend.controller;

import com.fintrack.backend.model.Account;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/user", "/user"})
public class UserController {

    @GetMapping("/profile")
    public Object profile(Authentication authentication){

        Account account = (Account) authentication.getPrincipal();

        Map<String,Object> response = new HashMap<>();

        response.put("id",account.getId());
        response.put("username",account.getUsername());
        response.put("role",account.getRole());

        return response;
    }
}
