package com.ai.recruitment.repository;

import com.ai.recruitment.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByJobApplicationId(Long jobApplicationId);
    List<Interview> findByJobApplicationCandidateId(Long candidateId);
}
