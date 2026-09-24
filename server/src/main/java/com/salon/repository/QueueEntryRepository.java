package com.salon.repository;

import com.salon.model.QueueEntry;
import com.salon.model.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {

    List<QueueEntry> findBySalonIdAndStatusOrderByCreatedAtAsc(Long salonId, QueueStatus status);

    List<QueueEntry> findBySalonIdAndStatusInOrderByCreatedAtAsc(Long salonId, List<QueueStatus> statuses);

    Optional<QueueEntry> findByVerificationCodeIgnoreCase(String verificationCode);

    long countBySalonIdAndStatus(Long salonId, QueueStatus status);

    List<QueueEntry> findBySalonIdOrderByCreatedAtDesc(Long salonId);
}
