package com.ai.recruitment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class RecruitmentServiceApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(RecruitmentServiceApplication.class, args);
    }

    private static void loadDotEnv() {
        try {
            if (Files.exists(Paths.get(".env"))) {
                List<String> lines = Files.readAllLines(Paths.get(".env"));
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    
                    // Handle PowerShell syntax if present
                    if (line.startsWith("$env:")) {
                        line = line.substring(5).trim();
                    }
                    
                    int equalsIndex = line.indexOf("=");
                    if (equalsIndex > 0) {
                        String key = line.substring(0, equalsIndex).trim();
                        String val = line.substring(equalsIndex + 1).trim();
                        
                        // Strip surrounding quotes
                        if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
                            val = val.substring(1, val.length() - 1);
                        } else if (val.startsWith("'") && val.endsWith("'") && val.length() >= 2) {
                            val = val.substring(1, val.length() - 1);
                        }
                        
                        if (!key.isEmpty()) {
                            System.setProperty(key, val);
                        }
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Could not load .env file: " + e.getMessage());
        }
    }
}
