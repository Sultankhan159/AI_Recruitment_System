package com.ai.recruitment.repository;

import com.ai.recruitment.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUserEmail(String email);
    Optional<Candidate> findByUserId(Long userId);
}
