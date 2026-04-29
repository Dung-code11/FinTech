package com.fintrack.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DotenvConfig {
    public static void load() {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        setPropertyIfMissing("SQL_URL", dotenv);
        setPropertyIfMissing("SQL_USERNAME", dotenv);
        setPropertyIfMissing("SQL_PASSWORD", dotenv);
        setPropertyIfMissing("JWT_SECRET_KEY", dotenv);
        setPropertyIfMissing("MAIL_USERNAME", dotenv);
        setPropertyIfMissing("MAIL_PASSWORD", dotenv);
        setPropertyIfMissing("GEMINI_API_KEY", dotenv);
        setPropertyIfMissing("SERVER_ADDRESS", dotenv);
        setPropertyIfMissing("SERVER_PORT", dotenv);
    }

    private static void setPropertyIfMissing(String key, Dotenv dotenv) {
        String current = System.getProperty(key);
        if (current != null && !current.isBlank()) {
            return;
        }

        String env = System.getenv(key);
        if (env != null && !env.isBlank()) {
            System.setProperty(key, env);
            return;
        }

        String value = dotenv.get(key, null);
        if (value != null && !value.isBlank()) {
            System.setProperty(key, value);
        }
    }
}
