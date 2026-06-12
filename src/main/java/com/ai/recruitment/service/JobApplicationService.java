package com.ai.recruitment.service;

import com.ai.recruitment.dto.JobApplicationDto;
import com.ai.recruitment.model.*;
import com.ai.recruitment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobApplicationService {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private AiService aiService;

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    public JobApplicationDto applyToJob(Long candidateUserId, Long jobId) {
        Candidate candidate = candidateRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found. Please set up profile details first."));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job listing not found with id: " + jobId));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new RuntimeException("This job listing is no longer open for applications.");
        }

        if (jobApplicationRepository.existsByJobIdAndCandidateId(jobId, candidate.getId())) {
            throw new RuntimeException("You have already applied for this job listing.");
        }

        JobApplication application = JobApplication.builder()
                .job(job)
                .candidate(candidate)
                .status(ApplicationStatus.APPLIED)
                .resumeUrl(candidate.getResumeUrl())
                .build();

        // Evaluate AI Match score & summary
        try {
            // Build profile text fallback/addition
            StringBuilder profileTextBuilder = new StringBuilder();
            if (candidate.getSummary() != null) {
                profileTextBuilder.append("Summary:\n").append(candidate.getSummary()).append("\n\n");
            }
            if (candidate.getSkills() != null && !candidate.getSkills().isEmpty()) {
                profileTextBuilder.append("Skills:\n");
                for (CandidateSkill skill : candidate.getSkills()) {
                    profileTextBuilder.append("- ").append(skill.getName());
                    if (skill.getProficiencyLevel() != null) {
                        profileTextBuilder.append(" (").append(skill.getProficiencyLevel()).append(")");
                    }
                    profileTextBuilder.append("\n");
                }
                profileTextBuilder.append("\n");
            }
            if (candidate.getEducation() != null && !candidate.getEducation().isEmpty()) {
                profileTextBuilder.append("Education:\n");
                for (Education edu : candidate.getEducation()) {
                    profileTextBuilder.append("- ").append(edu.getDegree()).append(" in ").append(edu.getFieldOfStudy())
                        .append(" from ").append(edu.getInstitution());
                    if (edu.getStartDate() != null) {
                        profileTextBuilder.append(" (").append(edu.getStartDate()).append(" - ").append(edu.getEndDate() != null ? edu.getEndDate() : "Present").append(")");
                    }
                    profileTextBuilder.append("\n");
                }
                profileTextBuilder.append("\n");
            }
            if (candidate.getExperience() != null && !candidate.getExperience().isEmpty()) {
                profileTextBuilder.append("Experience:\n");
                for (Experience exp : candidate.getExperience()) {
                    profileTextBuilder.append("- ").append(exp.getTitle()).append(" at ").append(exp.getCompany());
                    if (exp.getStartDate() != null) {
                        profileTextBuilder.append(" (").append(exp.getStartDate()).append(" - ").append(exp.getEndDate() != null ? exp.getEndDate() : "Present").append(")");
                    }
                    profileTextBuilder.append("\n");
                    if (exp.getDescription() != null) {
                        profileTextBuilder.append("  Description: ").append(exp.getDescription()).append("\n");
                    }
                }
                profileTextBuilder.append("\n");
            }

            String profileText = profileTextBuilder.toString();
            String resumeText = "";

            String resumeUrl = candidate.getResumeUrl();
            if (resumeUrl != null && !resumeUrl.isEmpty() && resumeUrl.startsWith("/uploads/")) {
                String filename = resumeUrl.substring("/uploads/".length());
                java.nio.file.Path filePath = java.nio.file.Paths.get("uploads").resolve(filename);
                if (java.nio.file.Files.exists(filePath)) {
                    try {
                        byte[] fileBytes = java.nio.file.Files.readAllBytes(filePath);
                        resumeText = resumeParserService.parsePdfFromBytes(fileBytes);
                    } catch (Exception e) {
                        System.err.println("Error parsing PDF resume: " + e.getMessage());
                    }
                }
            }

            if (resumeText == null || resumeText.trim().length() < 50) {
                resumeText = profileText;
            } else {
                resumeText = resumeText + "\n\n--- Candidate Profile ---\n" + profileText;
            }

            if (resumeText != null && !resumeText.trim().isEmpty()) {
                Map<String, Object> aiResult = aiService.evaluateApplication(
                        resumeText,
                        job.getTitle(),
                        job.getDescription(),
                        job.getRequirements()
                );
                if (aiResult != null) {
                    if (aiResult.containsKey("matchScore")) {
                        Object scoreObj = aiResult.get("matchScore");
                        if (scoreObj instanceof Number) {
                            application.setMatchScore(((Number) scoreObj).doubleValue());
                        } else if (scoreObj instanceof String) {
                            application.setMatchScore(Double.parseDouble((String) scoreObj));
                        }
                    }
                    if (aiResult.containsKey("aiSummary")) {
                        application.setAiSummary((String) aiResult.get("aiSummary"));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("AI evaluation of application failed gracefully: " + e.getMessage());
        }

        JobApplication saved = jobApplicationRepository.save(application);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getApplicationsForCandidate(Long candidateUserId) {
        Candidate candidate = candidateRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found."));

        return jobApplicationRepository.findByCandidateId(candidate.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getApplicationsForJob(Long recruiterId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job listing not found with id: " + jobId));

        if (!job.getPostedBy().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to view applications for this job.");
        }

        return jobApplicationRepository.findByJobId(jobId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getApplicationsForRecruiter(Long recruiterId) {
        return jobApplicationRepository.findByJobPostedById(recruiterId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public JobApplicationDto updateApplicationStatus(Long recruiterId, Long applicationId, String statusStr) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found with id: " + applicationId));

        if (!application.getJob().getPostedBy().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to update application status for this job.");
        }

        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus status;
        try {
            status = ApplicationStatus.valueOf(statusStr.toUpperCase());
            application.setStatus(status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid application status value: " + statusStr);
        }

        JobApplication saved = jobApplicationRepository.save(application);

        // Notify candidate of status change
        if (oldStatus != status) {
            try {
                User candidateUser = application.getCandidate().getUser();
                String jobTitle = application.getJob().getTitle();
                String message = "Your application status for " + jobTitle + " has been updated to " + status.name() + ".";
                
                notificationService.createNotification(candidateUser, message, "APPLICATION_STATUS");
                
                String fullName = (candidateUser.getFirstName() != null ? candidateUser.getFirstName() : "") + " " + 
                                  (candidateUser.getLastName() != null ? candidateUser.getLastName() : "");
                emailService.sendApplicationStatusUpdateEmail(
                    candidateUser.getEmail(),
                    fullName.trim(),
                    jobTitle,
                    status.name()
                );
            } catch (Exception e) {
                System.err.println("Failed to trigger application status update alerts: " + e.getMessage());
            }
        }

        return mapToDto(saved);
    }

    public JobApplicationDto mapToDto(JobApplication app) {
        String candName = "";
        String candEmail = "";
        if (app.getCandidate() != null && app.getCandidate().getUser() != null) {
            String first = app.getCandidate().getUser().getFirstName() != null ? app.getCandidate().getUser().getFirstName() : "";
            String last = app.getCandidate().getUser().getLastName() != null ? app.getCandidate().getUser().getLastName() : "";
            candName = (first + " " + last).trim();
            candEmail = app.getCandidate().getUser().getEmail();
        }

        return JobApplicationDto.builder()
                .id(app.getId())
                .jobId(app.getJob() != null ? app.getJob().getId() : null)
                .jobTitle(app.getJob() != null ? app.getJob().getTitle() : null)
                .jobLocation(app.getJob() != null ? app.getJob().getLocation() : null)
                .candidateId(app.getCandidate() != null ? app.getCandidate().getId() : null)
                .candidateName(candName)
                .candidateEmail(candEmail)
                .appliedAt(app.getAppliedAt())
                .status(app.getStatus().name())
                .resumeUrl(app.getResumeUrl())
                .matchScore(app.getMatchScore())
                .aiSummary(app.getAiSummary())
                .build();
    }
}
