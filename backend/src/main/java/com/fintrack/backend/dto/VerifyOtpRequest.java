package com.fintrack.backend.dto;

import lombok.*;

@Getter
@Setter
public class VerifyOtpRequest {

    private String email;

    private String otp;

}
