package com.fintrack.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DotenvConfig {
    public static void load() {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        setSystemPropertyIfPresent("SQL_URL", getenvOrDotenv(dotenv, "SQL_URL"));
        setSystemPropertyIfPresent("SQL_USERNAME", getenvOrDotenv(dotenv, "SQL_USERNAME"));
        setSystemPropertyIfPresent("SQL_PASSWORD", getenvOrDotenv(dotenv, "SQL_PASSWORD"));
        setSystemPropertyIfPresent("JWT_SECRET_KEY", getenvOrDotenv(dotenv, "JWT_SECRET_KEY"));
        setSystemPropertyIfPresent("MAIL_USERNAME", getenvOrDotenv(dotenv, "MAIL_USERNAME"));
        setSystemPropertyIfPresent("MAIL_PASSWORD", getenvOrDotenv(dotenv, "MAIL_PASSWORD"));
        setSystemPropertyIfPresent("GEMINI_API_KEY", getenvOrDotenv(dotenv, "GEMINI_API_KEY"));
    }

    private static String getenvOrDotenv(Dotenv dotenv, String key) {
        String envValue = System.getenv(key);
        if (envValue != null && !envValue.isBlank()) {
            return envValue;
        }

        String fileValue = dotenv.get(key, "");
        if (fileValue != null && !fileValue.isBlank()) {
            return fileValue;
        }

        return null;
    }

    private static void setSystemPropertyIfPresent(String key, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        System.setProperty(key, value);
    }
}
