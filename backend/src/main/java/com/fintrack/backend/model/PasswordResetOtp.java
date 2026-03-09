package com.fintrack.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_otp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String otpHash;

    @Column(name = "expiry_time")
    private LocalDateTime expiryTime;

    private boolean used;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}