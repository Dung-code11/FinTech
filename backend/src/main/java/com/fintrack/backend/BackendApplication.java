package com.fintrack.backend;

import com.fintrack.backend.config.DotenvConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
        DotenvConfig.load();
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        String hash = "$2a$10$d6C2tffh66dywOb4btYRIOuwpG2PrbZ7BprrcMm59aHTEWp24Z92y";

        System.out.println(encoder.matches("123123aa!", hash));
        SpringApplication.run(BackendApplication.class, args);

	}

}
