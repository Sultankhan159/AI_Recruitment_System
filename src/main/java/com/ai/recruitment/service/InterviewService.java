package com.ai.recruitment.service;

import com.ai.recruitment.dto.InterviewDto;
import com.ai.recruitment.model.*;
import com.ai.recruitment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private AiService aiService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    public InterviewDto scheduleInterview(Long recruiterId, Long applicationId, InterviewDto dto) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found with id: " + applicationId));

        if (!application.getJob().getPostedBy().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized: You do not own this job listing.");
        }

        Interview interview = Interview.builder()
                .jobApplication(application)
                .title(dto.getTitle() != null ? dto.getTitle() : "Technical Interview")
                .scheduledAt(dto.getScheduledAt())
                .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 45)
                .location(dto.getLocation())
                .notes(dto.getNotes())
                .status(InterviewStatus.SCHEDULED)
                .build();

        Interview saved = interviewRepository.save(interview);
        
        // Also auto-generate questions at scheduling time if possible!
        try {
            String resumeText = getCandidateProfileText(application.getCandidate());
            String questions = aiService.generateInterviewQuestions(
                resumeText,
                application.getJob().getTitle(),
                application.getJob().getDescription(),
                application.getJob().getRequirements()
            );
            saved.setAiQuestions(questions);
            saved = interviewRepository.save(saved);
        } catch (Exception e) {
            System.err.println("Failed to auto-generate AI questions: " + e.getMessage());
        }

        // Notify candidate of scheduled interview
        try {
            User candidateUser = application.getCandidate().getUser();
            String candidateName = (candidateUser.getFirstName() != null ? candidateUser.getFirstName() : "") + " " +
                                   (candidateUser.getLastName() != null ? candidateUser.getLastName() : "");
            String jobTitle = application.getJob().getTitle();
            String timeStr = saved.getScheduledAt().toString();
            String message = "A new interview '" + saved.getTitle() + "' has been scheduled for " + jobTitle + " on " + timeStr + ".";
            
            notificationService.createNotification(candidateUser, message, "INTERVIEW_SCHEDULED");
            
            emailService.sendInterviewScheduledEmail(
                candidateUser.getEmail(),
                candidateName.trim(),
                jobTitle,
                saved.getTitle(),
                timeStr,
                saved.getLocation(),
                saved.getNotes()
            );
        } catch (Exception e) {
            System.err.println("Failed to trigger scheduled interview notification: " + e.getMessage());
        }

        return mapToDto(saved);
    }

    public InterviewDto generateAiQuestionsForInterview(Long recruiterId, Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + interviewId));

        JobApplication application = interview.getJobApplication();
        if (!application.getJob().getPostedBy().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to generate questions for this interview.");
        }

        String resumeText = getCandidateProfileText(application.getCandidate());
        String questions = aiService.generateInterviewQuestions(
            resumeText,
            application.getJob().getTitle(),
            application.getJob().getDescription(),
            application.getJob().getRequirements()
        );

        interview.setAiQuestions(questions);
        Interview saved = interviewRepository.save(interview);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getInterviewsForApplication(Long recruiterId, Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found."));

        if (!application.getJob().getPostedBy().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to view interviews for this application.");
        }

        return interviewRepository.findByJobApplicationId(applicationId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getInterviewsForCandidate(Long candidateUserId) {
        Candidate candidate = candidateRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found."));

        return interviewRepository.findByJobApplicationCandidateId(candidate.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public InterviewDto updateInterviewStatus(Long recruiterId, Long interviewId, String statusStr) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found."));

        if (!interview.getJobApplication().getJob().getPostedBy().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to update interview status.");
        }

        InterviewStatus oldStatus = interview.getStatus();
        InterviewStatus status;
        try {
            status = InterviewStatus.valueOf(statusStr.toUpperCase());
            interview.setStatus(status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid interview status value: " + statusStr);
        }

        Interview saved = interviewRepository.save(interview);

        // Notify candidate of interview status change
        if (oldStatus != status) {
            try {
                User candidateUser = interview.getJobApplication().getCandidate().getUser();
                String candidateName = (candidateUser.getFirstName() != null ? candidateUser.getFirstName() : "") + " " +
                                       (candidateUser.getLastName() != null ? candidateUser.getLastName() : "");
                String jobTitle = interview.getJobApplication().getJob().getTitle();
                String timeStr = saved.getScheduledAt().toString();
                
                if (status == InterviewStatus.CANCELLED) {
                    String message = "Your interview '" + saved.getTitle() + "' for " + jobTitle + " on " + timeStr + " has been CANCELLED.";
                    notificationService.createNotification(candidateUser, message, "INTERVIEW_CANCELLED");
                    
                    emailService.sendInterviewCancelledEmail(
                        candidateUser.getEmail(),
                        candidateName.trim(),
                        jobTitle,
                        saved.getTitle(),
                        timeStr
                    );
                } else if (status == InterviewStatus.COMPLETED) {
                    String message = "Your interview '" + saved.getTitle() + "' for " + jobTitle + " has been marked COMPLETED.";
                    notificationService.createNotification(candidateUser, message, "INTERVIEW_COMPLETED");
                }
            } catch (Exception e) {
                System.err.println("Failed to trigger interview update notification: " + e.getMessage());
            }
        }

        return mapToDto(saved);
    }

    private String getCandidateProfileText(Candidate candidate) {
        StringBuilder sb = new StringBuilder();
        if (candidate.getSummary() != null) {
            sb.append("Summary:\n").append(candidate.getSummary()).append("\n\n");
        }
        if (candidate.getSkills() != null && !candidate.getSkills().isEmpty()) {
            sb.append("Skills:\n");
            for (CandidateSkill skill : candidate.getSkills()) {
                sb.append("- ").append(skill.getName());
                if (skill.getProficiencyLevel() != null) {
                    sb.append(" (").append(skill.getProficiencyLevel()).append(")");
                }
                sb.append("\n");
            }
            sb.append("\n");
        }
        if (candidate.getEducation() != null && !candidate.getEducation().isEmpty()) {
            sb.append("Education:\n");
            for (Education edu : candidate.getEducation()) {
                sb.append("- ").append(edu.getDegree()).append(" in ").append(edu.getFieldOfStudy())
                  .append(" from ").append(edu.getInstitution());
                if (edu.getStartDate() != null) {
                    sb.append(" (").append(edu.getStartDate()).append(" - ").append(edu.getEndDate() != null ? edu.getEndDate() : "Present").append(")");
                }
                sb.append("\n");
            }
            sb.append("\n");
        }
        if (candidate.getExperience() != null && !candidate.getExperience().isEmpty()) {
            sb.append("Experience:\n");
            for (Experience exp : candidate.getExperience()) {
                sb.append("- ").append(exp.getTitle()).append(" at ").append(exp.getCompany());
                if (exp.getStartDate() != null) {
                    sb.append(" (").append(exp.getStartDate()).append(" - ").append(exp.getEndDate() != null ? exp.getEndDate() : "Present").append(")");
                }
                sb.append("\n");
                if (exp.getDescription() != null) {
                    sb.append("  Description: ").append(exp.getDescription()).append("\n");
                }
            }
            sb.append("\n");
        }

        String profileText = sb.toString();
        String resumeText = "";

        String resumeUrl = candidate.getResumeUrl();
        if (resumeUrl != null && !resumeUrl.isEmpty() && resumeUrl.startsWith("/uploads/")) {
            String filename = resumeUrl.substring("/uploads/".length());
            Path filePath = Paths.get("uploads").resolve(filename);
            if (Files.exists(filePath)) {
                try {
                    byte[] fileBytes = Files.readAllBytes(filePath);
                    resumeText = resumeParserService.parsePdfFromBytes(fileBytes);
                } catch (Exception e) {
                    System.err.println("Error parsing PDF resume for questions: " + e.getMessage());
                }
            }
        }

        if (resumeText == null || resumeText.trim().length() < 50) {
            return profileText;
        } else {
            return resumeText + "\n\n--- Candidate Profile ---\n" + profileText;
        }
    }

    private InterviewDto mapToDto(Interview interview) {
        String jobTitle = "";
        String candidateName = "";
        
        if (interview.getJobApplication() != null) {
            if (interview.getJobApplication().getJob() != null) {
                jobTitle = interview.getJobApplication().getJob().getTitle();
            }
            if (interview.getJobApplication().getCandidate() != null && interview.getJobApplication().getCandidate().getUser() != null) {
                User user = interview.getJobApplication().getCandidate().getUser();
                String first = user.getFirstName() != null ? user.getFirstName() : "";
                String last = user.getLastName() != null ? user.getLastName() : "";
                candidateName = (first + " " + last).trim();
            }
        }

        return InterviewDto.builder()
                .id(interview.getId())
                .jobApplicationId(interview.getJobApplication() != null ? interview.getJobApplication().getId() : null)
                .jobTitle(jobTitle)
                .candidateName(candidateName)
                .title(interview.getTitle())
                .scheduledAt(interview.getScheduledAt())
                .durationMinutes(interview.getDurationMinutes())
                .location(interview.getLocation())
                .notes(interview.getNotes())
                .status(interview.getStatus().name())
                .aiQuestions(interview.getAiQuestions())
                .build();
    }
}
