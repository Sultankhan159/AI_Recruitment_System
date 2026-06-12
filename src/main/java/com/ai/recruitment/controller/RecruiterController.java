package com.ai.recruitment.controller;

import com.ai.recruitment.dto.JobDto;
import com.ai.recruitment.dto.JobApplicationDto;
import com.ai.recruitment.dto.InterviewDto;
import com.ai.recruitment.security.services.UserDetailsImpl;
import com.ai.recruitment.service.JobService;
import com.ai.recruitment.service.JobApplicationService;
import com.ai.recruitment.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/recruiter")
@PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
public class RecruiterController {

    @Autowired
    private JobService jobService;

    @Autowired
    private JobApplicationService jobApplicationService;

    @Autowired
    private InterviewService interviewService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new RuntimeException("User not authenticated");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> postJob(@RequestBody Map<String, String> request) {
        try {
            Long recruiterId = getCurrentUserId();
            String title = request.get("title");
            String description = request.get("description");
            String requirements = request.get("requirements");
            String location = request.get("location");
            String salary = request.get("salary");

            if (title == null || title.trim().isEmpty()) {
                throw new RuntimeException("Job title is required");
            }
            if (description == null || description.trim().isEmpty()) {
                throw new RuntimeException("Job description is required");
            }

            JobDto jobDto = JobDto.builder()
                    .title(title)
                    .description(description)
                    .requirements(requirements)
                    .location(location)
                    .salary(salary)
                    .build();

            JobDto created = jobService.createJob(recruiterId, jobDto);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Job posting created successfully: " + created.getTitle());
            response.put("job", created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/candidates")
    public ResponseEntity<?> listCandidates() {
        try {
            Long recruiterId = getCurrentUserId();
            List<JobApplicationDto> applications = jobApplicationService.getApplicationsForRecruiter(recruiterId);
            
            // Map to the format the frontend dashboard expects
            List<Map<String, Object>> result = new ArrayList<>();
            for (JobApplicationDto app : applications) {
                Map<String, Object> candMap = new HashMap<>();
                candMap.put("applicationId", app.getId());
                candMap.put("jobId", app.getJobId());
                candMap.put("jobTitle", app.getJobTitle());
                candMap.put("email", app.getCandidateEmail());
                candMap.put("name", app.getCandidateName());
                candMap.put("status", app.getStatus());
                candMap.put("resumeUrl", app.getResumeUrl());
                candMap.put("aiSummary", app.getAiSummary());
                
                // Format match score for compatibility (e.g. 94% or Pending)
                if (app.getMatchScore() != null) {
                    candMap.put("matchScore", Math.round(app.getMatchScore()) + "%");
                } else {
                    candMap.put("matchScore", "Pending");
                }
                
                result.add(candMap);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Long recruiterId = getCurrentUserId();
            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                throw new RuntimeException("Status is required");
            }
            JobApplicationDto updated = jobApplicationService.updateApplicationStatus(recruiterId, id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/applications/{id}/interviews")
    public ResponseEntity<?> scheduleInterview(@PathVariable Long id, @RequestBody InterviewDto interviewDto) {
        try {
            Long recruiterId = getCurrentUserId();
            InterviewDto scheduled = interviewService.scheduleInterview(recruiterId, id, interviewDto);
            return ResponseEntity.ok(scheduled);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/interviews/{id}/generate-questions")
    public ResponseEntity<?> generateQuestions(@PathVariable Long id) {
        try {
            Long recruiterId = getCurrentUserId();
            InterviewDto updated = interviewService.generateAiQuestionsForInterview(recruiterId, id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/applications/{id}/interviews")
    public ResponseEntity<?> listInterviewsForApplication(@PathVariable Long id) {
        try {
            Long recruiterId = getCurrentUserId();
            List<InterviewDto> interviews = interviewService.getInterviewsForApplication(recruiterId, id);
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/interviews/{id}/status")
    public ResponseEntity<?> updateInterviewStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Long recruiterId = getCurrentUserId();
            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                throw new RuntimeException("Status is required");
            }
            InterviewDto updated = interviewService.updateInterviewStatus(recruiterId, id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        try {
            Long recruiterId = getCurrentUserId();
            
            List<JobDto> recruiterJobs = jobService.getJobsByRecruiter(recruiterId);
            List<JobApplicationDto> recruiterApps = jobApplicationService.getApplicationsForRecruiter(recruiterId);
            
            long totalJobs = recruiterJobs.size();
            long totalApplications = recruiterApps.size();
            
            // Calculate average match score
            double totalScoreSum = 0.0;
            int scoreCount = 0;
            for (JobApplicationDto app : recruiterApps) {
                if (app.getMatchScore() != null) {
                    totalScoreSum += app.getMatchScore();
                    scoreCount++;
                }
            }
            double averageMatchScore = scoreCount > 0 ? (totalScoreSum / scoreCount) : 0.0;
            
            // Calculate status breakdown
            Map<String, Long> statusBreakdown = recruiterApps.stream()
                    .collect(Collectors.groupingBy(JobApplicationDto::getStatus, Collectors.counting()));
            
            // Calculate average match score per job title
            Map<String, List<Double>> jobScoresMap = new HashMap<>();
            for (JobApplicationDto app : recruiterApps) {
                if (app.getJobTitle() != null && app.getMatchScore() != null) {
                    jobScoresMap.computeIfAbsent(app.getJobTitle(), k -> new ArrayList<>()).add(app.getMatchScore());
                }
            }
            
            Map<String, Double> jobMatchScores = new HashMap<>();
            for (Map.Entry<String, List<Double>> entry : jobScoresMap.entrySet()) {
                double sum = 0.0;
                for (Double val : entry.getValue()) {
                    sum += val;
                }
                double avg = sum / entry.getValue().size();
                jobMatchScores.put(entry.getKey(), Math.round(avg * 10.0) / 10.0);
            }
            
            // Ensure all recruiter jobs are in jobMatchScores even if they have no applications
            for (JobDto job : recruiterJobs) {
                if (!jobMatchScores.containsKey(job.getTitle())) {
                    jobMatchScores.put(job.getTitle(), 0.0);
                }
            }
            
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalJobs", totalJobs);
            analytics.put("totalApplications", totalApplications);
            analytics.put("averageMatchScore", Math.round(averageMatchScore * 10.0) / 10.0);
            analytics.put("statusBreakdown", statusBreakdown);
            analytics.put("jobMatchScores", jobMatchScores);
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
