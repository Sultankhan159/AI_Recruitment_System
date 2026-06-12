package com.ai.recruitment.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String jobLocation;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private LocalDateTime appliedAt;
    private String status;
    private String resumeUrl;
    private Double matchScore;
    private String aiSummary;
}
