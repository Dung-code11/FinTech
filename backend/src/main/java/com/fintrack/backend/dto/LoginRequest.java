package com.fintrack.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {

    public String login;
    public String password;
}