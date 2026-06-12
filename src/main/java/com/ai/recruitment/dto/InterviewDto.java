package com.ai.recruitment.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewDto {
    private Long id;
    private Long jobApplicationId;
    private String jobTitle;
    private String candidateName;
    private String title;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String location;
    private String notes;
    private String status;
    private String aiQuestions;
}
