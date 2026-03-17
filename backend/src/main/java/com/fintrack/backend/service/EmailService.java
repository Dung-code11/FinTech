package com.fintrack.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.file.Files;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private String loadTemplate() {

        try {

            ClassPathResource resource =
                    new ClassPathResource("templates/reset-password-email.html");

            return new String(resource.getInputStream().readAllBytes());

        } catch (Exception e) {

            throw new RuntimeException("Cannot load email template", e);

        }
    }

    public void sendOtpEmail(String email, String otp) {

        try {

            String html = loadTemplate();

            html = html.replace("{{OTP_CODE}}", otp);

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Reset your password");
            helper.setText(html, true);

            mailSender.send(message);

        } catch (Exception e) {

            throw new RuntimeException("Failed to send email", e);

        }
    }
}