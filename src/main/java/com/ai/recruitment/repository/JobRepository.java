package com.ai.recruitment.repository;

import com.ai.recruitment.model.Job;
import com.ai.recruitment.model.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(JobStatus status);
    List<Job> findByPostedById(Long recruiterId);
}
