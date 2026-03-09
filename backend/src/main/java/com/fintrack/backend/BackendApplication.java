package com.fintrack.backend;

import com.fintrack.backend.config.DotenvConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
        DotenvConfig.load();
        SpringApplication.run(BackendApplication.class, args);
	}

}
