package com.fintrack.backend.service;

import com.fintrack.backend.dto.LoginRequest;
import com.fintrack.backend.dto.RegisterRequest;
import com.fintrack.backend.dto.Response.LoginResponse;
import com.fintrack.backend.enums.Role;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.InfoUser;
import com.fintrack.backend.model.PasswordResetOtp;
import com.fintrack.backend.repository.AccountRepository;
import com.fintrack.backend.repository.InfoUserRepository;
import com.fintrack.backend.repository.OtpRepository;
import com.fintrack.backend.sercurity.HashUtil;
import com.fintrack.backend.util.OtpGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private InfoUserRepository infoUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;


    public void register(RegisterRequest request) {

        // Tạo account
        Account account = new Account();

        account.setId(UUID.randomUUID().toString());
        account.setUsername(request.username);
        account.setPassword(passwordEncoder.encode(request.password));
        account.setRole(Role.USER);

        accountRepository.save(account);

        // Tạo thông tin user
        InfoUser info = new InfoUser();
        info.setFullname(request.fullname);
        info.setEmail(request.email);
        info.setBirthday(request.birthday);
        info.setSex(request.sex);
        info.setAddress(request.address);
        info.setPhone(request.phone);

        // liên kết account
        info.setAccount(account);

        infoUserRepository.save(info);
    }

    public LoginResponse login(LoginRequest request) {

        Account account = accountRepository
                .findByLogin(request.login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.password, account.getPassword())) {
            throw new RuntimeException("Password incorrect");
        }

        String token = jwtService.generateToken(account);

        LoginResponse response = new LoginResponse();
        response.accessToken = token;
        response.userId = account.getId();
        response.username = account.getUsername();
        response.role = account.getRole();

        return response;
    }
    public void sendOtp(String email){

        InfoUser infoUser = infoUserRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String otp = OtpGenerator.generateOtp();

        String otpHash = HashUtil.sha256(otp);

        PasswordResetOtp entity = new PasswordResetOtp();

        entity.setEmail(email);
        entity.setOtpHash(otpHash);
        entity.setUsed(false);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        otpRepository.save(entity);

        emailService.sendOtpEmail(email, otp);
    }
    public void verifyOtp(String email, String otp){

        PasswordResetOtp record =
                otpRepository
                        .findTopByEmailOrderByCreatedAtDesc(email)
                        .orElseThrow(() -> new RuntimeException("OTP not found"));

        if(record.isUsed())
            throw new RuntimeException("OTP already used");

        if(record.getExpiryTime().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP expired");

        String otpHash = HashUtil.sha256(otp);

        if(!record.getOtpHash().equals(otpHash))
            throw new RuntimeException("Invalid OTP");

        record.setUsed(true);

        otpRepository.save(record);
    }
    public void resetPassword(String email,String newPassword){

        InfoUser infoUser = infoUserRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = infoUser.getAccount();

        account.setPassword(passwordEncoder.encode(newPassword));

        accountRepository.save(account);
    }
}