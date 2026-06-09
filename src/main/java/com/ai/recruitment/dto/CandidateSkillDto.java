package com.ai.recruitment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSkillDto {
    private Long id;
    private String name;
    private String proficiencyLevel;
}
