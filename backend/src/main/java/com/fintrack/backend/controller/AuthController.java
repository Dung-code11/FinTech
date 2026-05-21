package com.fintrack.backend.controller;

import com.fintrack.backend.dto.*;
import com.fintrack.backend.dto.Response.LoginResponse;
import com.fintrack.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request){

        authService.register(request);

        return "Register success";
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request){

        return authService.login(request);
    }
    @PostMapping("/forgot-password")
    public String forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ){

        authService.sendOtp(request.getEmail());

        return "OTP sent to email";

    }

    @PostMapping("/verify-otp")
    public String verifyOtp(
            @RequestBody VerifyOtpRequest request
    ){

        authService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        return "OTP verified";

    }

    @PostMapping("/reset-password")
    public String resetPassword(
            @RequestBody ResetPasswordRequest request
    ){

        authService.resetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword()
        );

        return "Password updated";

    }
    @PutMapping("/admin/account/{id}/status")
    public String updateStatus(@PathVariable String id,
                               @RequestParam boolean status) {

        authService.toggleAccount(id, status);

        return "Updated successfully";
    }
}
