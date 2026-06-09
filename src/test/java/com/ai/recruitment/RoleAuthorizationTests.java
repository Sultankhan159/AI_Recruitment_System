package com.ai.recruitment;

import com.ai.recruitment.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class RoleAuthorizationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.ai.recruitment.repository.CandidateRepository candidateRepository;

    @Autowired
    private com.ai.recruitment.repository.EducationRepository educationRepository;

    @Autowired
    private com.ai.recruitment.repository.ExperienceRepository experienceRepository;

    @Autowired
    private com.ai.recruitment.repository.CandidateSkillRepository candidateSkillRepository;

    @Autowired
    private com.ai.recruitment.repository.CertificationRepository certificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String candidateToken;
    private String recruiterToken;
    private String adminToken;

    @BeforeEach
    public void setup() throws Exception {
        certificationRepository.deleteAll();
        candidateSkillRepository.deleteAll();
        experienceRepository.deleteAll();
        educationRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.deleteAll();

        // Register and Login Candidate
        registerAndLogin("candidate@test.com", "candidate", "candidateToken");
        // Register and Login Recruiter
        registerAndLogin("recruiter@test.com", "recruiter", "recruiterToken");
        // Register and Login Admin
        registerAndLogin("admin@test.com", "admin", "adminToken");
    }

    private void registerAndLogin(String email, String role, String tokenTarget) throws Exception {
        // Register
        Map<String, Object> signup = new HashMap<>();
        signup.put("email", email);
        signup.put("password", "password123");
        signup.put("firstName", "Test");
        signup.put("lastName", role);
        signup.put("role", List.of(role));

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk());

        // Login
        Map<String, Object> signin = new HashMap<>();
        signin.put("email", email);
        signin.put("password", "password123");

        MvcResult result = mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signin)))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        Map<?, ?> responseMap = objectMapper.readValue(responseContent, Map.class);
        String token = (String) responseMap.get("token");

        if ("candidateToken".equals(tokenTarget)) {
            this.candidateToken = token;
        } else if ("recruiterToken".equals(tokenTarget)) {
            this.recruiterToken = token;
        } else if ("adminToken".equals(tokenTarget)) {
            this.adminToken = token;
        }
    }

    @Test
    public void testRoleBasedAuthorization() throws Exception {
        // 1. Candidate Access Tests
        // Candidate token -> Candidate profile: expect 200 OK
        mockMvc.perform(get("/api/candidate/profile")
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk());

        // Candidate token -> Recruiter candidates: expect 403 Forbidden
        mockMvc.perform(get("/api/recruiter/candidates")
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isForbidden());

        // Candidate token -> Admin stats: expect 403 Forbidden
        mockMvc.perform(get("/api/admin/system-stats")
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isForbidden());

        // 2. Recruiter Access Tests
        // Recruiter token -> Candidate profile: expect 200 OK
        mockMvc.perform(get("/api/candidate/profile")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk());

        // Recruiter token -> Recruiter candidates: expect 200 OK
        mockMvc.perform(get("/api/recruiter/candidates")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk());

        // Recruiter token -> Admin stats: expect 403 Forbidden
        mockMvc.perform(get("/api/admin/system-stats")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isForbidden());

        // 3. Admin Access Tests
        // Admin token -> Candidate profile: expect 200 OK
        mockMvc.perform(get("/api/candidate/profile")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Admin token -> Recruiter candidates: expect 200 OK
        mockMvc.perform(get("/api/recruiter/candidates")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Admin token -> Admin stats: expect 200 OK
        mockMvc.perform(get("/api/admin/system-stats")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}
