package com.ai.recruitment.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String summary;
    private String resumeUrl;
    private List<EducationDto> education;
    private List<ExperienceDto> experience;
    private List<CandidateSkillDto> skills;
    private List<CertificationDto> certifications;
}
