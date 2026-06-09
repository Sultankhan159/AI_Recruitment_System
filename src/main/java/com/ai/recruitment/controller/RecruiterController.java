package com.ai.recruitment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/recruiter")
@PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
public class RecruiterController {

    @PostMapping("/jobs")
    public ResponseEntity<?> postJob(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Job posting created: " + title);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/candidates")
    public ResponseEntity<?> listCandidates() {
        List<Map<String, String>> candidates = new ArrayList<>();
        Map<String, String> candidate1 = new HashMap<>();
        candidate1.put("email", "john.doe@example.com");
        candidate1.put("name", "John Doe");
        candidate1.put("matchScore", "94%");
        candidates.add(candidate1);

        return ResponseEntity.ok(candidates);
    }
}
