package com.ai.recruitment.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDto {
    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String location;
    private String salary;
    private String status;
    private Long recruiterId;
    private String recruiterName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
