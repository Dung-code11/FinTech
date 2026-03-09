package com.fintrack.backend.dto;

import com.fintrack.backend.enums.Sex;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    public String username;
    public String password;

    public String fullname;

    public LocalDate birthday;
    public Sex sex;

    public String address;

    public String email;

    public String phone;
}