package com.ai.recruitment.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String uploadDir = "uploads";

    public FileStorageService() {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    public String storeFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Generate unique name to prevent collisions
        String fileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = Paths.get(uploadDir).toAbsolutePath().resolve(fileName);
        
        Files.copy(file.getInputStream(), targetLocation);
        
        // Return relative access URL
        return "/uploads/" + fileName;
    }
}
