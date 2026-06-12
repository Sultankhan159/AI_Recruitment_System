package com.ai.recruitment.service;

import com.ai.recruitment.dto.*;
import com.ai.recruitment.model.*;
import com.ai.recruitment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Transactional
public class CandidateProfileService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private CandidateSkillRepository candidateSkillRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    public CandidateDto getOrCreateCandidateProfile(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                    Candidate newCandidate = Candidate.builder()
                            .user(user)
                            .education(new ArrayList<>())
                            .experience(new ArrayList<>())
                            .skills(new ArrayList<>())
                            .certifications(new ArrayList<>())
                            .build();
                    return candidateRepository.save(newCandidate);
                });
        return mapToCandidateDto(candidate);
    }

    public CandidateDto updateCandidateProfile(Long userId, CandidateDto candidateDto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                    return Candidate.builder().user(user).build();
                });

        candidate.setPhone(candidateDto.getPhone());
        candidate.setSummary(candidateDto.getSummary());
        candidate.setResumeUrl(candidateDto.getResumeUrl());

        Candidate saved = candidateRepository.save(candidate);
        return mapToCandidateDto(saved);
    }

    // Education CRUD
    public EducationDto addEducation(Long userId, EducationDto educationDto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Education education = Education.builder()
                .candidate(candidate)
                .institution(educationDto.getInstitution())
                .degree(educationDto.getDegree())
                .fieldOfStudy(educationDto.getFieldOfStudy())
                .startDate(educationDto.getStartDate())
                .endDate(educationDto.getEndDate())
                .grade(educationDto.getGrade())
                .build();

        Education saved = educationRepository.save(education);
        candidate.getEducation().add(saved);
        return mapToEducationDto(saved);
    }

    public EducationDto updateEducation(Long userId, Long educationId, EducationDto educationDto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new RuntimeException("Education not found"));

        if (!education.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized update request");
        }

        education.setInstitution(educationDto.getInstitution());
        education.setDegree(educationDto.getDegree());
        education.setFieldOfStudy(educationDto.getFieldOfStudy());
        education.setStartDate(educationDto.getStartDate());
        education.setEndDate(educationDto.getEndDate());
        education.setGrade(educationDto.getGrade());

        Education saved = educationRepository.save(education);
        return mapToEducationDto(saved);
    }

    public void deleteEducation(Long userId, Long educationId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new RuntimeException("Education not found"));

        if (!education.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized delete request");
        }

        educationRepository.delete(education);
    }

    // Experience CRUD
    public ExperienceDto addExperience(Long userId, ExperienceDto experienceDto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Experience experience = Experience.builder()
                .candidate(candidate)
                .company(experienceDto.getCompany())
                .title(experienceDto.getTitle())
                .location(experienceDto.getLocation())
                .startDate(experienceDto.getStartDate())
                .endDate(experienceDto.getEndDate())
                .current(experienceDto.isCurrent())
                .description(experienceDto.getDescription())
                .build();

        Experience saved = experienceRepository.save(experience);
        candidate.getExperience().add(saved);
        return mapToExperienceDto(saved);
    }

    public ExperienceDto updateExperience(Long userId, Long experienceId, ExperienceDto experienceDto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        if (!experience.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized update request");
        }

        experience.setCompany(experienceDto.getCompany());
        experience.setTitle(experienceDto.getTitle());
        experience.setLocation(experienceDto.getLocation());
        experience.setStartDate(experienceDto.getStartDate());
        experience.setEndDate(experienceDto.getEndDate());
        experience.setCurrent(experienceDto.isCurrent());
        experience.setDescription(experienceDto.getDescription());

        Experience saved = experienceRepository.save(experience);
        return mapToExperienceDto(saved);
    }

    public void deleteExperience(Long userId, Long experienceId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        if (!experience.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized delete request");
        }

        experienceRepository.delete(experience);
    }

    // Skills CRUD
    public CandidateSkillDto addSkill(Long userId, CandidateSkillDto skillDto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        CandidateSkill skill = CandidateSkill.builder()
                .candidate(candidate)
                .name(skillDto.getName())
                .proficiencyLevel(skillDto.getProficiencyLevel())
                .build();

        CandidateSkill saved = candidateSkillRepository.save(skill);
        candidate.getSkills().add(saved);
        return mapToSkillDto(saved);
    }

    public void deleteSkill(Long userId, Long skillId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        CandidateSkill skill = candidateSkillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        if (!skill.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized delete request");
        }

        candidateSkillRepository.delete(skill);
    }

    // Certification CRUD
    public CertificationDto addCertification(Long userId, CertificationDto certificationDto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Certification certification = Certification.builder()
                .candidate(candidate)
                .name(certificationDto.getName())
                .issuingOrganization(certificationDto.getIssuingOrganization())
                .issueDate(certificationDto.getIssueDate())
                .expirationDate(certificationDto.getExpirationDate())
                .credentialId(certificationDto.getCredentialId())
                .credentialUrl(certificationDto.getCredentialUrl())
                .build();

        Certification saved = certificationRepository.save(certification);
        candidate.getCertifications().add(saved);
        return mapToCertificationDto(saved);
    }

    public CertificationDto updateCertification(Long userId, Long certificationId, CertificationDto certificationDto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        if (!certification.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized update request");
        }

        certification.setName(certificationDto.getName());
        certification.setIssuingOrganization(certificationDto.getIssuingOrganization());
        certification.setIssueDate(certificationDto.getIssueDate());
        certification.setExpirationDate(certificationDto.getExpirationDate());
        certification.setCredentialId(certificationDto.getCredentialId());
        certification.setCredentialUrl(certificationDto.getCredentialUrl());

        Certification saved = certificationRepository.save(certification);
        return mapToCertificationDto(saved);
    }

    public void deleteCertification(Long userId, Long certificationId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        if (!certification.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized delete request");
        }

        certificationRepository.delete(certification);
    }

    // Helper mappings
    private CandidateDto mapToCandidateDto(Candidate candidate) {
        return CandidateDto.builder()
                .id(candidate.getId())
                .email(candidate.getUser().getEmail())
                .firstName(candidate.getUser().getFirstName())
                .lastName(candidate.getUser().getLastName())
                .phone(candidate.getPhone())
                .summary(candidate.getSummary())
                .resumeUrl(candidate.getResumeUrl())
                .education(candidate.getEducation().stream().map(this::mapToEducationDto).collect(Collectors.toList()))
                .experience(candidate.getExperience().stream().map(this::mapToExperienceDto).collect(Collectors.toList()))
                .skills(candidate.getSkills().stream().map(this::mapToSkillDto).collect(Collectors.toList()))
                .certifications(candidate.getCertifications().stream().map(this::mapToCertificationDto).collect(Collectors.toList()))
                .build();
    }

    private EducationDto mapToEducationDto(Education education) {
        return EducationDto.builder()
                .id(education.getId())
                .institution(education.getInstitution())
                .degree(education.getDegree())
                .fieldOfStudy(education.getFieldOfStudy())
                .startDate(education.getStartDate())
                .endDate(education.getEndDate())
                .grade(education.getGrade())
                .build();
    }

    private ExperienceDto mapToExperienceDto(Experience experience) {
        return ExperienceDto.builder()
                .id(experience.getId())
                .company(experience.getCompany())
                .title(experience.getTitle())
                .location(experience.getLocation())
                .startDate(experience.getStartDate())
                .endDate(experience.getEndDate())
                .current(experience.isCurrent())
                .description(experience.getDescription())
                .build();
    }

    private CandidateSkillDto mapToSkillDto(CandidateSkill skill) {
        return CandidateSkillDto.builder()
                .id(skill.getId())
                .name(skill.getName())
                .proficiencyLevel(skill.getProficiencyLevel())
                .build();
    }

    private CertificationDto mapToCertificationDto(Certification certification) {
        return CertificationDto.builder()
                .id(certification.getId())
                .name(certification.getName())
                .issuingOrganization(certification.getIssuingOrganization())
                .issueDate(certification.getIssueDate())
                .expirationDate(certification.getExpirationDate())
                .credentialId(certification.getCredentialId())
                .credentialUrl(certification.getCredentialUrl())
                .build();
    }
}
