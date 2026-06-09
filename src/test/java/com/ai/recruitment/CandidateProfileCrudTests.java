package com.ai.recruitment;

import com.ai.recruitment.dto.*;
import com.ai.recruitment.model.*;
import com.ai.recruitment.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CandidateProfileCrudTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private CandidateSkillRepository candidateSkillRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    public void setup() throws Exception {
        // Clear database tables in logical dependency order
        certificationRepository.deleteAll();
        candidateSkillRepository.deleteAll();
        experienceRepository.deleteAll();
        educationRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Signup test candidate user
        Map<String, Object> signupRequest = new HashMap<>();
        signupRequest.put("email", "candidate.test@example.com");
        signupRequest.put("password", "testpassword");
        signupRequest.put("firstName", "Candidate");
        signupRequest.put("lastName", "Test");
        signupRequest.put("role", Collections.singleton("candidate"));

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // 2. Signin to obtain JWT token
        Map<String, Object> signinRequest = new HashMap<>();
        signinRequest.put("email", "candidate.test@example.com");
        signinRequest.put("password", "testpassword");

        MvcResult result = mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signinRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        Map<?, ?> responseMap = objectMapper.readValue(responseContent, Map.class);
        token = (String) responseMap.get("token");
        assertNotNull(token);
    }

    @Test
    public void testCandidateProfileFullCrud() throws Exception {
        // 1. GET profile initially - should get/create blank profile
        MvcResult profileResult = mockMvc.perform(get("/api/candidate/profile")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        CandidateDto profile = objectMapper.readValue(profileResult.getResponse().getContentAsString(), CandidateDto.class);
        assertNotNull(profile);
        assertEquals("candidate.test@example.com", profile.getEmail());
        assertTrue(profile.getEducation().isEmpty());

        // 2. PUT profile details
        profile.setPhone("1234567890");
        profile.setSummary("Experienced Software Developer specializing in Spring Boot.");
        profile.setResumeUrl("http://example.com/resume.pdf");

        MvcResult updateResult = mockMvc.perform(put("/api/candidate/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profile)))
                .andExpect(status().isOk())
                .andReturn();

        CandidateDto updatedProfile = objectMapper.readValue(updateResult.getResponse().getContentAsString(), CandidateDto.class);
        assertEquals("1234567890", updatedProfile.getPhone());
        assertEquals("Experienced Software Developer specializing in Spring Boot.", updatedProfile.getSummary());
        assertEquals("http://example.com/resume.pdf", updatedProfile.getResumeUrl());

        // 3. POST new Education
        EducationDto eduDto = EducationDto.builder()
                .institution("State University")
                .degree("Bachelor of Science")
                .fieldOfStudy("Computer Science")
                .startDate(LocalDate.of(2018, 9, 1))
                .endDate(LocalDate.of(2022, 6, 1))
                .grade("3.8")
                .build();

        MvcResult eduPostResult = mockMvc.perform(post("/api/candidate/education")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(eduDto)))
                .andExpect(status().isOk())
                .andReturn();

        EducationDto createdEdu = objectMapper.readValue(eduPostResult.getResponse().getContentAsString(), EducationDto.class);
        assertNotNull(createdEdu.getId());
        assertEquals("State University", createdEdu.getInstitution());

        // 4. PUT update Education
        createdEdu.setGrade("3.9");
        MvcResult eduPutResult = mockMvc.perform(put("/api/candidate/education/" + createdEdu.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createdEdu)))
                .andExpect(status().isOk())
                .andReturn();

        EducationDto updatedEdu = objectMapper.readValue(eduPutResult.getResponse().getContentAsString(), EducationDto.class);
        assertEquals("3.9", updatedEdu.getGrade());

        // 5. POST new Experience
        ExperienceDto expDto = ExperienceDto.builder()
                .company("Tech Corp")
                .title("Software Engineer")
                .location("New York")
                .startDate(LocalDate.of(2022, 7, 1))
                .current(true)
                .description("Developing robust microservices.")
                .build();

        MvcResult expPostResult = mockMvc.perform(post("/api/candidate/experience")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(expDto)))
                .andExpect(status().isOk())
                .andReturn();

        ExperienceDto createdExp = objectMapper.readValue(expPostResult.getResponse().getContentAsString(), ExperienceDto.class);
        assertNotNull(createdExp.getId());
        assertEquals("Tech Corp", createdExp.getCompany());
        assertTrue(createdExp.isCurrent());

        // 6. PUT update Experience
        createdExp.setCurrent(false);
        createdExp.setEndDate(LocalDate.of(2025, 12, 31));
        MvcResult expPutResult = mockMvc.perform(put("/api/candidate/experience/" + createdExp.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createdExp)))
                .andExpect(status().isOk())
                .andReturn();

        ExperienceDto updatedExp = objectMapper.readValue(expPutResult.getResponse().getContentAsString(), ExperienceDto.class);
        assertFalse(updatedExp.isCurrent());
        assertEquals(LocalDate.of(2025, 12, 31), updatedExp.getEndDate());

        // 7. POST new Skill
        CandidateSkillDto skillDto = CandidateSkillDto.builder()
                .name("Java")
                .proficiencyLevel("Expert")
                .build();

        MvcResult skillPostResult = mockMvc.perform(post("/api/candidate/skills")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(skillDto)))
                .andExpect(status().isOk())
                .andReturn();

        CandidateSkillDto createdSkill = objectMapper.readValue(skillPostResult.getResponse().getContentAsString(), CandidateSkillDto.class);
        assertNotNull(createdSkill.getId());
        assertEquals("Java", createdSkill.getName());

        // 8. POST new Certification
        CertificationDto certDto = CertificationDto.builder()
                .name("AWS Developer Associate")
                .issuingOrganization("Amazon Web Services")
                .issueDate(LocalDate.of(2023, 5, 15))
                .credentialId("AWS-12345")
                .credentialUrl("http://aws.amazon.com/verify")
                .build();

        MvcResult certPostResult = mockMvc.perform(post("/api/candidate/certifications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(certDto)))
                .andExpect(status().isOk())
                .andReturn();

        CertificationDto createdCert = objectMapper.readValue(certPostResult.getResponse().getContentAsString(), CertificationDto.class);
        assertNotNull(createdCert.getId());
        assertEquals("AWS Developer Associate", createdCert.getName());

        // 9. PUT update Certification
        createdCert.setExpirationDate(LocalDate.of(2026, 5, 15));
        MvcResult certPutResult = mockMvc.perform(put("/api/candidate/certifications/" + createdCert.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createdCert)))
                .andExpect(status().isOk())
                .andReturn();

        CertificationDto updatedCert = objectMapper.readValue(certPutResult.getResponse().getContentAsString(), CertificationDto.class);
        assertEquals(LocalDate.of(2026, 5, 15), updatedCert.getExpirationDate());

        // Verify all sub-modules are populated in profile GET
        profileResult = mockMvc.perform(get("/api/candidate/profile")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        profile = objectMapper.readValue(profileResult.getResponse().getContentAsString(), CandidateDto.class);
        assertEquals(1, profile.getEducation().size());
        assertEquals(1, profile.getExperience().size());
        assertEquals(1, profile.getSkills().size());
        assertEquals(1, profile.getCertifications().size());

        // 10. DELETE Education, Experience, Skill, Certification
        mockMvc.perform(delete("/api/candidate/education/" + createdEdu.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/candidate/experience/" + createdExp.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/candidate/skills/" + createdSkill.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/candidate/certifications/" + createdCert.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Verify profile is empty again
        profileResult = mockMvc.perform(get("/api/candidate/profile")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        profile = objectMapper.readValue(profileResult.getResponse().getContentAsString(), CandidateDto.class);
        assertTrue(profile.getEducation().isEmpty());
        assertTrue(profile.getExperience().isEmpty());
        assertTrue(profile.getSkills().isEmpty());
        assertTrue(profile.getCertifications().isEmpty());
    }
}
