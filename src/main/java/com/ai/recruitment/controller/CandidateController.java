package com.ai.recruitment.controller;

import com.ai.recruitment.dto.*;
import com.ai.recruitment.security.services.UserDetailsImpl;
import com.ai.recruitment.service.CandidateProfileService;
import com.ai.recruitment.service.JobApplicationService;
import com.ai.recruitment.service.FileStorageService;
import com.ai.recruitment.service.ResumeParserService;
import com.ai.recruitment.service.AiService;
import com.ai.recruitment.service.InterviewService;
import com.ai.recruitment.service.NotificationService;
import com.ai.recruitment.service.RecommendationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/candidate")
@PreAuthorize("hasRole('CANDIDATE') or hasRole('RECRUITER') or hasRole('ADMIN')")
public class CandidateController {

    @Autowired
    private CandidateProfileService candidateProfileService;

    @Autowired
    private JobApplicationService jobApplicationService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private AiService aiService;

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RecommendationService recommendationService;

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
        try {
            Long userId = getCurrentUserId();
            String jobIdStr = request.get("jobId");
            if (jobIdStr == null || jobIdStr.trim().isEmpty()) {
                throw new RuntimeException("Job ID is required");
            }
            Long jobId = Long.parseLong(jobIdStr);
            JobApplicationDto application = jobApplicationService.applyToJob(userId, jobId);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Successfully applied to job!");
            response.put("application", application);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getAppliedJobs() {
        try {
            Long userId = getCurrentUserId();
            List<JobApplicationDto> applications = jobApplicationService.getApplicationsForCandidate(userId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/interviews")
    public ResponseEntity<?> getInterviews() {
        try {
            Long userId = getCurrentUserId();
            List<InterviewDto> interviews = interviewService.getInterviewsForCandidate(userId);
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        try {
            Long userId = getCurrentUserId();
            List<NotificationDto> notifications = notificationService.getNotificationsForUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            NotificationDto notification = notificationService.markAsRead(userId, id);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            notificationService.deleteNotification(userId, id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Notification deleted successfully");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/resume/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            Long userId = getCurrentUserId();
            
            // 1. Save file to disk
            String fileUrl = fileStorageService.storeFile(file);
            
            // 2. Parse PDF text
            String text = resumeParserService.parsePdf(file);
            
            // 3. Update candidate resumeUrl in DB
            CandidateDto profile = candidateProfileService.getOrCreateCandidateProfile(userId);
            profile.setResumeUrl(fileUrl);
            
            // 4. Extract profile details via AI if possible
            Map<String, Object> aiExtracted = aiService.extractProfileDetails(text);
            if (aiExtracted != null) {
                // If AI extracted a phone number, update it
                if (aiExtracted.containsKey("phone")) {
                    String phone = (String) aiExtracted.get("phone");
                    if (phone != null && !phone.trim().isEmpty()) {
                        profile.setPhone(phone);
                    }
                }
                
                // If AI extracted a summary, update it
                if (aiExtracted.containsKey("summary")) {
                    String summary = (String) aiExtracted.get("summary");
                    if (summary != null && !summary.trim().isEmpty()) {
                        profile.setSummary(summary);
                    }
                }
                
                // Save updated candidate profile basic info
                profile = candidateProfileService.updateCandidateProfile(userId, profile);
                
                // If AI extracted skills, add them
                if (aiExtracted.containsKey("skills")) {
                    Object skillsObj = aiExtracted.get("skills");
                    if (skillsObj instanceof List) {
                        List<?> rawList = (List<?>) skillsObj;
                        for (Object item : rawList) {
                            if (item instanceof Map) {
                                Map<?, ?> skillMap = (Map<?, ?>) item;
                                Object nameObj = skillMap.get("name");
                                Object levelObj = skillMap.get("proficiencyLevel");
                                String skillName = nameObj != null ? nameObj.toString() : null;
                                String level = levelObj != null ? levelObj.toString() : "Intermediate";
                                
                                if (skillName != null && !skillName.trim().isEmpty()) {
                                    // Check if user already has this skill to prevent duplicates
                                    boolean exists = false;
                                    if (profile.getSkills() != null) {
                                        for (CandidateSkillDto existingSkill : profile.getSkills()) {
                                            if (existingSkill.getName().equalsIgnoreCase(skillName)) {
                                                exists = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (!exists) {
                                        CandidateSkillDto skillDto = CandidateSkillDto.builder()
                                                .name(skillName)
                                                .proficiencyLevel(level)
                                                .build();
                                        candidateProfileService.addSkill(userId, skillDto);
                                    }
                                }
                            }
                        }
                    }
                }

                // If AI extracted education, add them
                if (aiExtracted.containsKey("education")) {
                    Object eduObj = aiExtracted.get("education");
                    if (eduObj instanceof List) {
                        List<?> rawList = (List<?>) eduObj;
                        for (Object item : rawList) {
                            if (item instanceof Map) {
                                Map<?, ?> eduMap = (Map<?, ?>) item;
                                String institution = getMapString(eduMap, "institution");
                                String degree = getMapString(eduMap, "degree");
                                String field = getMapString(eduMap, "fieldOfStudy");
                                String grade = getMapString(eduMap, "grade");
                                String startStr = getMapString(eduMap, "startDate");
                                String endStr = getMapString(eduMap, "endDate");
                                
                                if (institution != null && !institution.trim().isEmpty() && degree != null && !degree.trim().isEmpty()) {
                                    boolean exists = false;
                                    if (profile.getEducation() != null) {
                                        for (EducationDto existingEdu : profile.getEducation()) {
                                            if (existingEdu.getInstitution().equalsIgnoreCase(institution) && existingEdu.getDegree().equalsIgnoreCase(degree)) {
                                                exists = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (!exists) {
                                        EducationDto eduDto = EducationDto.builder()
                                                .institution(institution)
                                                .degree(degree)
                                                .fieldOfStudy(field)
                                                .grade(grade)
                                                .startDate(parseLocalDate(startStr))
                                                .endDate(parseLocalDate(endStr))
                                                .build();
                                        candidateProfileService.addEducation(userId, eduDto);
                                    }
                                }
                            }
                        }
                    }
                }

                // If AI extracted experience, add them
                if (aiExtracted.containsKey("experience")) {
                    Object expObj = aiExtracted.get("experience");
                    if (expObj instanceof List) {
                        List<?> rawList = (List<?>) expObj;
                        for (Object item : rawList) {
                            if (item instanceof Map) {
                                Map<?, ?> expMap = (Map<?, ?>) item;
                                String company = getMapString(expMap, "company");
                                String title = getMapString(expMap, "title");
                                String location = getMapString(expMap, "location");
                                String desc = getMapString(expMap, "description");
                                String startStr = getMapString(expMap, "startDate");
                                String endStr = getMapString(expMap, "endDate");
                                Object currentObj = expMap.get("current");
                                boolean current = currentObj instanceof Boolean ? (Boolean) currentObj : false;
                                
                                if (company != null && !company.trim().isEmpty() && title != null && !title.trim().isEmpty()) {
                                    boolean exists = false;
                                    if (profile.getExperience() != null) {
                                        for (ExperienceDto existingExp : profile.getExperience()) {
                                            if (existingExp.getCompany().equalsIgnoreCase(company) && existingExp.getTitle().equalsIgnoreCase(title)) {
                                                exists = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (!exists) {
                                        ExperienceDto expDto = ExperienceDto.builder()
                                                .company(company)
                                                .title(title)
                                                .location(location)
                                                .description(desc)
                                                .startDate(parseLocalDate(startStr))
                                                .endDate(parseLocalDate(endStr))
                                                .current(current)
                                                .build();
                                        candidateProfileService.addExperience(userId, expDto);
                                    }
                                }
                            }
                        }
                    }
                }

                // If AI extracted certifications, add them
                if (aiExtracted.containsKey("certifications")) {
                    Object certObj = aiExtracted.get("certifications");
                    if (certObj instanceof List) {
                        List<?> rawList = (List<?>) certObj;
                        for (Object item : rawList) {
                            if (item instanceof Map) {
                                Map<?, ?> certMap = (Map<?, ?>) item;
                                String name = getMapString(certMap, "name");
                                String org = getMapString(certMap, "issuingOrganization");
                                String startStr = getMapString(certMap, "issueDate");
                                String endStr = getMapString(certMap, "expirationDate");
                                String credId = getMapString(certMap, "credentialId");
                                String credUrl = getMapString(certMap, "credentialUrl");
                                
                                if (name != null && !name.trim().isEmpty() && org != null && !org.trim().isEmpty()) {
                                    boolean exists = false;
                                    if (profile.getCertifications() != null) {
                                        for (CertificationDto existingCert : profile.getCertifications()) {
                                            if (existingCert.getName().equalsIgnoreCase(name)) {
                                                exists = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (!exists) {
                                        CertificationDto certDto = CertificationDto.builder()
                                                .name(name)
                                                .issuingOrganization(org)
                                                .issueDate(parseLocalDate(startStr))
                                                .expirationDate(parseLocalDate(endStr))
                                                .credentialId(credId)
                                                .credentialUrl(credUrl)
                                                .build();
                                        candidateProfileService.addCertification(userId, certDto);
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Re-fetch the fully updated profile to return to frontend
                profile = candidateProfileService.getOrCreateCandidateProfile(userId);
            } else {
                // Just save the profile with updated resumeUrl
                profile = candidateProfileService.updateCandidateProfile(userId, profile);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("resumeUrl", fileUrl);
            response.put("profile", profile);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    private String getMapString(Map<?, ?> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : null;
    }

    private java.time.LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        try {
            dateStr = dateStr.trim();
            if (dateStr.matches("^\\d{4}$")) {
                return java.time.LocalDate.of(Integer.parseInt(dateStr), 1, 1);
            }
            if (dateStr.matches("^\\d{4}-\\d{2}$")) {
                return java.time.LocalDate.parse(dateStr + "-01");
            }
            return java.time.LocalDate.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations() {
        try {
            Long userId = getCurrentUserId();
            return ResponseEntity.ok(recommendationService.getJobRecommendations(userId));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}

