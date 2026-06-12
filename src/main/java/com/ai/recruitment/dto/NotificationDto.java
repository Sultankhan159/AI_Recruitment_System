package com.ai.recruitment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String message;
    
    @JsonProperty("isRead")
    private boolean isRead;
    
    private String type;
    private LocalDateTime createdAt;
}
