package com.ai.recruitment.service;

import com.ai.recruitment.dto.JobDto;
import com.ai.recruitment.dto.RecommendationDto;
import com.ai.recruitment.model.*;
import com.ai.recruitment.repository.CandidateRepository;
import com.ai.recruitment.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecommendationService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private JobService jobService;

    @Autowired
    private AiService aiService;

    @Transactional(readOnly = true)
    public List<RecommendationDto> getJobRecommendations(Long candidateUserId) {
        Candidate candidate = candidateRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found."));

        // Get all open jobs
        List<JobDto> openJobs = jobService.getAllOpenJobs();

        // Get jobs candidate has already applied to
        List<JobApplication> existingApps = jobApplicationRepository.findByCandidateId(candidate.getId());
        Set<Long> appliedJobIds = existingApps.stream()
                .map(app -> app.getJob().getId())
                .collect(Collectors.toSet());

        // Filter out jobs already applied to
        List<JobDto> eligibleJobs = openJobs.stream()
                .filter(job -> !appliedJobIds.contains(job.getId()))
                .collect(Collectors.toList());

        if (eligibleJobs.isEmpty()) {
            return new ArrayList<>();
        }

        // Build candidate profile text
        String candidateProfileText = getCandidateProfileText(candidate);

        // Get match rankings from AI Service
        List<Map<String, Object>> rankings = aiService.recommendJobs(candidateProfileText, eligibleJobs);

        // Map rankings to Recommendation DTOs
        List<RecommendationDto> recommendations = new ArrayList<>();
        for (JobDto job : eligibleJobs) {
            // Find match details in rankings
            Optional<Map<String, Object>> rankOpt = rankings.stream()
                    .filter(rank -> rank.containsKey("jobId") && ((Number) rank.get("jobId")).longValue() == job.getId())
                    .findFirst();

            Double score = 50.0;
            String explanation = "Standard match score based on active profile details.";

            if (rankOpt.isPresent()) {
                Map<String, Object> rank = rankOpt.get();
                if (rank.containsKey("matchScore")) {
                    score = ((Number) rank.get("matchScore")).doubleValue();
                }
                if (rank.containsKey("explanation")) {
                    explanation = (String) rank.get("explanation");
                }
            }

            recommendations.add(RecommendationDto.builder()
                    .job(job)
                    .matchScore(score)
                    .explanation(explanation)
                    .build());
        }

        // Sort by match score descending
        recommendations.sort((r1, r2) -> Double.compare(r2.getMatchScore(), r1.getMatchScore()));

        return recommendations;
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
                  .append(" from ").append(edu.getInstitution()).append("\n");
            }
            sb.append("\n");
        }
        if (candidate.getExperience() != null && !candidate.getExperience().isEmpty()) {
            sb.append("Experience:\n");
            for (Experience exp : candidate.getExperience()) {
                sb.append("- ").append(exp.getTitle()).append(" at ").append(exp.getCompany()).append("\n");
                if (exp.getDescription() != null) {
                    sb.append("  Description: ").append(exp.getDescription()).append("\n");
                }
            }
            sb.append("\n");
        }
        return sb.toString();
    }
}
