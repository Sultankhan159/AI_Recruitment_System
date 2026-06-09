package com.ai.recruitment.payload.request;

import lombok.Getter;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
public class SignupRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private Set<String> role;
}
