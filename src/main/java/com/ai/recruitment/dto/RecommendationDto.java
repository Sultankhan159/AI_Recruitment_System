package com.ai.recruitment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDto {
    private JobDto job;
    private Double matchScore;
    private String explanation;
}
