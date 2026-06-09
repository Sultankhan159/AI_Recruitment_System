package com.ai.recruitment;

import com.ai.recruitment.model.User;
import com.ai.recruitment.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTests {

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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        certificationRepository.deleteAll();
        candidateSkillRepository.deleteAll();
        experienceRepository.deleteAll();
        educationRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void testSignupAndSigninFlow() throws Exception {
        // 1. Signup test
        Map<String, Object> signupRequest = new HashMap<>();
        signupRequest.put("email", "john.doe@example.com");
        signupRequest.put("password", "johnspassword");
        signupRequest.put("firstName", "John");
        signupRequest.put("lastName", "Doe");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Verify user exists in database and password is encrypted
        Optional<User> userOpt = userRepository.findByEmail("john.doe@example.com");
        assertTrue(userOpt.isPresent());
        User user = userOpt.get();
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertNotEquals("johnspassword", user.getPassword());
        assertTrue(passwordEncoder.matches("johnspassword", user.getPassword()));

        // 2. Signin test
        Map<String, Object> signinRequest = new HashMap<>();
        signinRequest.put("email", "john.doe@example.com");
        signinRequest.put("password", "johnspassword");

        MvcResult result = mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signinRequest)))
                .andExpect(status().isOk())
                .andReturn();

        // Extract token
        String responseContent = result.getResponse().getContentAsString();
        Map<?, ?> responseMap = objectMapper.readValue(responseContent, Map.class);
        String token = (String) responseMap.get("token");
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // 3. Test secured endpoint Access (TestController)
        // Without token: expect 401 Unauthorized
        mockMvc.perform(get("/api/test/candidate"))
                .andExpect(status().isUnauthorized());

        // With token: expect 200 OK
        mockMvc.perform(get("/api/test/candidate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
