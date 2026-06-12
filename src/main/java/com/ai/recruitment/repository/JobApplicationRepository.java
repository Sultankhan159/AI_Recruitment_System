package com.ai.recruitment.repository;

import com.ai.recruitment.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByCandidateId(Long candidateId);
    List<JobApplication> findByJobId(Long jobId);
    List<JobApplication> findByJobPostedById(Long recruiterId);
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);
}
