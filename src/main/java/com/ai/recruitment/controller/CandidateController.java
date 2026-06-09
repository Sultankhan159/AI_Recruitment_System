package com.ai.recruitment.controller;

import com.ai.recruitment.dto.*;
import com.ai.recruitment.security.services.UserDetailsImpl;
import com.ai.recruitment.service.CandidateProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/candidate")
@PreAuthorize("hasRole('CANDIDATE') or hasRole('RECRUITER') or hasRole('ADMIN')")
public class CandidateController {

    @Autowired
    private CandidateProfileService candidateProfileService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new RuntimeException("User not authenticated");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getCandidateProfile() {
        try {
            Long userId = getCurrentUserId();
            CandidateDto profile = candidateProfileService.getOrCreateCandidateProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateCandidateProfile(@RequestBody CandidateDto candidateDto) {
        try {
            Long userId = getCurrentUserId();
            CandidateDto updated = candidateProfileService.updateCandidateProfile(userId, candidateDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Education
    @PostMapping("/education")
    public ResponseEntity<?> addEducation(@RequestBody EducationDto educationDto) {
        try {
            Long userId = getCurrentUserId();
            EducationDto created = candidateProfileService.addEducation(userId, educationDto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<?> updateEducation(@PathVariable Long id, @RequestBody EducationDto educationDto) {
        try {
            Long userId = getCurrentUserId();
            EducationDto updated = candidateProfileService.updateEducation(userId, id, educationDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<?> deleteEducation(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            candidateProfileService.deleteEducation(userId, id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Education successfully deleted");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Experience
    @PostMapping("/experience")
    public ResponseEntity<?> addExperience(@RequestBody ExperienceDto experienceDto) {
        try {
            Long userId = getCurrentUserId();
            ExperienceDto created = candidateProfileService.addExperience(userId, experienceDto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<?> updateExperience(@PathVariable Long id, @RequestBody ExperienceDto experienceDto) {
        try {
            Long userId = getCurrentUserId();
            ExperienceDto updated = candidateProfileService.updateExperience(userId, id, experienceDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            candidateProfileService.deleteExperience(userId, id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Experience successfully deleted");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Skills
    @PostMapping("/skills")
    public ResponseEntity<?> addSkill(@RequestBody CandidateSkillDto skillDto) {
        try {
            Long userId = getCurrentUserId();
            CandidateSkillDto created = candidateProfileService.addSkill(userId, skillDto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            candidateProfileService.deleteSkill(userId, id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Skill successfully deleted");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Certifications
    @PostMapping("/certifications")
    public ResponseEntity<?> addCertification(@RequestBody CertificationDto certificationDto) {
        try {
            Long userId = getCurrentUserId();
            CertificationDto created = candidateProfileService.addCertification(userId, certificationDto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/certifications/{id}")
    public ResponseEntity<?> updateCertification(@PathVariable Long id, @RequestBody CertificationDto certificationDto) {
        try {
            Long userId = getCurrentUserId();
            CertificationDto updated = candidateProfileService.updateCertification(userId, id, certificationDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/certifications/{id}")
    public ResponseEntity<?> deleteCertification(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            candidateProfileService.deleteCertification(userId, id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Certification successfully deleted");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyForJob(@RequestBody Map<String, String> request) {
        String jobId = request.get("jobId");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Successfully applied to job: " + jobId);
        return ResponseEntity.ok(response);
    }
}

