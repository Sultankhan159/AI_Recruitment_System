package com.ai.recruitment.service;

import com.ai.recruitment.dto.JobDto;
import com.ai.recruitment.model.Job;
import com.ai.recruitment.model.JobStatus;
import com.ai.recruitment.model.User;
import com.ai.recruitment.repository.JobRepository;
import com.ai.recruitment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    public JobDto createJob(Long recruiterId, JobDto jobDto) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter not found with id: " + recruiterId));

        Job job = Job.builder()
                .title(jobDto.getTitle())
                .description(jobDto.getDescription())
                .requirements(jobDto.getRequirements())
                .location(jobDto.getLocation())
                .salary(jobDto.getSalary())
                .postedBy(recruiter)
                .status(JobStatus.OPEN)
                .build();

        Job saved = jobRepository.save(job);
        return mapToDto(saved);
    }

    public JobDto updateJob(Long recruiterId, Long jobId, JobDto jobDto) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        if (!job.getPostedBy().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to update this job listing");
        }

        job.setTitle(jobDto.getTitle());
        job.setDescription(jobDto.getDescription());
        job.setRequirements(jobDto.getRequirements());
        job.setLocation(jobDto.getLocation());
        job.setSalary(jobDto.getSalary());
        
        if (jobDto.getStatus() != null) {
            try {
                job.setStatus(JobStatus.valueOf(jobDto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid status value
            }
        }

        Job saved = jobRepository.save(job);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<JobDto> getAllOpenJobs() {
        return jobRepository.findByStatus(JobStatus.OPEN).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDto getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        return mapToDto(job);
    }

    @Transactional(readOnly = true)
    public List<JobDto> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByPostedById(recruiterId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteJob(Long recruiterId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        if (!job.getPostedBy().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized to delete this job listing");
        }

        jobRepository.delete(job);
    }

    public JobDto mapToDto(Job job) {
        String recruiterName = "";
        if (job.getPostedBy() != null) {
            String first = job.getPostedBy().getFirstName() != null ? job.getPostedBy().getFirstName() : "";
            String last = job.getPostedBy().getLastName() != null ? job.getPostedBy().getLastName() : "";
            recruiterName = (first + " " + last).trim();
        }
        return JobDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .location(job.getLocation())
                .salary(job.getSalary())
                .status(job.getStatus().name())
                .recruiterId(job.getPostedBy() != null ? job.getPostedBy().getId() : null)
                .recruiterName(recruiterName)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
