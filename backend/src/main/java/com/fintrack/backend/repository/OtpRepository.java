package com.fintrack.backend.repository;

import com.fintrack.backend.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<PasswordResetOtp,Integer> {

    Optional<PasswordResetOtp>
    findTopByEmailOrderByCreatedAtDesc(String email);

}
